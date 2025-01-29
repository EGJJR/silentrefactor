import { prisma } from '@/lib/prisma';
import { JobQueue } from '@/lib/queue';
import { GitHubService } from '@/lib/github';
import { ClaudeService } from '@/lib/claude';
import { Octokit } from '@octokit/rest';

describe('Refactoring Process', () => {
  let jobQueue: JobQueue;
  let githubService: GitHubService;
  let claudeService: ClaudeService;

  beforeEach(() => {
    githubService = new GitHubService(new Octokit({ auth: process.env.GITHUB_TOKEN }));
    claudeService = new ClaudeService();
    jobQueue = new JobQueue();
  });

  beforeEach(async () => {
    await prisma.refactoringJob.deleteMany();
    await prisma.repository.deleteMany();
  });

  it('should process a refactoring job successfully', async () => {
    // Create test repository
    const repository = await prisma.repository.create({
      data: {
        githubUrl: 'https://github.com/test/repo',
        userId: 'test-user'
      }
    });

    // Create job
    const job = await prisma.refactoringJob.create({
      data: {
        status: 'PENDING',
        repositoryId: repository.id
      }
    });

    // Process job
    await jobQueue.processJob(job.id);

    // Verify job status
    const updatedJob = await prisma.refactoringJob.findUnique({
      where: { id: job.id }
    });

    expect(updatedJob).not.toBeNull();
    expect(updatedJob!.status).toBe('COMPLETED');
  }, 30000);

  it('should handle job processing failures', async () => {
    const repository = await prisma.repository.create({
      data: {
        githubUrl: 'https://github.com/invalid/repo',
        userId: 'test-user'
      }
    });

    const job = await prisma.refactoringJob.create({
      data: {
        status: 'PENDING',
        repositoryId: repository.id
      }
    });

    try {
      await jobQueue.processJob(job.id);
    } catch (error) {
      const failedJob = await prisma.refactoringJob.findUnique({
        where: { id: job.id }
      });
      expect(failedJob).not.toBeNull();
      expect(failedJob!.status).toBe('FAILED');
    }
  });
}); 