/* global process */

export default async function handler(request, response) {
    const startTime = Date.now();

    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {}
    };

    // Check environment variables
    health.checks.environment = {
        status: process.env.BLOB_READ_WRITE_TOKEN ? 'ok' : 'missing',
        detail: 'Blob storage token'
    };

    health.checks.cronSecret = {
        status: process.env.CRON_SECRET ? 'ok' : 'missing',
        detail: 'Cron authentication'
    };

    // Calculate response time
    health.responseTimeMs = Date.now() - startTime;

    // Overall status based on checks
    const hasIssues = Object.values(health.checks).some(c => c.status !== 'ok');
    if (hasIssues) {
        health.status = 'degraded';
    }

    return response.status(health.status === 'healthy' ? 200 : 503).json(health);
}
