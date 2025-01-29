import { Monitor } from './monitoring';

export class ErrorHandler {
  private monitor: Monitor;

  constructor() {
    this.monitor = new Monitor();
  }

  async handleJobError(error: Error, jobId: string, repositoryId: string) {
    await this.monitor.logEvent({
      type: 'error',
      repositoryId,
      details: {
        jobId,
        error: error.message,
        stack: error.stack
      }
    });

    // Determine if error is recoverable
    const isRecoverable = !error.message.includes('FATAL:');
    
    if (isRecoverable) {
      await prisma.refactoringJob.update({
        where: { id: jobId },
        data: {
          attempts: { increment: 1 },
          status: 'PENDING',
          error: error.message
        }
      });
    } else {
      await prisma.refactoringJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error.message
        }
      });
    }
  }
} 