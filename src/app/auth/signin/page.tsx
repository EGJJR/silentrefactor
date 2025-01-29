'use client'

import { signIn } from 'next-auth/react'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useEffect } from 'react'

export default function SignIn() {
  const searchParams = useSearchParams();
  const error = searchParams ? searchParams.get('error') : null;

  useEffect(() => {
    if (error) {
      toast.error('Authentication failed. Please try again.');
    }
  }, [error]);

  const handleSignIn = async () => {
    try {
      await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      toast.error('Failed to sign in with GitHub');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Silent Refactor
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with GitHub to start improving your code quality with AI
          </p>
        </div>

        <Button
          onClick={handleSignIn}
          className="w-full bg-[#24292F] hover:bg-[#24292F]/90 text-white"
        >
          <Github className="mr-2 h-5 w-5" />
          Continue with GitHub
        </Button>

        <p className="text-center text-sm text-gray-600">
          By clicking continue, you agree to our{' '}
          <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
} 