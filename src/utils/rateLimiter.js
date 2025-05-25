// utils/rateLimiter.js
export class RateLimiter {
  constructor(maxRequests, intervalMs) {
    this.queue = [];
    this.maxRequests = maxRequests;
    this.intervalMs = intervalMs;
    this.timestamps = [];
  }

  async enqueue(requestFn) {
    return new Promise((resolve) => {
      this.queue.push({ requestFn, resolve });
      if (this.queue.length === 1) this.process();
    });
  }

  async process() {
    if (this.queue.length === 0) return;

    // Clean up old timestamps
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.intervalMs);

    if (this.timestamps.length >= this.maxRequests) {
      // Wait until the next available slot
      const waitTime = this.intervalMs - (now - this.timestamps[0]);
      setTimeout(() => this.process(), waitTime);
      return;
    }

    const { requestFn, resolve } = this.queue[0];
    this.timestamps.push(Date.now());

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      resolve(Promise.reject(error));
    }

    this.queue.shift();
    this.process();
  }
}

// Initialize with 3 requests per minute (free tier limit)
export const limiter = new RateLimiter(3, 10000);