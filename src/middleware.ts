import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT = 1000; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

async function getRateLimit(ip: string): Promise<number> {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  const entry = rateLimitStore.get(ip) || { count: 0, timestamp: now };
  
  if (entry.timestamp < windowStart) {
    entry.count = 0;
    entry.timestamp = now;
  }
  
  return entry.count;
}

export async function middleware(request: NextRequest) {
  // Skip rate limiting for auth and static routes
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const rateLimit = await getRateLimit(ip);
  
  if (rateLimit > RATE_LIMIT) {
    return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  const entry = rateLimitStore.get(ip) || { count: 0, timestamp: Date.now() };
  entry.count += 1;
  rateLimitStore.set(ip, entry);
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*'
  ],
} 