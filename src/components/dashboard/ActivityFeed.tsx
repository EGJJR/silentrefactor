'use client';

import { GitPullRequest, GitCommit, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'pr_created' | 'scan_completed' | 'issue_found';
  repository: string;
  timestamp: Date;
  details: string;
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'pr_created':
        return <GitPullRequest className="h-5 w-5 text-green-500" />;
      case 'scan_completed':
        return <GitCommit className="h-5 w-5 text-blue-500" />;
      case 'issue_found':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4 p-4 bg-white rounded-lg border">
          <div className="mt-1">{getIcon(activity.type)}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="font-medium">{activity.repository}</p>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 