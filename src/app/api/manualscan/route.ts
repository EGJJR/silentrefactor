import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession();
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Get user's repositories
    const repos = await prisma.repository.findMany({
      where: {
        userId: session.user?.id
      }
    });

    // Start scanning process
    for (const repo of repos) {
      await prisma.repository.update({
        where: { id: repo.id },
        data: { 
          status: 'scanning',
          lastScanAt: new Date()
        }
      });
    }

    // Return immediately while scan continues in background
    return NextResponse.json({ 
      message: 'Scan started',
      repositoryCount: repos.length 
    });
  } catch (error) {
    console.error('Manual scan error:', error);
    return NextResponse.json(
      { error: 'Failed to start scan' }, 
      { status: 500 }
    );
  }
}
