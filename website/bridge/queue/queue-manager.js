/**
 * QueueManager - Batch job queue management with persistence
 * Handles batch creation, job scheduling, pause/resume, and progress tracking
 */

const EventEmitter = require('events');
const QueueStore = require('./queue-store');
const JobRunner = require('./job-runner');
const path = require('path');

class QueueManager extends EventEmitter {
    constructor(options = {}) {
        super();

        this.store = new QueueStore(options.dataDir);
        this.runner = new JobRunner({
            projectRoot: options.projectRoot || path.resolve(__dirname, '..', '..'),
            maxConcurrent: options.maxConcurrent || 3,
            rateLimit: options.rateLimit || 2000,
            timeout: options.timeout || 10 * 60 * 1000
        });

        this.batches = new Map(); // Active batch state
        this.jobQueue = []; // Pending jobs to process
        this.isProcessing = false;

        // Forward runner events
        this.setupRunnerEvents();

        // Restore any interrupted batches on startup
        this.restoreState();
    }

    /**
     * Setup event forwarding from job runner
     */
    setupRunnerEvents() {
        this.runner.on('job:start', (data) => this.emit('job:start', data));
        this.runner.on('job:log', (data) => this.emit('job:log', data));
        this.runner.on('job:phase', (data) => this.emit('job:phase', data));
        this.runner.on('job:complete', (data) => this.handleJobComplete(data));
        this.runner.on('job:failed', (data) => this.handleJobFailed(data));
        this.runner.on('job:retry', (data) => this.emit('job:retry', data));
    }

    /**
     * Generate unique IDs
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create a new batch of research jobs
     * @param {string[]} domains - List of domains to research
     * @param {Object} options - Batch options
     * @returns {Object} - Batch info
     */
    async createBatch(domains, options = {}) {
        const batchId = this.generateId('batch');

        // Validate and dedupe domains
        const validDomains = [...new Set(domains)]
            .map(d => d.trim().toLowerCase())
            .filter(d => this.isValidDomain(d));

        if (validDomains.length === 0) {
            throw new Error('No valid domains provided');
        }

        // Create jobs for each domain
        const jobs = validDomains.map((domain, index) => ({
            id: this.generateId('job'),
            batchId,
            domain,
            status: 'pending',
            order: index,
            retries: 0,
            startedAt: null,
            completedAt: null,
            error: null
        }));

        // Create batch state
        const batch = {
            id: batchId,
            status: 'created',
            createdAt: new Date().toISOString(),
            totalJobs: jobs.length,
            completedJobs: 0,
            failedJobs: 0,
            options: {
                maxConcurrent: options.maxConcurrent || 3,
                autoStart: options.autoStart !== false
            }
        };

        // Save to store
        this.store.saveBatch(batch);
        this.store.saveJobs(batchId, jobs);

        // Keep in memory
        this.batches.set(batchId, {
            ...batch,
            jobs: new Map(jobs.map(j => [j.id, j]))
        });

        this.emit('batch:created', { batchId, totalJobs: jobs.length });

        // Auto-start if requested
        if (batch.options.autoStart) {
            await this.startBatch(batchId);
        }

        return {
            batchId,
            status: batch.status,
            totalJobs: jobs.length,
            domains: validDomains
        };
    }

