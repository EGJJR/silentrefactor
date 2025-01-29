'use client';

import { GitBranch, GitPullRequest, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Repository {
  id: string;
  name: string;
  owner: string;
  githubUrl: string;
  lastScanAt: Date;
  openPRs: number;
  issuesFound: number;
  status: 'active' | 'scanning' | 'error';
}

export function RepositoryCard({ repository }: { repository: Repository }) {
  return (
    <div className="card">
      <h3 className="text-lg font-bold">{repository.name}</h3>
      <p>Owner: {repository.owner}</p>
      <p>Status: {repository.status}</p>
      <p>Last Scan: {repository.lastScanAt ? new Date(repository.lastScanAt).toLocaleString() : 'Never'}</p>
      <p>Open PRs: {repository.openPRs}</p>
      <p>Issues Found: {repository.issuesFound}</p>
      <Link href={repository.githubUrl} target="_blank" className="link">
        View on GitHub
      </Link>
    </div>
  );
} 