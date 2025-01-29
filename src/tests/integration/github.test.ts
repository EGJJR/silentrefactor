import { GitHubService } from '@/lib/github';
import { ClaudeService } from '@/lib/claude';
import { JobQueue } from '@/lib/queue';
import { Octokit } from '@octokit/rest';
import { mockClaudeService } from '../mocks/claude.mock';

jest.mock('@/lib/claude', () => ({
  ClaudeService: jest.fn().mockImplementation(() => mockClaudeService)
}));

describe('GitHub Integration', () => {
  let githubService: GitHubService;
  let claude: typeof mockClaudeService;
  let jobQueue: JobQueue;
  let createdPR: { number: number; html_url: string } | null = null;

  beforeAll(() => {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('Missing GITHUB_TOKEN environment variable');
    }

    githubService = new GitHubService(new Octokit({ auth: process.env.GITHUB_TOKEN }));
    claude = mockClaudeService;
    jobQueue = new JobQueue();
  });

  it('should analyze code and create a PR', async () => {
    const owner = 'EGJJR';
    const repo = 'test-silent';
    const filePath = 'example.ts';
    const mockContent = `
      function example() {
        var x = 1;
        return x + 1;
      }
    `;

    const analysis = await claude.analyzeCode(mockContent);
    console.log('Analysis:', analysis);

    // Create PR with actual changes
    const pr = await githubService.createPR(owner, repo, {
      title: 'Test Refactor',
      branchName: 'refactor/test-' + Date.now(),
      filePath,
      changes: [{
        path: filePath,
        content: mockContent.replace('var x', 'const x'),
        analysis
      }]
    });

    createdPR = pr;
    console.log('Created PR:', pr.html_url);
    expect(pr.html_url).toBeDefined();
  }, 60000);

  afterAll(async () => {
    if (createdPR) {
      await githubService.closePR('EGJJR', 'test-silent', createdPR.number);
    }
  });
});