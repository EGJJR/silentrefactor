'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Clock, Github, Mail, Shield, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Settings</h1>

      {/* Scan Settings */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold">Scan Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-500">Scan Frequency</label>
            <select className="w-full p-2 border rounded-md">
              <option value="6h">Every 6 hours</option>
              <option value="12h">Every 12 hours</option>
              <option value="24h">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Automatic PR Creation</p>
              <p className="text-sm text-gray-500">Create PRs automatically when issues are found</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Draft PRs</p>
              <p className="text-sm text-gray-500">Create PRs as drafts instead of ready for review</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">GitHub Notifications</p>
                <p className="text-sm text-gray-500">Receive updates via GitHub</p>
              </div>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Private Repositories Only</p>
              <p className="text-sm text-gray-500">Only scan private repositories</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-100">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}