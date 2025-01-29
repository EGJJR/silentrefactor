export class RateLimiter {
  private requests: { [key: string]: number[] } = {};
  private limits: { [key: string]: number } = {
    'claude': 10,  // requests per minute
    'github': 5000 // requests per hour
  };

  async checkLimit(service: 'claude' | 'github'): Promise<boolean> {
    const now = Date.now();
    const windowMs = service === 'claude' ? 60000 : 3600000;
    
    // Clean old requests
    this.requests[service] = (this.requests[service] || [])
      .filter(time => now - time < windowMs);
    
    // Check if limit reached
    if (this.requests[service].length >= this.limits[service]) {
      return false;
    }

    // Add new request
    this.requests[service].push(now);
    return true;
  }

  async waitForCapacity(service: 'claude' | 'github'): Promise<void> {
    while (!(await this.checkLimit(service))) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
} 