    /**
     * Validate domain format
     */
    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }

    /**
     * Start processing a batch
     */
    async startBatch(batchId) {
        const batch = this.batches.get(batchId);
        if (!batch) {
            throw new Error(`Batch ${batchId} not found`);
        }

        if (batch.status === 'running') {
            return; // Already running
        }

        batch.status = 'running';
        this.store.saveBatch(batch);

        // Add pending jobs to queue
        for (const [jobId, job] of batch.jobs) {
            if (job.status === 'pending') {
                this.jobQueue.push({ batchId, jobId, domain: job.domain });
            }
        }

        this.emit('batch:started', { batchId });

        // Start processing if not already
        this.processQueue();
    }

    /**
     * Process jobs from the queue
     */
    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.jobQueue.length > 0) {
            // Check if any batch is paused
            const nextJob = this.jobQueue[0];
            const batch = this.batches.get(nextJob.batchId);

            if (!batch || batch.status === 'paused') {
                // Skip paused batch jobs
                this.jobQueue.shift();
                continue;
            }

            if (batch.status !== 'running') {
                this.jobQueue.shift();
                continue;
            }

            // Process the job
            const job = this.jobQueue.shift();
            this.processJob(job);

            // Small delay between job dispatches
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.isProcessing = false;
    }

    /**
     * Process a single job
     */
    async processJob({ batchId, jobId, domain }) {
        const batch = this.batches.get(batchId);
        if (!batch) return;

        const job = batch.jobs.get(jobId);
        if (!job) return;

        // Update job status
        job.status = 'running';
        job.startedAt = new Date().toISOString();
        this.store.updateJob(batchId, jobId, { status: 'running', startedAt: job.startedAt });

        try {
            const result = await this.runner.runJobWithRetry({ id: jobId, domain });

            // Job completed successfully
            job.status = 'completed';
            job.completedAt = new Date().toISOString();
            batch.completedJobs++;

            this.store.updateJob(batchId, jobId, {
                status: 'completed',
                completedAt: job.completedAt
            });
            this.store.saveBatch(batch);

            // Try to extract and save research data
            this.saveResearchData(batchId, domain, result);

        } catch (error) {
            // Job failed
            job.status = 'failed';
            job.error = error.message;
            job.completedAt = new Date().toISOString();
            batch.failedJobs++;

            this.store.updateJob(batchId, jobId, {
                status: 'failed',
                error: error.message,
                completedAt: job.completedAt
            });
            this.store.saveBatch(batch);
        }

        // Check if batch is complete
        this.checkBatchComplete(batchId);
    }

    /**
     * Save research data from completed job
     */
    saveResearchData(batchId, domain, result) {
        try {
            // Try to load the research-data.json from the prospects folder
            const fs = require('fs');
            const sanitizedDomain = domain.replace(/\./g, '-');
            const dataPath = path.join(
                this.runner.projectRoot,
                'prospects',
                sanitizedDomain,
                'research-data.json'
            );

            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                this.store.saveResult(batchId, domain, data);
            }
        } catch (error) {
            console.error(`Failed to save research data for ${domain}:`, error.message);
        }
    }

    /**
     * Handle job completion event
     */
    handleJobComplete(data) {
        this.emit('job:complete', data);
    }

    /**
     * Handle job failure event
     */
    handleJobFailed(data) {
        this.emit('job:failed', data);
    }

    /**
     * Check if a batch is complete
     */
    checkBatchComplete(batchId) {
        const batch = this.batches.get(batchId);
        if (!batch) return;

        const total = batch.totalJobs;
        const done = batch.completedJobs + batch.failedJobs;

        if (done >= total) {
            batch.status = 'completed';
            this.store.saveBatch(batch);
            this.emit('batch:complete', {
                batchId,
                totalJobs: total,
                completedJobs: batch.completedJobs,
                failedJobs: batch.failedJobs
            });
        }
    }

    /**
     * Pause a running batch
     */
    pauseBatch(batchId) {
        const batch = this.batches.get(batchId);
        if (!batch || batch.status !== 'running') {
            return false;
        }

        batch.status = 'paused';
        this.store.saveBatch(batch);

        // Remove pending jobs from queue
        this.jobQueue = this.jobQueue.filter(j => j.batchId !== batchId);

        this.emit('batch:paused', { batchId });
        return true;
    }

    /**
     * Resume a paused batch
     */
    async resumeBatch(batchId) {
        const batch = this.batches.get(batchId);
        if (!batch || batch.status !== 'paused') {
            return false;
        }

        batch.status = 'running';
        this.store.saveBatch(batch);

        // Re-add pending jobs to queue
        for (const [jobId, job] of batch.jobs) {
            if (job.status === 'pending') {
                this.jobQueue.push({ batchId, jobId, domain: job.domain });
            }
        }

        this.emit('batch:resumed', { batchId });

        // Restart processing
        this.processQueue();

        return true;
    }

    /**
     * Retry failed jobs in a batch
     */
    async retryFailed(batchId) {
        const batch = this.batches.get(batchId);
        if (!batch) {
            throw new Error(`Batch ${batchId} not found`);
        }

        let retriedCount = 0;

        for (const [jobId, job] of batch.jobs) {
            if (job.status === 'failed') {
                job.status = 'pending';
                job.retries = (job.retries || 0) + 1;
                job.error = null;
                job.startedAt = null;
                job.completedAt = null;

                this.store.updateJob(batchId, jobId, {
                    status: 'pending',
                    retries: job.retries,
                    error: null
                });

                this.jobQueue.push({ batchId, jobId, domain: job.domain });
                retriedCount++;
            }
        }

        if (retriedCount > 0) {
            batch.status = 'running';
            batch.failedJobs -= retriedCount;
            this.store.saveBatch(batch);

            this.emit('batch:retrying', { batchId, count: retriedCount });
            this.processQueue();
        }

        return retriedCount;
    }

    /**
     * Cancel a batch
     */
    cancelBatch(batchId) {
        const batch = this.batches.get(batchId);
        if (!batch) {
            return false;
        }

        // Cancel running jobs
        for (const [jobId, job] of batch.jobs) {
            if (job.status === 'running') {
                this.runner.cancelJob(jobId);
            }
        }

        // Remove from queue
        this.jobQueue = this.jobQueue.filter(j => j.batchId !== batchId);

        batch.status = 'cancelled';
        this.store.saveBatch(batch);

        this.emit('batch:cancelled', { batchId });
        return true;
    }

    /**
     * Get batch status
     */
    getBatchStatus(batchId) {
        const batch = this.batches.get(batchId);
        if (!batch) {
            // Try to load from store
            const stored = this.store.loadBatch(batchId);
            if (!stored) {
                return null;
            }
            return {
                ...stored,
                jobs: this.store.loadJobs(batchId)
            };
        }

        return {
            id: batch.id,
            status: batch.status,
            createdAt: batch.createdAt,
            totalJobs: batch.totalJobs,
            completedJobs: batch.completedJobs,
            failedJobs: batch.failedJobs,
            runningJobs: this.runner.getActiveCount(),
            pendingJobs: batch.totalJobs - batch.completedJobs - batch.failedJobs - this.runner.getActiveCount(),
            jobs: Array.from(batch.jobs.values())
        };
    }

    /**
     * Get all completed results for a batch
     */
    getBatchResults(batchId) {
        const domains = this.store.listResults(batchId);
        const results = [];

        for (const domain of domains) {
            const data = this.store.loadResult(batchId, domain);
            if (data) {
                results.push({ domain, data });
            }
        }

        return results;
    }

    /**
     * List all batches
     */
    listBatches() {
        const stored = this.store.listBatches();
        const active = Array.from(this.batches.values()).map(b => ({
            id: b.id,
            status: b.status,
            createdAt: b.createdAt,
            totalJobs: b.totalJobs,
            completedJobs: b.completedJobs,
            failedJobs: b.failedJobs
        }));

        // Merge, preferring active state
        const activeIds = new Set(active.map(b => b.id));
        return [
            ...active,
            ...stored.filter(b => !activeIds.has(b.id))
        ];
    }

    /**
     * Restore state from persisted data on startup
     */
    restoreState() {
        const resumable = this.store.getResumableBatches();

        for (const batchData of resumable) {
            const jobs = this.store.loadJobs(batchData.id);

            this.batches.set(batchData.id, {
                ...batchData,
                jobs: new Map(jobs.map(j => [j.id, j]))
            });

            // Mark as paused so user can manually resume
            if (batchData.status === 'running') {
                batchData.status = 'paused';
                this.store.saveBatch(batchData);
            }
        }

        if (resumable.length > 0) {
            console.log(`Restored ${resumable.length} batch(es) from previous session`);
        }
    }

    /**
     * Delete a batch and all its data
     */
    deleteBatch(batchId) {
        this.batches.delete(batchId);
        this.store.deleteBatch(batchId);
        this.emit('batch:deleted', { batchId });
    }
}

module.exports = QueueManager;
