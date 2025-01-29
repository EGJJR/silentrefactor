'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';

export function AddRepositoryModal() {
  const [open, setOpen] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGitHubRepos = async () => {
    const res = await fetch('/api/github/repositories');
    const data = await res.json();
    setRepositories(data);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => {
        setOpen(true);
        fetchGitHubRepos();
      }}>
        <GitBranch className="h-4 w-4 mr-2" />
        Add Repository
      </Button>

      <Dialog.Content className="sm:max-w-xl">
        <Dialog.Header>
          <Dialog.Title>Add Repository</Dialog.Title>
          <Dialog.Description>
            Select a repository to start monitoring
          </Dialog.Description>
        </Dialog.Header>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div>Loading repositories...</div>
          ) : (
            repositories.map((repo: any) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{repo.name}</p>
                  <p className="text-sm text-gray-500">{repo.description}</p>
                </div>
                <Button
                  onClick={() => {
                    // Add repository
                    setOpen(false);
                  }}
                >
                  Add
                </Button>
              </div>
            ))
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
} 