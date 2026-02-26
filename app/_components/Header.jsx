import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

export default function Header() {
  return (
    <header className="w-full bg-gray-300 p-5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        <Image
          src="/logo.svg"
          alt="logo"
          width={0}
          height={0}
          sizes="100vw"
          className="w-24 sm:w-32 md:w-40 h-auto"
        />

        <Button className="bg-gray-600 text-white shadow-sm transition-colors hover:bg-black">
          Get Started
        </Button>

      </div>
    </header>
  )
}