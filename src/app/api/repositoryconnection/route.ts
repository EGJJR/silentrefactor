import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Octokit } from '@octokit/rest';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { owner, name } = await req.json();
    
    // Initialize GitHub client with access token
    const octokit = new Octokit({
      auth: session.accessToken
    });

    // Verify repository access
    try {
      await octokit.repos.get({
        owner,
        repo: name,
      });
    } catch (error) {
      return NextResponse.json({ 
        error: 'Repository not found or no access' 
      }, { status: 404 });
    }

    // Store repository in database
    const repository = await prisma.repository.create({
      data: {
        name,
        owner,
        githubUrl: `https://github.com/${owner}/${name}`,
        userId: session.user.id,
        lastScanAt: new Date(),
        openPRs: 0,
        issuesFound: 0,
        status: 'active'
      }
    });

    return NextResponse.json(repository);

  } catch (error: any) {
    console.error('Repository connection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect repository' },
      { status: 500 }
    );
  }
}