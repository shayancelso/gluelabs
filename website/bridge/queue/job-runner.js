/**
 * JobRunner - Spawns Claude CLI processes with concurrency control
 * Handles rate limiting and retries
 */

const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

/**
 * Simple semaphore for concurrency control
 */
class Semaphore {
    constructor(max) {
        this.max = max;
        this.current = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.current < this.max) {
            this.current++;
            return;
        }
        await new Promise(resolve => this.queue.push(resolve));
        this.current++;
    }

    release() {
        this.current--;
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next();
        }
    }
}

/**
 * Rate limiter to prevent API throttling
 */
class RateLimiter {
    constructor(minDelay = 2000) {
        this.minDelay = minDelay;
        this.lastCall = 0;
    }

    async wait() {
        const now = Date.now();
        const elapsed = now - this.lastCall;
        if (elapsed < this.minDelay) {
            await new Promise(resolve => setTimeout(resolve, this.minDelay - elapsed));
        }
        this.lastCall = Date.now();
    }
}

class JobRunner extends EventEmitter {
    constructor(options = {}) {
        super();
        this.projectRoot = options.projectRoot || path.resolve(__dirname, '..', '..');
        this.maxConcurrent = options.maxConcurrent || 3;
        this.rateLimit = options.rateLimit || 2000; // 2 seconds between job starts
        this.maxRetries = options.maxRetries || 3;
        this.timeout = options.timeout || 10 * 60 * 1000; // 10 minutes

        this.semaphore = new Semaphore(this.maxConcurrent);
        this.rateLimiter = new RateLimiter(this.rateLimit);
        this.activeJobs = new Map();
    }

    /**
     * Run a single research job
     * @param {Object} job - Job object with id and domain
     * @returns {Promise<Object>} - Result object
     */
    async runJob(job) {
        await this.semaphore.acquire();
        await this.rateLimiter.wait();

        try {
            return await this.executeJob(job);
        } finally {
            this.semaphore.release();
        }
    }

    /**
     * Execute the Claude CLI for a job
     */
    executeJob(job) {
        return new Promise((resolve, reject) => {
            const { id, domain } = job;

            this.emit('job:start', { jobId: id, domain });

            const prompt = `Run the /prospect skill for ${domain}. This skill is defined in .claude/skills/prospect/skill.md. Execute all phases and generate the research report and PDF.`;

            const claude = spawn('claude', [
                '-p',
                '--output-format', 'stream-json',
                prompt
            ], {
                cwd: this.projectRoot,
                env: { ...process.env }
            });

            const jobState = {
                id,
                domain,
                process: claude,
                output: [],
                startTime: Date.now()
            };

            this.activeJobs.set(id, jobState);

            // Collect output
            claude.stdout.on('data', (data) => {
                const text = data.toString();
                jobState.output.push(text);
                this.emit('job:log', { jobId: id, text });

                // Detect phases
                const phase = this.detectPhase(text);
                if (phase) {
                    this.emit('job:phase', { jobId: id, phase });
                }
            });

            claude.stderr.on('data', (data) => {
                const text = data.toString();
                this.emit('job:error', { jobId: id, text });
            });

            // Set timeout
            const timeoutId = setTimeout(() => {
                claude.kill();
                reject(new Error(`Job ${id} timed out after ${this.timeout / 1000}s`));
            }, this.timeout);

            claude.on('close', (code) => {
                clearTimeout(timeoutId);
                this.activeJobs.delete(id);

                const duration = Date.now() - jobState.startTime;

                if (code === 0) {
                    this.emit('job:complete', { jobId: id, duration });
                    resolve({
                        success: true,
                        jobId: id,
                        domain,
                        duration,
                        output: jobState.output.join('')
                    });
                } else {
                    const error = new Error(`Job ${id} failed with exit code ${code}`);
                    this.emit('job:failed', { jobId: id, error: error.message });
                    reject(error);
                }
            });

            claude.on('error', (err) => {
                clearTimeout(timeoutId);
                this.activeJobs.delete(id);
                this.emit('job:failed', { jobId: id, error: err.message });
                reject(err);
            });
        });
    }

    /**
     * Run a job with automatic retry
     */
    async runJobWithRetry(job) {
        let lastError;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    this.emit('job:retry', { jobId: job.id, attempt, delay });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                return await this.runJob(job);
            } catch (error) {
                lastError = error;
                if (attempt < this.maxRetries) {
                    this.emit('job:retrying', { jobId: job.id, attempt: attempt + 1, error: error.message });
                }
            }
        }

        throw lastError;
    }

    /**
     * Detect research phase from output text
     */
    detectPhase(text) {
        const lowerText = text.toLowerCase();

        const phasePatterns = [
            { phase: 1, name: 'Company Discovery', patterns: ['company discovery', 'company overview', 'websearch', 'fetching https://'] },
            { phase: 2, name: 'Market Position', patterns: ['market position', 'competitor', 'g2.com', 'capterra'] },
            { phase: 3, name: 'Technographic Analysis', patterns: ['technographic', 'stackshare', 'builtwith', 'tech stack'] },
            { phase: 4, name: 'Financial Intelligence', patterns: ['financial', 'funding', 'crunchbase', 'revenue'] },
            { phase: 5, name: 'Pain Point Analysis', patterns: ['pain point', 'challenges', 'glassdoor'] },
            { phase: 6, name: 'Contact Discovery', patterns: ['contact discovery', 'decision maker', 'linkedin', 'leadership'] },
            { phase: 7, name: 'POC Recommendations', patterns: ['poc recommendation', 'recommending', 'scoring relevance'] },
            { phase: 8, name: 'Output Generation', patterns: ['output generation', 'creating', 'writing to', 'prospects/', 'pdf'] }
        ];

        for (const { phase, name, patterns } of phasePatterns) {
            if (patterns.some(p => lowerText.includes(p))) {
                return { phase, name };
            }
        }

        return null;
    }

    /**
     * Cancel a running job
     */
    cancelJob(jobId) {
        const job = this.activeJobs.get(jobId);
        if (job && job.process) {
            job.process.kill();
            this.activeJobs.delete(jobId);
            this.emit('job:cancelled', { jobId });
            return true;
        }
        return false;
    }

    /**
     * Cancel all running jobs
     */
    cancelAll() {
        for (const [jobId, job] of this.activeJobs) {
            if (job.process) {
                job.process.kill();
            }
        }
        this.activeJobs.clear();
        this.emit('jobs:cancelled-all');
    }

    /**
     * Get count of active jobs
     */
    getActiveCount() {
        return this.activeJobs.size;
    }

    /**
     * Check if a specific job is running
     */
    isJobRunning(jobId) {
        return this.activeJobs.has(jobId);
    }
}

module.exports = JobRunner;
