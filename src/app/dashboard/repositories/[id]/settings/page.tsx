'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export default function RepositorySettings({ params }: { params: { id: string } }) {
  const [settings, setSettings] = useState({
    automaticScanning: true,
    scanInterval: 6,
    branchPrefix: 'refactor/',
    maxPRsPerDay: 5
  });

  const handleSave = async () => {
    await fetch(`/api/repositories/${params.id}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Repository Settings</h1>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Scanning Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Automatic Scanning</p>
                <p className="text-sm text-gray-600">Automatically scan repository for issues</p>
              </div>
              <Switch 
                checked={settings.automaticScanning}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, automaticScanning: checked }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Scan Interval (hours)
              </label>
              <input
                type="number"
                value={settings.scanInterval}
                onChange={(e) => 
                  setSettings(s => ({ ...s, scanInterval: Number(e.target.value) }))
                }
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Card>

      <Card className="bg-red-50">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <Button variant="destructive">Remove Repository</Button>
        </div>
      </Card>
    </div>
  );
} 