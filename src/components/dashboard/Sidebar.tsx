'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, GitBranch, Settings, Activity } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Repositories', href: '/dashboard/repositories', icon: GitBranch },
    { name: 'Activity', href: '/dashboard/activity', icon: Activity },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold">Silent Refactor</h1>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
                isActive 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 