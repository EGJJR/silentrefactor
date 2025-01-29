import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateSuccessRate, calculateSuccessRateTrend } from '@/lib/calculations';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      repositories,
      activePRs,
      issuesFound,
      successRate,
      highPriorityIssues,
      successRateTrend
    ] = await Promise.all([
      prisma.repository.count(),
      prisma.pullRequest.count({ where: { status: 'active' } }),
      prisma.issue.count(),
      calculateSuccessRate(),
      prisma.issue.count({ where: { priority: 'high' } }),
      calculateSuccessRateTrend()
    ]);

    const recentActivities = await prisma.activity.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    const data = {
      stats: {
        repositories: repositories ?? 0,
        activePRs: activePRs ?? 0,
        issuesFound: issuesFound ?? 0,
        successRate: successRate ?? 0,
        highPriorityIssues: highPriorityIssues ?? 0,
        successRateTrend: successRateTrend ?? 0
      },
      recentActivities
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return new NextResponse('Failed to fetch data', { status: 500 });
  }
}