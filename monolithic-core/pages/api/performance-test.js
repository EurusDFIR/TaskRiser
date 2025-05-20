import { getServerSession } from 'next-auth';
import NextAuth from 'next-auth';

// Simulates multiple user requests to the server
export default async function handler(req, res) {
    try {
        // Simple auth check - just check if token exists
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        // Get the number of users to simulate from the request body
        const { userCount } = req.body;

        // Validate user count
        if (!userCount || userCount < 1) {
            return res.status(400).json({ message: 'Invalid user count' });
        }

        // Cap userCount for safety
        const safeUserCount = Math.min(userCount, 5000);

        // Simulate performance test
        const result = await simulateLoad(safeUserCount);

        // Return the results
        return res.status(200).json(result);
    } catch (error) {
        console.error('Performance test error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// Function to simulate server load with multiple concurrent users
async function simulateLoad(userCount) {
    // Track start time for overall test
    const startTime = process.hrtime();

    // Create an array to track response times
    const responseTimes = [];
    const stats = { errorCount: 0 };

    // Simulate requests from users
    const requests = [];
    for (let i = 0; i < userCount; i++) {
        requests.push(simulateRequest(i, responseTimes, stats));
    }

    // Wait for all simulated requests to complete
    await Promise.all(requests);

    // Calculate CPU and memory usage (simulated in this example)
    const cpuUsage = Math.min(95, Math.floor(20 + (userCount / 100) * 5 + Math.random() * 10));
    const totalMemory = 8192; // Simulated 8GB total memory
    const usedMemory = Math.min(totalMemory, Math.floor(2048 + (userCount / 100) * 30 + Math.random() * 200));

    // Calculate statistics
    const avgResponseTime = responseTimes.length
        ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
        : 0;

    const endTime = process.hrtime(startTime);
    const totalTestTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

    // Generate sample response time series (for chart visualization)
    const responseTimeSeries = generateTimeSeriesSample(responseTimes);
    const responseTimeLabels = Array.from({ length: responseTimeSeries.length }, (_, i) => i + 1);

    // Calculate success rate
    const successRate = userCount > 0 ? Math.round(((userCount - stats.errorCount) / userCount) * 100) : 100;

    // Return the performance metrics
    return {
        totalRequests: userCount,
        completedRequests: userCount - stats.errorCount,
        errorCount: stats.errorCount,
        successRate,
        averageResponseTime: avgResponseTime,
        minResponseTime: responseTimes.length ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length ? Math.max(...responseTimes) : 0,
        testDuration: parseFloat(totalTestTime),
        cpuUsage,
        totalMemory,
        usedMemory,
        responseTimeSeries,
        responseTimeLabels
    };
}

// Simulate a single user request
async function simulateRequest(userId, responseTimes, stats) {
    try {
        // Generate a random response time based on user ID (more users = higher load)
        const baseTime = 80; // Base response time in milliseconds
        const userFactorTime = userId * 0.5; // Each user adds a bit of load

        // Simulate some randomness in response times
        const randomFactor = Math.random() * 100;

        // Calculate simulated response time
        let responseTime = Math.round(baseTime + userFactorTime + randomFactor);

        // Add occasional spikes for realism
        if (Math.random() > 0.95) {
            responseTime += Math.round(Math.random() * 1000);
        }

        // Simulate server errors under heavy load
        if (userId > 3000 && Math.random() > 0.8) {
            stats.errorCount++;
            return;
        }

        // Wait for the simulated response time
        await new Promise(resolve => setTimeout(resolve, 5)); // Don't actually wait the full time

        // Record the response time
        responseTimes.push(responseTime);
    } catch (error) {
        stats.errorCount++;
        console.error(`Error in request ${userId}:`, error);
    }
}

// Generate a representative sample of time series data for charting
function generateTimeSeriesSample(responseTimes) {
    if (!responseTimes.length) return [];

    // If we have too many data points, sample them
    const maxDataPoints = 50;
    if (responseTimes.length <= maxDataPoints) {
        return [...responseTimes];
    }

    // Sample the response times
    const result = [];
    const step = Math.floor(responseTimes.length / maxDataPoints);

    for (let i = 0; i < maxDataPoints; i++) {
        const index = Math.min(i * step, responseTimes.length - 1);
        result.push(responseTimes[index]);
    }

    return result;
} 