'use client'

import Link from 'next/link'
import MaxWidthWrapper from '@/components/ui/MaxWidthWrapper'
import { buttonVariants } from '@/components/ui/button'
import { useSession, signIn } from 'next-auth/react'
import { ArrowRight } from 'lucide-react'
import UserAccountNav from '@/components/UserAccountNav'
import MobileNav from '@/components/MobileNav'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (pathname?.startsWith('/dashboard')) return null

  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
          <Link
            href='/'
            className='flex z-40 font-semibold'>
            <span>Silent Refactor</span>
          </Link>

          <MobileNav isAuth={!!session} />

          <div className='hidden items-center space-x-4 sm:flex'>
            {!session ? (
              <>
                <Link
                  href='/pricing'
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Pricing
                </Link>
                <button
                  onClick={() => signIn('github')}
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Sign in
                </button>
                <button
                  onClick={() => signIn('github')}
                  className={buttonVariants({
                    size: 'sm',
                  })}>
                  Get started{' '}
                  <ArrowRight className='ml-1.5 h-5 w-5' />
                </button>
              </>
            ) : (
              <>
                <Link
                  href='/dashboard'
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Dashboard
                </Link>

                <UserAccountNav
                  name={session.user?.name || 'Your Account'}
                  email={session.user?.email || ''}
                  imageUrl={session.user?.image || ''}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar