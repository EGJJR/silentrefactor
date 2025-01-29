import { prisma } from './prisma';

export class Monitor {
  async logEvent(event: {
    type: 'analysis' | 'pr_created' | 'error';
    repositoryId: string;
    details: any;
  }) {
    await prisma.event.create({
      data: {
        ...event,
        timestamp: new Date()
      }
    });
  }

  async getStats() {
    return {
      totalPRs: await prisma.refactoringJob.count(),
      failedJobs: await prisma.refactoringJob.count({
        where: { status: 'failed' }
      }),
      // Add more stats
    };
  }
} 