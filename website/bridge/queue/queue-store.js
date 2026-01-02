/**
 * QueueStore - File-based persistence for batch job queues
 * Survives server restarts and allows resume capability
 */

const fs = require('fs');
const path = require('path');

class QueueStore {
    constructor(dataDir) {
        this.dataDir = dataDir || path.join(__dirname, '..', 'data', 'queues');
        this.ensureDir();
    }

    /**
     * Ensure the data directory exists
     */
    ensureDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * Get path to batch file
     */
    getBatchPath(batchId) {
        return path.join(this.dataDir, `batch-${batchId}.json`);
    }

    /**
     * Get path to batch jobs file
     */
    getJobsPath(batchId) {
        return path.join(this.dataDir, `batch-${batchId}-jobs.json`);
    }

    /**
     * Save batch metadata
     */
    saveBatch(batch) {
        const filePath = this.getBatchPath(batch.id);
        const data = {
            id: batch.id,
            status: batch.status,
            createdAt: batch.createdAt,
            updatedAt: new Date().toISOString(),
            totalJobs: batch.totalJobs,
            completedJobs: batch.completedJobs,
            failedJobs: batch.failedJobs,
            options: batch.options
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    /**
     * Load batch metadata
     */
    loadBatch(batchId) {
        const filePath = this.getBatchPath(batchId);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    /**
     * Save all jobs for a batch
     */
    saveJobs(batchId, jobs) {
        const filePath = this.getJobsPath(batchId);
        const data = jobs.map(job => ({
            id: job.id,
            domain: job.domain,
            status: job.status,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            error: job.error,
            retries: job.retries || 0
        }));
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    /**
     * Load all jobs for a batch
     */
    loadJobs(batchId) {
        const filePath = this.getJobsPath(batchId);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    /**
     * Update a single job's status
     */
    updateJob(batchId, jobId, updates) {
        const jobs = this.loadJobs(batchId);
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        if (jobIndex !== -1) {
            jobs[jobIndex] = { ...jobs[jobIndex], ...updates };
            this.saveJobs(batchId, jobs);
        }
    }

    /**
     * Save research result data
     */
    saveResult(batchId, domain, data) {
        const resultsDir = path.join(this.dataDir, `batch-${batchId}-results`);
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        const sanitizedDomain = domain.replace(/\./g, '-');
        const filePath = path.join(resultsDir, `${sanitizedDomain}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    /**
     * Load research result data
     */
    loadResult(batchId, domain) {
        const sanitizedDomain = domain.replace(/\./g, '-');
        const filePath = path.join(this.dataDir, `batch-${batchId}-results`, `${sanitizedDomain}.json`);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    /**
     * List all results for a batch
     */
    listResults(batchId) {
        const resultsDir = path.join(this.dataDir, `batch-${batchId}-results`);
        if (!fs.existsSync(resultsDir)) {
            return [];
        }
        return fs.readdirSync(resultsDir)
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', '').replace(/-/g, '.'));
    }

    /**
     * Delete batch and all associated data
     */
    deleteBatch(batchId) {
        const batchPath = this.getBatchPath(batchId);
        const jobsPath = this.getJobsPath(batchId);
        const resultsDir = path.join(this.dataDir, `batch-${batchId}-results`);

        if (fs.existsSync(batchPath)) fs.unlinkSync(batchPath);
        if (fs.existsSync(jobsPath)) fs.unlinkSync(jobsPath);
        if (fs.existsSync(resultsDir)) {
            fs.rmSync(resultsDir, { recursive: true });
        }
    }

    /**
     * List all batches
     */
    listBatches() {
        const files = fs.readdirSync(this.dataDir);
        const batchIds = files
            .filter(f => f.match(/^batch-[^-]+-[^-]+\.json$/) && !f.includes('-jobs'))
            .map(f => f.replace('batch-', '').replace('.json', ''));

        return batchIds.map(id => this.loadBatch(id)).filter(Boolean);
    }

    /**
     * Get batches that can be resumed (running or paused)
     */
    getResumableBatches() {
        return this.listBatches().filter(b =>
            b.status === 'running' || b.status === 'paused'
        );
    }
}

module.exports = QueueStore;
