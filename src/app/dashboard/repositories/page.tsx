'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { GitFork, Search, ArrowRight } from "lucide-react";
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Repository {
  id: string;
  name: string;
  owner: string;
  githubUrl: string;
  status: 'active' | 'scanning' | 'error';
  lastScanAt: Date;
  openPRs: number;
  issuesFound: number;
}

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchRepositories = async () => {
    try {
      const response = await fetch('/api/repositories');
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      setRepositories(data);
    } catch (error) {
      toast.error('Failed to load repositories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleConnectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsConnecting(true);
      
      // Validate URL format first
      let url;
      try {
        url = new URL(repoUrl);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length !== 2) {
          throw new Error('Invalid repository URL format');
        }
        const [owner, name] = parts;
  
        const response = await fetch('/api/repositoryconnection', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ owner, name })
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to connect repository' }));
          throw new Error(errorData.error || 'Failed to connect repository');
        }
  
        const data = await response.json();
        toast.success('Repository connected successfully');
        setRepoUrl('');
        await fetchRepositories();
        
      } catch (error: any) {
        toast.error(error.message || 'Please enter a valid GitHub repository URL');
      }
    } catch (error: any) {
      console.error('Repository connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const filteredRepositories = repositories.filter(repo => 
    `${repo.owner}/${repo.name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="space-y-8">
        {/* Header and Connect Repository Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h1 className="text-2xl font-medium mb-4">Connect Repository</h1>
          <form onSubmit={handleConnectRepo} className="flex gap-4">
            <Input
              className="flex-1"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <Button 
              type="submit"
              disabled={isConnecting}
              className="whitespace-nowrap"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </form>
        </div>

        {/* Repository List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Your Repositories</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredRepositories.map((repo) => (
              <Link href={`/dashboard/repositories/${repo.id}`} key={repo.id}>
                <Card className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <GitFork className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium">{repo.owner}/{repo.name}</h3>
                        <p className="text-sm text-gray-500">
                          Last scan: {new Date(repo.lastScanAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right text-sm">
                        <span className="font-medium">{repo.openPRs}</span> PRs ·{' '}
                        <span className="font-medium">{repo.issuesFound}</span> issues
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            
            {filteredRepositories.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No repositories found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 