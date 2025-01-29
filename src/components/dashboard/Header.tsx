'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
      router.push('/auth/signin');
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-gray-900">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <img
            src={session?.user?.image || 'https://github.com/ghost.png'}
            alt="Avatar"
            className="h-8 w-8 rounded-full ring-2 ring-white"
          />
          <button 
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}