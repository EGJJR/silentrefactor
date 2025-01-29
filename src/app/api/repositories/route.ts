import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Octokit } from '@octokit/rest';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { githubUrl } = await request.json();
    if (!githubUrl) {
      return NextResponse.json({ error: 'GitHub URL is required' }, { status: 400 });
    }

    // Parse the GitHub URL to get owner and name
    const url = new URL(githubUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length !== 2) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
    }
    const [owner, name] = parts;

    // Verify repository exists and is accessible
    const octokit = new Octokit({ auth: session.accessToken });
    try {
      await octokit.repos.get({ owner, repo: name });
    } catch (error) {
      return NextResponse.json({ error: 'Repository not found or not accessible' }, { status: 404 });
    }

    // Create repository in database
    const repository = await prisma.repository.create({
      data: {
        name,
        owner,
        githubUrl,
        userId: session.user.id,
        status: 'active',
        lastScanAt: new Date(),
        openPRs: 0,
        issuesFound: 0
      }
    });

    return NextResponse.json(repository);

  } catch (error) {
    console.error('Repository connection error:', error);
    return NextResponse.json({ error: 'Failed to connect repository' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id
      }
    });

    return NextResponse.json(repositories);

  } catch (error) {
    console.error('Repository.list error:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
} 