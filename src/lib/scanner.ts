import { Octokit } from '@octokit/rest';
import { ClaudeService } from './claude';
import { GitHubService } from './github';

interface FileAnalysis {
  path: string;
  content: string;
  analysis: {
    issues: Array<{
      severity: 'high' | 'medium' | 'low';
    }>;
  };
}

interface ScanResult {
  repositoryScore: number;
  prioritizedFiles: FileAnalysis[];
  summary: {
    totalFiles: number;
    filesWithIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
  };
}

export class RepositoryScanner {
  private githubService: GitHubService;

  constructor(
    private octokit: Octokit,
    private claude: ClaudeService
  ) {
    this.githubService = new GitHubService(octokit);
  }

  async scanRepository(owner: string, repo: string): Promise<ScanResult> {
    try {
      // Get all files in repository
      const files = await this.getAllFiles(owner, repo);
      
      // Filter relevant files
      const codeFiles = files.filter(file => this.isCodeFile(file.path));
      
      // Analyze each file
      const analysisResults = await Promise.all(
        codeFiles
          .filter(file => file.path)
          .map(file => this.analyzeFile(owner, repo, { path: file.path! }))
      );

      // Prioritize and summarize results
      return this.summarizeResults(analysisResults);

    } catch (error: unknown) {
      console.error('Repository scan failed:', error);
      throw new Error(`Failed to scan repository ${owner}/${repo}: ${(error as Error).message}`);
    }
  }

  private async getAllFiles(owner: string, repo: string) {
    const { data: tree } = await this.octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: 'HEAD',
      recursive: 'true'
    });

    return tree.tree.filter(item => item.type === 'blob');
  }

  private isCodeFile(path: string | undefined): boolean {
    if (!path) return false;
    const codeExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.cpp', '.cs'];
    return codeExtensions.some(ext => path.endsWith(ext));
  }

  private async analyzeFile(owner: string, repo: string, file: { path: string }): Promise<FileAnalysis> {
    const content = await this.githubService.getFileContent(owner, repo, file.path);
    const analysis = await this.claude.analyzeCode(content, this.getFileExtension(file.path));
    return {
      path: file.path,
      content,
      analysis
    };
  }

  private getFileExtension(path: string): string {
    return path.split('.').pop() || '';
  }

  private calculatePriorityScore(analysis: FileAnalysis): number {
    const weights = {
      high: 3,
      medium: 2,
      low: 1
    };

    return analysis.analysis.issues.reduce((score, issue) => 
      score + (weights[issue.severity] || 0), 0);
  }

  private calculateRepositoryScore(results: FileAnalysis[]): number {
    const totalScore = results.reduce((sum, result) => 
      sum + this.calculatePriorityScore(result), 0);
    return Math.max(100 - (totalScore * 5), 0); // Lower score means more issues
  }

  private summarizeResults(results: FileAnalysis[]): ScanResult {
    const highPriorityIssues = results.filter(r => 
      r.analysis.issues.some(i => i.severity === 'high')
    ).length;

    const mediumPriorityIssues = results.filter(r => 
      r.analysis.issues.some(i => i.severity === 'medium')
    ).length;

    const lowPriorityIssues = results.filter(r => 
      r.analysis.issues.some(i => i.severity === 'low')
    ).length;

    // Sort files by priority (high severity issues first)
    const prioritizedFiles = [...results].sort((a, b) => {
      const aScore = this.calculatePriorityScore(a);
      const bScore = this.calculatePriorityScore(b);
      return bScore - aScore;
    });

    const repositoryScore = this.calculateRepositoryScore(results);

    return {
      repositoryScore,
      prioritizedFiles,
      summary: {
        totalFiles: results.length,
        filesWithIssues: results.filter(r => r.analysis.issues.length > 0).length,
        highPriorityIssues,
        mediumPriorityIssues,
        lowPriorityIssues
      }
    };
  }
} 