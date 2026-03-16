"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'
import { UserButton, useUser } from "@clerk/nextjs";
import Link from 'next/link';

export default function Header() {
  const { user, isSignedIn } = useUser();

  return (
    <header className="w-full bg-gray-950 border-b border-gray-800 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="logo"
            width={140}
            height={80}
            className="h-auto brightness-200"
          />
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all">
                  My Dashboard
                </Button>
              </Link>
              <UserButton fallbackRedirectUrl="/" />
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-900">
                Get Started
              </Button>
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}