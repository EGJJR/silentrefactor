'use client'

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, GitPullRequest, GitFork, AlertCircle, Activity } from "lucide-react";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface DashboardData {
  stats: {
    repositories: number;
    activePRs: number;
    issuesFound: number;
    successRate: number;
    highPriorityIssues: number;
    successRateTrend: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    repository: string;
    description: string;
    timestamp: Date;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/overview', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load dashboard');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add retry mechanism
  const handleRetry = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConnectRepo = () => {
    router.push('/dashboard/repositories');
  };

  const handleManualScan = async () => {
    try {
      toast.loading('Starting manual scan...');
      const response = await fetch('/api/manualscan', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to start scan');
      
      const data = await response.json();
      toast.success(`Scan started for ${data.repositoryCount} repositories`);
      
      // Refresh dashboard data after a short delay
      setTimeout(() => {
        fetchDashboardData();
      }, 2000);
      
    } catch (error) {
      console.error('Manual scan error:', error);
      toast.error('Failed to start scan');
    }
  };

  const handleReviewPRs = () => {
    router.push('/dashboard/repositories?filter=prs');
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold mb-3">Welcome to Silent Refactor</h1>
        <p className="text-gray-500 text-lg">Automated code improvements for your repositories</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Repositories</span>
            <span className="text-3xl font-bold mt-2">{data?.stats.repositories}</span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Active PRs</span>
            <span className="text-3xl font-bold mt-2">{data?.stats.activePRs}</span>
            <div className="flex items-center gap-1 mt-2">
              <GitPullRequest className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-blue-600">All on track</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Issues Found</span>
            <span className="text-3xl font-bold mt-2">{data?.stats.issuesFound}</span>
            <div className="flex items-center gap-1 mt-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-orange-600">{data?.stats.highPriorityIssues} high priority</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Success Rate</span>
            <span className="text-3xl font-bold mt-2">{data?.stats.successRate}%</span>
            <span className="text-xs text-green-600 mt-2">{data?.stats.successRateTrend} this month</span>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="/dashboard/activity" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {data?.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Activity className="h-8 w-8 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Button 
              className="w-full justify-between" 
              variant="outline"
              onClick={handleConnectRepo}
            >
              <span className="flex items-center gap-2">
                <GitFork className="h-5 w-5" />
                Connect New Repository
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              className="w-full justify-between" 
              variant="outline"
              onClick={handleManualScan}
            >
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Run Manual Scan
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              className="w-full justify-between" 
              variant="outline"
              onClick={handleReviewPRs}
            >
              <span className="flex items-center gap-2">
                <GitPullRequest className="h-5 w-5" />
                Review Open PRs
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">New to Silent Refactor?</h2>
            <p className="text-gray-500">Learn how to get the most out of automated code improvements.</p>
          </div>
          <Button>
            View Guide
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return session ? <>{children}</> : null;
}