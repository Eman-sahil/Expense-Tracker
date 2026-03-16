"use client"
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, ShieldCheck, PiggyBank, TrendingUp, ReceiptText } from "lucide-react";

function Hero() {
  const { isSignedIn } = useUser();

  return (
    <main className="bg-gray-950 min-h-screen text-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden">

        {/* Background Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-125 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-75 h-75 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="grid md:grid-cols-2 items-center gap-12">

            {/* Left Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <TrendingUp className="w-4 h-4" />
                Smart Expense Tracking
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
                Manage your
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                  Expenses Smartly
                </span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
                Take full control of your finances. Create budgets, track expenses,
                and grow your savings — all in one beautiful dashboard.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-900/50 hover:scale-105">
                    {isSignedIn ? "Go to Dashboard" : "Get Started "}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a href="#features">
                  <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all border border-gray-700">
                    See How It Works
                  </button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 mt-10">
                {[
                  { icon: ShieldCheck, text: "100% Secure" },
                  { icon: PiggyBank, text: "Smart Budgets" },
                  { icon: TrendingUp, text: "Track Growth" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-indigo-600/10 rounded-3xl blur-2xl" />
              <div className="relative z-10">
                <Image
                  src="/2.jpg"
                  alt="Illustration"
                  width={500}
                  height={400}
                  className="rounded-3xl drop-shadow-2xl"
                  style={{
                    maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">
            Everything you need to
            <span className="text-indigo-400"> stay on budget</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Powerful tools to help you understand where your money goes
            and make smarter financial decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: PiggyBank,
              title: "Budget Creation",
              desc: "Create unlimited budgets with custom icons and amounts. Organize your spending categories easily.",
              color: "indigo",
            },
            {
              icon: ReceiptText,
              title: "Expense Tracking",
              desc: "Log every expense instantly. See exactly where your money is going with detailed breakdowns.",
              color: "purple",
            },
            {
              icon: TrendingUp,
              title: "Spending Insights",
              desc: "Visual progress bars and stats show your spending health at a glance. Stay on track effortlessly.",
              color: "pink",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-900/20 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5
                ${color === 'indigo' ? 'bg-indigo-600/20' : color === 'purple' ? 'bg-purple-600/20' : 'bg-pink-600/20'}`}>
                <Icon className={`w-6 h-6
                  ${color === 'indigo' ? 'text-indigo-400' : color === 'purple' ? 'text-purple-400' : 'text-pink-400'}`} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to take control of
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400"> your money?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of users who are already saving smarter with Expense Tracker
          </p>
          <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
            <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-indigo-900/50 hover:scale-105">
              {isSignedIn ? "Go to Dashboard" : "Start for Free"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

    </main>
  );
}

export default Hero;