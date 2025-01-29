import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobQueue } from '@/lib/queue';
import { Logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobQueue = new JobQueue();
    const repositories = await prisma.repository.findMany();
    
    // Create scan jobs for all repositories
    for (const repo of repositories) {
      await jobQueue.createJob({
        repositoryId: repo.id,
        type: 'SCAN'
      });
      Logger.info('Cron', `Created scan job for ${repo.githubUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Logger.error('Cron', error as Error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
} 