import { prisma } from './prisma';

export async function calculateSuccessRate(): Promise<number> {
  try {
    const totalPRs = await prisma.pullRequests.count();
    if (totalPRs === 0) return 0;

    const successfulPRs = await prisma.pullRequests.count({
      where: {
        status: 'merged'
      }
    });

    return Math.round((successfulPRs / totalPRs) * 100);
  } catch (error) {
    console.error('Error calculating success rate:', error);
    return 0;
  }
}

export async function calculateSuccessRateTrend(): Promise<number> {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get current success rate
    const currentSuccessRate = await calculateSuccessRate();

    // Get last month's success rate
    const lastMonthPRs = await prisma.pullRequest.count({
      where: {
        createdAt: {
          lte: lastMonth
        }
      }
    });

    if (lastMonthPRs === 0) return 0;

    const lastMonthSuccessfulPRs = await prisma.pullRequest.count({
      where: {
        status: 'merged',
        createdAt: {
          lte: lastMonth
        }
      }
    });

    const lastMonthRate = Math.round((lastMonthSuccessfulPRs / lastMonthPRs) * 100);
    
    // Calculate trend (difference)
    return currentSuccessRate - lastMonthRate;
  } catch (error) {
    console.error('Error calculating success rate trend:', error);
    return 0;
  }
}