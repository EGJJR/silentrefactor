'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import MaxWidthWrapper from '@/components/ui/MaxWidthWrapper'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

const tiers = [
  {
    name: 'Free',
    id: null,
    href: '/dashboard',
    priceMonthly: null,
    description: 'Perfect for trying out our AI refactoring capabilities.',
    features: [
      '1 repository',
      'Basic refactoring suggestions',
      'Community support',
      'Basic GitHub integration',
      'Weekly repository scans',
      '48-hour response time',
    ],
  },
  {
    name: 'Pro',
    id: 'pro',
    href: '/dashboard',
    priceMonthly: '$30',
    description: 'For developers who want to maintain high code quality.',
    features: [
      'Per repository pricing',
      'Advanced AI refactoring',
      'Priority support',
      'Advanced GitHub integration',
      'Custom rules and patterns',
      'Daily repository scans',
      '24/7 priority support',
      'API access',
    ],
  },
]

export default function PricingPage() {
  const { data: session } = useSession()

  return (
    <>
      <MaxWidthWrapper className='mb-8 mt-24 text-center max-w-5xl'>
        <div className='mx-auto mb-10 sm:max-w-lg'>
          <h1 className='text-6xl font-bold sm:text-7xl'>Pricing</h1>
          <p className='mt-5 text-gray-600 sm:text-lg'>
            Simple, transparent pricing per repository.
            Start with our free tier and upgrade as you grow.
          </p>
        </div>

        <div className='pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2'>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'relative flex flex-col justify-between rounded-2xl bg-white shadow-lg p-6',
                tier.name === 'Pro' && 'border-2 border-blue-600 shadow-blue-200'
              )}>
              {tier.name === 'Pro' && (
                <div className='absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white'>
                  Popular
                </div>
              )}

              <div>
                <h3 className='my-3 text-center text-3xl font-bold'>
                  {tier.name}
                </h3>
                <p className='text-gray-600'>{tier.description}</p>

                <p className='my-5 text-center font-bold'>
                  {tier.priceMonthly ? (
                    <>
                      <span className='text-4xl'>{tier.priceMonthly}</span>
                      <span className='text-xl'>/repository/month</span>
                    </>
                  ) : (
                    <span className='text-4xl'>Free</span>
                  )}
                </p>

                <ul className='mb-8 space-y-4'>
                  {tier.features.map((feature) => (
                    <li key={feature} className='flex items-center space-x-2'>
                      <Check className='h-5 w-5 text-green-500' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={session ? tier.href : '/auth/signin'}
                className={buttonVariants({
                  className: 'w-full mt-auto',
                  variant: tier.name === 'Pro' ? 'default' : 'outline',
                })}>
                {session ? 'Get started' : 'Sign up'}
              </Link>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </>
  )
}