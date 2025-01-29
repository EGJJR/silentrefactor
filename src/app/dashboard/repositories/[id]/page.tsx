'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GitBranch, GitPullRequest, Play, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function RepositoryDetails({ params }: { params: { id: string } }) {
  const [repository, setRepository] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRepository = async () => {
      const response = await fetch(`/api/repositories/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRepository(data);
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
    };

    fetchRepository();
  }, [params.id, router]);

  if (loading) return <p>Loading...</p>;

  if (!repository) return <p>Repository not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{repository.name}</h1>
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

function StatsCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-sm text-gray-600">{title}</h3>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
    </Card>
  );
}

function PRList({ repositoryId }: { repositoryId: string }) {
  const [prs, setPrs] = useState([]);
  
  useEffect(() => {
    fetch(`/api/repositories/${repositoryId}/prs`)
      .then(res => res.json())
      .then(setPrs);
  }, [repositoryId]);

  return (
    <div className="space-y-4">
      {prs.map((pr: any) => (
        <div key={pr.id} className="flex items-center justify-between py-3 border-b last:border-0">
          <div className="flex items-center gap-3">
            <GitPullRequest className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">{pr.title}</p>
              <p className="text-sm text-gray-500">Created {new Date(pr.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <Link href={pr.url} target="_blank">
            <Button variant="outline" size="sm">View PR</Button>
          </Link>
        </div>
      ))}
    </div>
  );
} 