export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(t => now - t < window);
    
    if (validTimestamps.length >= limit) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }
}
