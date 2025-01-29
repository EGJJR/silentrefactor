import { prisma } from './prisma';
import { ClaudeService } from './claude';
import { GitHubService } from './github';
import { RateLimiter } from './rate-limiter';
import { ErrorHandler } from './error-handler';
const { Octokit } = require('@octokit/rest');

interface Job {
  id: string;
  status: string;
  repositoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobInput {
  repositoryId: string;
  status?: string;
}

export class JobQueue {
  private claude: ClaudeService;
  private github: GitHubService;
  private rateLimiter: RateLimiter;
  private errorHandler: ErrorHandler;

  constructor() {
    this.claude = new ClaudeService();
    this.github = new GitHubService(
      new Octokit({ auth: process.env.GITHUB_TOKEN })
    );
    this.rateLimiter = new RateLimiter();
    this.errorHandler = new ErrorHandler();
  }

  async processJob(jobId: string) {
    try {
      await this.rateLimiter.waitForCapacity('github');
      await this.rateLimiter.waitForCapacity('claude');
      
      // Get job details
      const job = await prisma.refactoringJob.findUnique({
        where: { id: jobId },
        include: { repository: true }
      });

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      // Update status to IN_PROGRESS
      await this.updateJobStatus(jobId, 'IN_PROGRESS');

      // Extract owner and repo from GitHub URL
      const { owner, repo } = this.parseGitHubUrl(job.repository.githubUrl);

      // Get repository files
      const files = await this.github.getRepositoryFiles(owner, repo);

      // Analyze and refactor each file
      const refactoredFiles = await Promise.all(
        files.map(async (file) => {
          const content = await this.github.getFileContent(owner, repo, file.path);
          const analysis = await this.claude.analyzeCode(content, this.getFileLanguage(file.path));
          return {
            path: file.path,
            content,
            analysis
          };
        })
      );

      // Create PR with changes
      const prUrl = await this.github.createPullRequest(owner, repo, refactoredFiles);

      // Update job status to COMPLETED
      await this.updateJobStatus(jobId, 'COMPLETED', { prUrl });

    } catch (error) {
      await this.errorHandler.handleJobError(error as Error, jobId, job.repositoryId);
      throw error;
    }
  }

  private async updateJobStatus(jobId: string, status: string, metadata?: any) {
    await prisma.refactoringJob.update({
      where: { id: jobId },
      data: { 
        status,
        ...(metadata ? { metadata: JSON.stringify(metadata) } : {})
      }
    });
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const parts = url.replace(/\.git$/, '').split('/');
    return {
      owner: parts[parts.length - 2],
      repo: parts[parts.length - 1]
    };
  }

  private getFileLanguage(filePath: string): string {
    const extension = filePath.split('.').pop();
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'java': 'Java',
      // Add more mappings as needed
    };
    return extension ? languageMap[extension] || 'Unknown' : 'Unknown';
  }

  async createJob(input: CreateJobInput) {
    return prisma.refactoringJob.create({
      data: {
        status: 'PENDING',
        repositoryId: input.repositoryId
      }
    });
  }

  async addJob(repositoryId: string): Promise<Job> {
    return await prisma.refactoringJob.create({
      data: {
        repositoryId,
        status: 'pending',
        attempts: 0,
        maxAttempts: 3
      }
    });
  }

  async processNextJob() {
    const job = await prisma.refactoringJob.findFirst({
      where: { 
        status: 'PENDING',
        attempts: { lt: 3 }
      },
      orderBy: { createdAt: 'asc' },
      include: { repository: true }
    });

    if (!job) return null;

    try {
      await this.processJob(job.id);
      return job;
    } catch (error) {
      await this.updateJobStatus(job.id, 'FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
} 