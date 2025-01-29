import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { Octokit } from '@octokit/rest';
import { checkGitHubAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const { repositoryUrl, code, filePath } = await request.json();

    if (!repositoryUrl || !code || !filePath) {
      return NextResponse.json(
        { error: 'Missing required fields: repositoryUrl, code, or filePath' },
        { status: 400 }
      );
    }

    // Initialize Claude API
    const claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY || '',
    });

    // Create a more specific prompt for Claude
    const prompt = `
      Analyze and refactor the following code. Focus on:
      1. Improving code quality and readability
      2. Fixing potential bugs and security issues
      3. Optimizing performance
      4. Following best practices

      Original code:
      ${code}

      Please provide:
      1. The refactored code
      2. A brief explanation of the changes made
      3. Any potential risks or considerations
    `;

    // Get refactoring suggestions from Claude
    const refactoringResponse = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Safely extract text content from Claude's response
    const responseText = refactoringResponse.content
      .filter(block => block.type === 'text')
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('\n');

    if (!responseText) {
      throw new Error('No valid response received from Claude');
    }

    const refactoredCode = responseText;

    // GitHub integration
    const authError = await checkGitHubAuth();
    if (authError) return authError;


    // Extract owner and repo from URL
    const urlParts = repositoryUrl.split('/');
    if (urlParts.length < 2) {
      throw new Error('Invalid repository URL format');
    }
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1].replace('.git', '');

    // Generate unique branch name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const branchName = `auto-refactor/${timestamp}`;

    try {
      // Get default branch
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      const defaultBranch = repoData.default_branch;

      // Get the latest commit SHA from the default branch
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`,
      });
      const baseSHA = refData.object.sha;

      // Create new branch
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseSHA,
      });

      // Update file content
      const content = Buffer.from(refactoredCode).toString('base64');
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: 'Automated code refactoring',
        content,
        branch: branchName,
      });

      // Extract explanation from response (second paragraph or fallback)
      const explanationText = responseText.split('\n\n')[1] || 'Code improvements and optimizations';

      // Create PR
      const { data: pr } = await octokit.rest.pulls.create({
        owner,
        repo,
        title: '🤖 Automated Code Refactoring',
        head: branchName,
        base: defaultBranch,
        body: `
# Automated Code Refactoring

This pull request contains automatically refactored code generated by Claude AI.

## Changes Made
${explanationText}

## Please Review
- [ ] Code functionality
- [ ] Code style
- [ ] Test coverage

Generated by Silent Refactor 🛠️
        `,
      });

      return NextResponse.json({
        success: true,
        refactoredCode,
        prUrl: pr.html_url,
        explanation: responseText,
      });

    } catch (githubError: any) {
      console.error('GitHub API error:', githubError);
      return NextResponse.json(
        { 
          error: 'Failed to create pull request', 
          details: githubError?.message || 'Unknown GitHub error'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in refactoring process:', error);
    return NextResponse.json(
      { 
        error: 'Refactoring failed', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}