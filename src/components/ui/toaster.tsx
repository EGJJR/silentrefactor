'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner 
      position="bottom-right"
      theme="light"
      className="toaster group"
    />
  )
}