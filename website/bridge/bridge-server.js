const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Import queue manager for batch processing
const QueueManager = require('./queue/queue-manager');

// Import exporters
const CSVExporter = require('./export/csv-exporter');
const HubSpotExporter = require('./export/hubspot-exporter');
const SalesforceExporter = require('./export/salesforce-exporter');

const app = express();
const PORT = 3847;
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Initialize queue manager for batch processing
const queueManager = new QueueManager({
    projectRoot: PROJECT_ROOT,
    maxConcurrent: 3,
    dataDir: path.join(__dirname, 'data', 'queues')
});

// Active jobs storage (for single-job mode)
const jobs = new Map();

// Batch SSE clients
const batchClients = new Map(); // batchId -> Set of response objects

// Generate unique job ID
function generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sanitize domain for folder name
function sanitizeDomain(domain) {
    return domain.replace(/\./g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}

// Validate domain format
function isValidDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
}

// CORS for local development
app.use(cors());
app.use(express.json());

// Serve the prospect-research tool
app.use('/tool', express.static(path.join(PROJECT_ROOT, 'tools/prospect-research')));

// Serve static assets from root for CSS/JS includes
app.use('/styles.css', express.static(path.join(PROJECT_ROOT, 'styles.css')));
app.use('/script.js', express.static(path.join(PROJECT_ROOT, 'script.js')));
app.use('/tools/tools.css', express.static(path.join(PROJECT_ROOT, 'tools/tools.css')));
app.use('/images', express.static(path.join(PROJECT_ROOT, 'images')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// ============================================================================
// SINGLE JOB ENDPOINTS (existing functionality)
// ============================================================================

// Start a new research job
app.post('/api/research', (req, res) => {
    const { domain } = req.body;

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }

    if (!isValidDomain(domain)) {
        return res.status(400).json({ error: 'Invalid domain format' });
    }

    const jobId = generateJobId();
    const sanitizedDomain = sanitizeDomain(domain);

    console.log(`[${jobId}] Starting research for: ${domain}`);

    // Build the prompt to invoke the /prospect skill
    const prompt = `Run the /prospect skill for ${domain}. This skill is defined in .claude/skills/prospect/skill.md. Execute all phases and generate the research report and PDF.`;

    // Spawn Claude CLI with proper argument order
    const claude = spawn('claude', [
        '-p',
        '--output-format', 'stream-json',
        prompt
    ], {
        cwd: PROJECT_ROOT,
        env: { ...process.env }
    });

    const job = {
        id: jobId,
        domain,
        sanitizedDomain,
        process: claude,
        status: 'running',
        output: [],
        phases: {
            1: 'pending',
            2: 'pending',
            3: 'pending',
            4: 'pending',
            5: 'pending',
            6: 'pending',
            7: 'pending',
            8: 'pending'
        },
        startTime: Date.now(),
        clients: new Set()
    };

    jobs.set(jobId, job);

    // Handle stdout
    claude.stdout.on('data', (data) => {
        const text = data.toString();
        job.output.push({ type: 'stdout', text, timestamp: Date.now() });

        // Detect phases from output
        detectPhase(job, text);

        // Broadcast to SSE clients
        broadcastToClients(job, { type: 'log', text });
    });

    // Handle stderr
    claude.stderr.on('data', (data) => {
        const text = data.toString();
        job.output.push({ type: 'stderr', text, timestamp: Date.now() });
        broadcastToClients(job, { type: 'error', text });
    });

    // Handle completion
    claude.on('close', (code) => {
        job.status = code === 0 ? 'complete' : 'error';
        job.endTime = Date.now();
        job.exitCode = code;

        console.log(`[${jobId}] Research ${job.status} (exit code: ${code})`);

        // Mark all phases complete if successful
        if (code === 0) {
            Object.keys(job.phases).forEach(p => job.phases[p] = 'complete');
        }

        broadcastToClients(job, {
            type: 'complete',
            status: job.status,
            outputDir: `prospects/${sanitizedDomain}/`,
            duration: job.endTime - job.startTime
        });

        // Clean up after 1 hour
        setTimeout(() => {
            jobs.delete(jobId);
        }, 60 * 60 * 1000);
    });

    // Handle errors
    claude.on('error', (err) => {
        job.status = 'error';
        job.error = err.message;
        console.error(`[${jobId}] Error:`, err);
        broadcastToClients(job, { type: 'error', text: err.message });
    });

    // Set timeout (10 minutes)
    setTimeout(() => {
        if (job.status === 'running') {
            console.log(`[${jobId}] Timeout - killing process`);
            claude.kill();
            job.status = 'timeout';
            broadcastToClients(job, { type: 'error', text: 'Research timed out after 10 minutes' });
        }
    }, 10 * 60 * 1000);

    res.json({ jobId, status: 'started', domain, sanitizedDomain });
});

// Detect which phase we're in based on output text (updated for 8 phases)
function detectPhase(job, text) {
    const lowerText = text.toLowerCase();

    const phasePatterns = [
        { phase: 1, patterns: ['company discovery', 'company overview', 'websearch', 'fetching https://'] },
        { phase: 2, patterns: ['market position', 'competitor', 'g2.com', 'capterra'] },
        { phase: 3, patterns: ['technographic', 'stackshare', 'builtwith', 'tech stack'] },
        { phase: 4, patterns: ['financial', 'funding', 'crunchbase', 'revenue'] },
        { phase: 5, patterns: ['pain point', 'challenges', 'glassdoor', 'job posting'] },
        { phase: 6, patterns: ['contact discovery', 'decision maker', 'linkedin', 'leadership'] },
        { phase: 7, patterns: ['poc recommendation', 'recommending', 'scoring relevance'] },
        { phase: 8, patterns: ['output generation', 'creating', 'writing to', 'prospects/', 'pdf'] }
    ];

    for (const { phase, patterns } of phasePatterns) {
        if (patterns.some(p => lowerText.includes(p))) {
            if (job.phases[phase] === 'pending') {
                job.phases[phase] = 'active';
                // Mark previous phases as complete
                for (let i = 1; i < phase; i++) {
                    if (job.phases[i] !== 'complete') {
                        job.phases[i] = 'complete';
                    }
                }
                broadcastToClients(job, { type: 'phase', phase, status: 'active', phases: job.phases });
            }
            break;
        }
    }
}

// Broadcast message to all SSE clients for a job
function broadcastToClients(job, message) {
    const data = JSON.stringify(message);
    job.clients.forEach(res => {
        res.write(`data: ${data}\n\n`);
    });
}

// SSE stream for job progress
app.get('/api/research/stream', (req, res) => {
    const { jobId } = req.query;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Add client to job's client set
    job.clients.add(res);

    // Send initial state
    res.write(`data: ${JSON.stringify({
        type: 'init',
        status: job.status,
        phases: job.phases,
        domain: job.domain
    })}\n\n`);

    // Send any existing output
    job.output.forEach(entry => {
        res.write(`data: ${JSON.stringify({ type: 'log', text: entry.text })}\n\n`);
    });

    // If already complete, send completion event
    if (job.status === 'complete' || job.status === 'error') {
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            status: job.status,
            outputDir: `prospects/${job.sanitizedDomain}/`
        })}\n\n`);
    }

    // Handle client disconnect
    req.on('close', () => {
        job.clients.delete(res);
    });
});

// Get job status
app.get('/api/research/status', (req, res) => {
    const { jobId } = req.query;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
        jobId: job.id,
        domain: job.domain,
        status: job.status,
        phases: job.phases,
        startTime: job.startTime,
        endTime: job.endTime,
        duration: job.endTime ? job.endTime - job.startTime : Date.now() - job.startTime
    });
});

// ============================================================================
// BATCH PROCESSING ENDPOINTS (new)
// ============================================================================

// Setup queue manager event forwarding to batch SSE clients
queueManager.on('job:start', (data) => broadcastBatchEvent(data.jobId, 'job:start', data));
queueManager.on('job:log', (data) => broadcastBatchEvent(data.jobId, 'job:log', data));
queueManager.on('job:phase', (data) => broadcastBatchEvent(data.jobId, 'job:phase', data));
queueManager.on('job:complete', (data) => broadcastBatchEvent(data.jobId, 'job:complete', data));
queueManager.on('job:failed', (data) => broadcastBatchEvent(data.jobId, 'job:failed', data));
queueManager.on('batch:complete', (data) => broadcastBatchEvent(data.batchId, 'batch:complete', data));

function broadcastBatchEvent(id, eventType, data) {
    // Find which batch this belongs to and broadcast
    for (const [batchId, clients] of batchClients) {
        const message = JSON.stringify({ type: eventType, ...data });
        clients.forEach(res => {
            try {
                res.write(`data: ${message}\n\n`);
            } catch (e) {
                // Client disconnected
            }
        });
    }
}

// Create a new batch
app.post('/api/batch/create', async (req, res) => {
    try {
        const { domains, options } = req.body;

        if (!domains || !Array.isArray(domains) || domains.length === 0) {
            return res.status(400).json({ error: 'domains array is required' });
        }

        if (domains.length > 100) {
            return res.status(400).json({ error: 'Maximum 100 domains per batch' });
        }

        const result = await queueManager.createBatch(domains, options);
        console.log(`[Batch ${result.batchId}] Created with ${result.totalJobs} jobs`);

        res.json(result);
    } catch (error) {
        console.error('Batch creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get batch status
app.get('/api/batch/:batchId/status', (req, res) => {
    const { batchId } = req.params;
    const status = queueManager.getBatchStatus(batchId);

    if (!status) {
        return res.status(404).json({ error: 'Batch not found' });
    }

    res.json(status);
});

// SSE stream for batch progress
app.get('/api/batch/:batchId/stream', (req, res) => {
    const { batchId } = req.params;
    const status = queueManager.getBatchStatus(batchId);

    if (!status) {
        return res.status(404).json({ error: 'Batch not found' });
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Register client
    if (!batchClients.has(batchId)) {
        batchClients.set(batchId, new Set());
    }
    batchClients.get(batchId).add(res);

    // Send initial state
    res.write(`data: ${JSON.stringify({
        type: 'init',
        ...status
    })}\n\n`);

    // Handle disconnect
    req.on('close', () => {
        const clients = batchClients.get(batchId);
        if (clients) {
            clients.delete(res);
            if (clients.size === 0) {
                batchClients.delete(batchId);
            }
        }
    });
});

// Pause batch
app.post('/api/batch/:batchId/pause', (req, res) => {
    const { batchId } = req.params;
    const success = queueManager.pauseBatch(batchId);

    if (success) {
        console.log(`[Batch ${batchId}] Paused`);
        res.json({ status: 'paused', batchId });
    } else {
        res.status(400).json({ error: 'Cannot pause batch (not running)' });
    }
});

// Resume batch
app.post('/api/batch/:batchId/resume', async (req, res) => {
    const { batchId } = req.params;
    const success = await queueManager.resumeBatch(batchId);

    if (success) {
        console.log(`[Batch ${batchId}] Resumed`);
        res.json({ status: 'running', batchId });
    } else {
        res.status(400).json({ error: 'Cannot resume batch (not paused)' });
    }
});

// Retry failed jobs
app.post('/api/batch/:batchId/retry', async (req, res) => {
    const { batchId } = req.params;

    try {
        const count = await queueManager.retryFailed(batchId);
        console.log(`[Batch ${batchId}] Retrying ${count} failed jobs`);
        res.json({ status: 'retrying', batchId, retriedCount: count });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Cancel batch
app.post('/api/batch/:batchId/cancel', (req, res) => {
    const { batchId } = req.params;
    const success = queueManager.cancelBatch(batchId);

    if (success) {
        console.log(`[Batch ${batchId}] Cancelled`);
        res.json({ status: 'cancelled', batchId });
    } else {
        res.status(404).json({ error: 'Batch not found' });
    }
});

// Get batch results
app.get('/api/batch/:batchId/results', (req, res) => {
    const { batchId } = req.params;
    const results = queueManager.getBatchResults(batchId);
    res.json({ batchId, results });
});

// List all batches
app.get('/api/batches', (req, res) => {
    const batches = queueManager.listBatches();
    res.json({ batches });
});

// Delete batch
app.delete('/api/batch/:batchId', (req, res) => {
    const { batchId } = req.params;
    queueManager.deleteBatch(batchId);
    res.json({ status: 'deleted', batchId });
});

// ============================================================================
// EXPORT ENDPOINTS (new)
// ============================================================================

// Export batch results
app.post('/api/batch/:batchId/export', (req, res) => {
    const { batchId } = req.params;
    const { format = 'csv', options = {} } = req.body;

    const results = queueManager.getBatchResults(batchId);

    if (!results || results.length === 0) {
        return res.status(404).json({ error: 'No results found for this batch' });
    }

    try {
        let data, filename, contentType;

        switch (format) {
            case 'csv':
                const csvExporter = new CSVExporter();
                if (options.contactsOnly) {
                    data = csvExporter.exportContacts(results);
                    filename = `batch-${batchId}-contacts.csv`;
                } else {
                    data = csvExporter.export(results, options);
                    filename = `batch-${batchId}-companies.csv`;
                }
                contentType = 'text/csv';
                break;

            case 'hubspot':
                const hubspotExporter = new HubSpotExporter();
                if (options.csvFormat) {
                    data = hubspotExporter.exportCSV(results);
                    filename = `batch-${batchId}-hubspot.csv`;
                    contentType = 'text/csv';
                } else {
                    data = JSON.stringify(hubspotExporter.export(results), null, 2);
                    filename = `batch-${batchId}-hubspot.json`;
                    contentType = 'application/json';
                }
                break;

            case 'salesforce':
                const sfExporter = new SalesforceExporter();
                if (options.objectType === 'accounts') {
                    data = sfExporter.exportAccountsCSV(results);
                    filename = `batch-${batchId}-sf-accounts.csv`;
                    contentType = 'text/csv';
                } else if (options.objectType === 'contacts') {
                    data = sfExporter.exportContactsCSV(results);
                    filename = `batch-${batchId}-sf-contacts.csv`;
                    contentType = 'text/csv';
                } else if (options.objectType === 'leads') {
                    data = sfExporter.exportLeadsCSV(results);
                    filename = `batch-${batchId}-sf-leads.csv`;
                    contentType = 'text/csv';
                } else {
                    data = JSON.stringify(sfExporter.export(results, options), null, 2);
                    filename = `batch-${batchId}-salesforce.json`;
                    contentType = 'application/json';
                }
                break;

            default:
                return res.status(400).json({ error: 'Invalid format. Use: csv, hubspot, salesforce' });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(data);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export specific domains (not from batch)
app.post('/api/export', (req, res) => {
    const { domains, format = 'csv', options = {} } = req.body;

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
        return res.status(400).json({ error: 'domains array is required' });
    }

    // Load data for each domain
    const results = [];
    for (const domain of domains) {
        const sanitized = sanitizeDomain(domain);
        const dataPath = path.join(PROJECT_ROOT, 'prospects', sanitized, 'research-data.json');

        if (fs.existsSync(dataPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                results.push({ domain, data });
            } catch (e) {
                results.push({ domain, error: 'Failed to parse data' });
            }
        } else {
            results.push({ domain, error: 'No data found' });
        }
    }

    try {
        let data, filename, contentType;

        switch (format) {
            case 'csv':
                const csvExporter = new CSVExporter();
                if (options.contactsOnly) {
                    data = csvExporter.exportContacts(results.filter(r => r.data));
                    filename = 'prospect-contacts.csv';
                } else {
                    data = csvExporter.export(results.filter(r => r.data), options);
                    filename = 'prospect-companies.csv';
                }
                contentType = 'text/csv';
                break;

            case 'hubspot':
                const hubspotExporter = new HubSpotExporter();
                data = JSON.stringify(hubspotExporter.export(results.filter(r => r.data)), null, 2);
                filename = 'prospect-hubspot.json';
                contentType = 'application/json';
                break;

            case 'salesforce':
                const sfExporter = new SalesforceExporter();
                data = JSON.stringify(sfExporter.export(results.filter(r => r.data), options), null, 2);
                filename = 'prospect-salesforce.json';
                contentType = 'application/json';
                break;

            default:
                return res.status(400).json({ error: 'Invalid format' });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(data);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get available export formats
app.get('/api/export/formats', (req, res) => {
    res.json({
        formats: [
            {
                id: 'csv',
                name: 'CSV',
                description: 'Comma-separated values for spreadsheets',
                options: {
                    groups: ['company', 'financials', 'technographics', 'contacts', 'painPoints', 'poc'],
                    contactsOnly: 'Export only contacts as separate rows'
                }
            },
            {
                id: 'hubspot',
                name: 'HubSpot',
                description: 'HubSpot CRM import format',
                options: {
                    csvFormat: 'Export as CSV instead of JSON'
                }
            },
            {
                id: 'salesforce',
                name: 'Salesforce',
                description: 'Salesforce Data Loader format',
                options: {
                    objectType: ['accounts', 'contacts', 'leads'],
                    includeLeads: 'Include Lead records in JSON export'
                }
            }
        ]
    });
});

// ============================================================================
// COMPARISON ENDPOINT (new)
// ============================================================================

// Compare multiple companies
app.get('/api/compare', (req, res) => {
    const { domains } = req.query;

    if (!domains) {
        return res.status(400).json({ error: 'domains query param required (comma-separated)' });
    }

    const domainList = domains.split(',').map(d => d.trim());
    const comparison = [];

    for (const domain of domainList) {
        const sanitized = sanitizeDomain(domain);
        const dataPath = path.join(PROJECT_ROOT, 'prospects', sanitized, 'research-data.json');

        if (fs.existsSync(dataPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                comparison.push({ domain, data });
            } catch (e) {
                comparison.push({ domain, error: 'Failed to parse data' });
            }
        } else {
            comparison.push({ domain, error: 'No research data found' });
        }
    }

    res.json({ domains: domainList, comparison });
});

// ============================================================================
// OUTPUT FILE ENDPOINTS (existing)
// ============================================================================

// Serve PDF
app.get('/api/pdf/:domain', (req, res) => {
    const domain = sanitizeDomain(req.params.domain);
    const pdfPath = path.join(PROJECT_ROOT, 'prospects', domain, 'research-report.pdf');

    if (fs.existsSync(pdfPath)) {
        res.sendFile(pdfPath);
    } else {
        res.status(404).json({ error: 'PDF not found. Research may still be in progress.' });
    }
});

// Serve markdown report
app.get('/api/report/:domain', (req, res) => {
    const domain = sanitizeDomain(req.params.domain);
    const mdPath = path.join(PROJECT_ROOT, 'prospects', domain, 'research-report.md');

    if (fs.existsSync(mdPath)) {
        res.type('text/markdown').sendFile(mdPath);
    } else {
        res.status(404).json({ error: 'Report not found. Research may still be in progress.' });
    }
});

// Serve research data JSON
app.get('/api/data/:domain', (req, res) => {
    const domain = sanitizeDomain(req.params.domain);
    const dataPath = path.join(PROJECT_ROOT, 'prospects', domain, 'research-data.json');

    if (fs.existsSync(dataPath)) {
        res.type('application/json').sendFile(dataPath);
    } else {
        res.status(404).json({ error: 'Research data not found.' });
    }
});

// List all output files for a domain
app.get('/api/files/:domain', (req, res) => {
    const domain = sanitizeDomain(req.params.domain);
    const outputDir = path.join(PROJECT_ROOT, 'prospects', domain);

    if (!fs.existsSync(outputDir)) {
        return res.status(404).json({ error: 'Output directory not found' });
    }

    const files = [];

    function walkDir(dir, prefix = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const relativePath = path.join(prefix, entry.name);
            if (entry.isDirectory()) {
                walkDir(path.join(dir, entry.name), relativePath);
            } else {
                files.push(relativePath);
            }
        }
    }

    walkDir(outputDir);
    res.json({ domain, files });
});

// List all researched prospects
app.get('/api/prospects', (req, res) => {
    const prospectsDir = path.join(PROJECT_ROOT, 'prospects');

    if (!fs.existsSync(prospectsDir)) {
        return res.json({ prospects: [] });
    }

    const prospects = fs.readdirSync(prospectsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
            const domain = d.name.replace(/-/g, '.');
            const hasData = fs.existsSync(path.join(prospectsDir, d.name, 'research-data.json'));
            const hasPdf = fs.existsSync(path.join(prospectsDir, d.name, 'research-report.pdf'));
            return { domain, sanitized: d.name, hasData, hasPdf };
        });

    res.json({ prospects });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║         Glue Prospect Research Bridge Server (Enhanced)           ║
╠═══════════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                        ║
║  Open tool at:      http://localhost:${PORT}/tool                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  Single Job Endpoints:                                            ║
║    POST /api/research           - Start single research           ║
║    GET  /api/research/stream    - SSE progress stream             ║
║    GET  /api/pdf/:domain        - Download PDF report             ║
║    GET  /api/report/:domain     - Get markdown report             ║
║    GET  /api/data/:domain       - Get research JSON               ║
╠═══════════════════════════════════════════════════════════════════╣
║  Batch Endpoints:                                                 ║
║    POST /api/batch/create       - Create batch (domains array)    ║
║    GET  /api/batch/:id/status   - Get batch status                ║
║    GET  /api/batch/:id/stream   - SSE batch progress              ║
║    POST /api/batch/:id/pause    - Pause batch                     ║
║    POST /api/batch/:id/resume   - Resume batch                    ║
║    POST /api/batch/:id/retry    - Retry failed jobs               ║
║    GET  /api/batch/:id/results  - Get all results                 ║
║    GET  /api/batches            - List all batches                ║
╠═══════════════════════════════════════════════════════════════════╣
║  Utility Endpoints:                                               ║
║    GET  /api/compare?domains=   - Compare multiple companies      ║
║    GET  /api/prospects          - List all researched prospects   ║
╚═══════════════════════════════════════════════════════════════════╝
`);
});
