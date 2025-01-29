import { Octokit } from '@octokit/rest';
import { ClaudeService } from './claude';
import { GitHubService } from './github';

interface ReviewResult {
  isValid: boolean;
  canMerge: boolean;
  feedback: string;
  changes: {
    path: string;
    content: string;
  }[];
}

interface GitHubFile {
  filename: string;
  patch?: string;
  status?: string;
}

export class PRReviewer {
  private githubService: GitHubService;

  constructor(
    private octokit: Octokit,
    private claude: ClaudeService
  ) {
    this.githubService = new GitHubService(octokit);
  }

  async reviewPR(owner: string, repo: string, pr: number): Promise<ReviewResult> {
    try {
      // Get PR changes
      const changes = await this.getPRChanges(owner, repo, pr);
      
      // Analyze changes with Claude
      const review = await this.analyzeChanges(changes);
      
      // Make decision
      if (review.isValid) {
        await this.approvePR(owner, repo, pr);
        if (review.canMerge) {
          await this.mergePR(owner, repo, pr);
        }
      } else {
        await this.requestChanges(owner, repo, pr, review.feedback);
      }

      return review;

    } catch (error: unknown) {
      console.error('PR review failed:', error);
      throw new Error(`Failed to review PR #${pr}: ${(error as Error).message}`);
    }
  }

  private async getPRChanges(owner: string, repo: string, pr: number) {
    const { data: files } = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pr,
    });

    const changes = await Promise.all(
      files.map(async (file: GitHubFile) => ({
        path: file.filename,
        content: await this.githubService.getFileContent(owner, repo, file.filename),
        patch: file.patch,
        status: file.status
      }))
    );

    return changes;
  }

  private async analyzeChanges(changes: any[]): Promise<ReviewResult> {
    // TODO: Implement actual analysis logic with Claude
    return {
      isValid: true,
      canMerge: false,
      feedback: "Automated review completed",
      changes: []
    };
  }

  private async approvePR(owner: string, repo: string, pr: number) {
    // Implementation to approve PR
  }

  private async mergePR(owner: string, repo: string, pr: number) {
    // Implementation to merge PR
  }

  private async requestChanges(owner: string, repo: string, pr: number, feedback: string) {
    // Implementation to request changes
  }
} 