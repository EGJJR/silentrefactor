export interface DashboardData {
  stats: {
    repositories: number;
    activePRs: number;
    issuesFound: number;
    successRate: number;
    highPriorityIssues: number;
    successRateTrend: string;
  };
  recentActivities: Array<{
    id: string;
    description: string;
    timestamp: string;
  }>;
}
