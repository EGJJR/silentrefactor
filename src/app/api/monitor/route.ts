import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { Anthropic } from '@anthropic-ai/sdk';
import { RepositoryScanner } from '@/lib/scanner';
import { PRReviewer } from '@/lib/reviewer';
import { ClaudeService } from '@/lib/claude';
import { GitHubService } from '@/lib/github';
import { getMonitoredRepositories, updateRepositoryStatus } from '@/lib/repositories';

interface Repository {
  owner: string;
  name: string;
}

interface MonitorResult {
  repo: string;
  file?: string;
  pr?: string;
  error?: string;
}

const REFACTOR_THRESHOLD = {
  highIssues: 1,
  mediumIssues: 3,
  score: 60
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!process.env.GITHUB_TOKEN || !process.env.CLAUDE_API_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Initialize services
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    const claude = new ClaudeService();
    const githubService = new GitHubService(octokit);
    const scanner = new RepositoryScanner(octokit, claude);
    const reviewer = new PRReviewer(octokit, claude);

    // Get active repositories from database
    const repos = await getMonitoredRepositories();
    const results: MonitorResult[] = [];

    for (const repo of repos) {
      try {
        // Update status to scanning
        await updateRepositoryStatus(repo.id, { 
          status: 'scanning',
          lastScanAt: new Date()
        });

        const analysisResults = await scanner.scanRepository(repo.owner, repo.name);
        
        // Count issues and create PRs
        let issuesFound = 0;
        for (const file of analysisResults.prioritizedFiles) {
          if (needsRefactoring(file)) {
            issuesFound++;
            const pr = await createRefactoringPR({ owner: repo.owner, name: repo.name }, file, githubService);
            results.push({
              repo: `${repo.owner}/${repo.name}`,
              file: file.path,
              pr: pr.html_url
            });
          }
        }

        // Get open PRs count
        const openPRs = await githubService.getOpenPRs(repo.owner, repo.name);
        
        // Update repository status
        await updateRepositoryStatus(repo.id, {
          status: 'active',
          openPRs: openPRs.length,
          issuesFound
        });

        // Review open PRs
        for (const pr of openPRs) {
          await reviewer.reviewPR(repo.owner, repo.name, pr.number);
        }

      } catch (error) {
        console.error(`Error processing repo ${repo.owner}/${repo.name}:`, error);
        await updateRepositoryStatus(repo.id, { 
          status: 'error'
        });
        results.push({
          repo: `${repo.owner}/${repo.name}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Monitor error:', error);
    return NextResponse.json(
      { error: 'Monitor process failed' },
      { status: 500 }
    );
  }
}

interface FileWithAnalysis {
  path: string;
  analysis: {
    issues: Array<{ severity: 'high' | 'medium' | 'low' }>;
    score: number;
  };
}

function needsRefactoring(file: FileWithAnalysis): boolean {
  const highIssues = file.analysis.issues.filter(i => i.severity === 'high').length;
  const mediumIssues = file.analysis.issues.filter(i => i.severity === 'medium').length;

  return (
    highIssues >= REFACTOR_THRESHOLD.highIssues ||
    mediumIssues >= REFACTOR_THRESHOLD.mediumIssues ||
    file.analysis.score < REFACTOR_THRESHOLD.score
  );
}

async function createRefactoringPR(
  repo: Repository,
  file: FileWithAnalysis,
  githubService: GitHubService
) {
  const branchName = `refactor/${file.path.replace(/\//g, '-')}`;
  const title = `Refactor: ${file.path}`;
  
  return await githubService.createPR(repo.owner, repo.name, {
    title,
    branchName,
    filePath: file.path
  });
} 