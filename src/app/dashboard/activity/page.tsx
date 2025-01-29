'use client';

import { Card } from "@/components/ui/card";
import { GitPullRequest, GitFork, AlertCircle, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface Activity {
  id: string;
  type: 'scan' | 'pr_created' | 'issue_found';
  repository: string;
  description: string;
  timestamp: Date;
}

const activityIcons = {
  'scan': <Search className="h-5 w-5 text-blue-500" />,
  'pr_created': <GitPullRequest className="h-5 w-5 text-green-500" />,
  'issue_found': <AlertCircle className="h-5 w-5 text-orange-500" />
};

export default function ActivityPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Activity</h1>
        <p className="text-gray-500">Track all automated improvements and actions</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Activity Type</label>
            <select className="w-full p-2 border rounded-md">
              <option value="all">All Activities</option>
              <option value="scan">Scans</option>
              <option value="pr">Pull Requests</option>
              <option value="issue">Issues</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Repository</label>
            <select className="w-full p-2 border rounded-md">
              <option value="all">All Repositories</option>
              {/* Repository options */}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Time Period</label>
            <select className="w-full p-2 border rounded-md">
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {/* Date Group */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-500">Today</h3>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <GitPullRequest className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">New Pull Request Created</h4>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      Refactoring suggestion for repository/file.ts
                    </p>
                    <div className="text-sm text-gray-500">
                      repository-name
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Yesterday */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-500">Yesterday</h3>
          </div>
          
          {/* Similar activity cards */}
        </div>
      </div>
    </div>
  );
}