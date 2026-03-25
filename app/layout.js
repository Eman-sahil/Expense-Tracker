import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: "Expense Tracker",
  description: "Smart Expense Tracker App",
};

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className={`${cormorant.variable} ${dmSans.variable} antialiased`}>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}