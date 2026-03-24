"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, ShieldCheck, PiggyBank, TrendingUp, ReceiptText } from "lucide-react";

function Hero() {
  const { isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="bg-gray-950 text-white overflow-hidden">

      {/* Hero Section */}
      <section className="relative overflow-hidden">

        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-6 py-8 sm:py-10">
          <div className="grid md:grid-cols-2 items-center gap-10">

            {/* Left Text */}
            <div>

              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3 transition-all duration-700"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateX(0)" : "translateX(-20px)",
                  transitionDelay: "200ms"
                }}
              >
                <TrendingUp className="w-3 h-3" />
                Smart Expense Tracking
              </div>

              {/* Heading */}
              <h1
                className="text-5xl sm:text-6xl font-bold leading-tight mb-3 transition-all duration-700 font-(family-name:--font-cormorant)"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transitionDelay: "400ms"
                }}
              >
                Manage your
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                  Expenses Smartly
                </span>
              </h1>

              {/* Description */}
              <p
                className="text-gray-400 text-sm leading-relaxed mb-4 max-w-md transition-all duration-700"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transitionDelay: "550ms"
                }}
              >
                Take full control of your finances. Create budgets, track expenses,
                and grow your savings — all in one beautiful dashboard.
              </p>

              {/* CTA Buttons */}
              <div
                className="flex flex-wrap gap-3 mb-4 transition-all duration-700"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transitionDelay: "700ms"
                }}
              >
                <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-indigo-900/50 hover:scale-105">
                    {isSignedIn ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a href="#features">
                  <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-indigo-900/50 hover:scale-105">
                    See How It Works
                  </button>
                </a>
              </div>

              {/* Trust Badges */}
              <div
                className="flex flex-wrap gap-5 mt-3 transition-all duration-700"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transitionDelay: "900ms"
                }}
              >
                {[
                  { icon: ShieldCheck, text: "100% Secure" },
                  { icon: PiggyBank, text: "Smart Budgets" },
                  { icon: TrendingUp, text: "Track Growth" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div
              className="relative h-85 flex items-center justify-center transition-all duration-1000"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.9)",
                transitionDelay: "500ms"
              }}
            >
              {/* Orbiting Rings */}
              <div className="absolute w-70 h-70 rounded-full border border-indigo-500/15" />
              <div
                className="absolute w-50 h-50 rounded-full border border-indigo-500/20 animate-spin"
                style={{ animationDuration: "20s" }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
              </div>
              <div
                className="absolute w-32.5 h-32.5 rounded-full border border-purple-500/25"
                style={{ animation: "spin 14s linear infinite reverse" }}
              >
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />
              </div>

              {/* Sparkle Dots */}
              <div className="absolute top-14 left-14 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              <div className="absolute top-24 right-10 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
              <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-14 right-14 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />

              {/* Center Card */}
              <div className="absolute z-10 bg-linear-to-br from-indigo-950 to-indigo-900 border border-indigo-500/30 rounded-2xl px-5 py-4 text-center shadow-2xl">
                <div className="text-2xl mb-1">💰</div>
                <p className="text-lg font-bold text-indigo-300">₹1.2L</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Budget</p>
              </div>

              {/* Floating Card 1 — Groceries */}
              <div
                className="absolute top-5 right-4 bg-gray-900/90 border border-indigo-500/20 rounded-xl px-3 py-2.5 backdrop-blur-sm shadow-xl"
                style={{ animation: "float1 4s ease-in-out infinite" }}
              >
                <p className="text-xs text-gray-500 mb-1">Groceries 🛒</p>
                <p className="text-sm font-bold text-white">₹8,200</p>
                <div className="w-20 h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "68%" }} />
                </div>
                <p className="text-xs text-indigo-400 mt-1">68% used</p>
              </div>

              {/* Floating Card 2 — Entertainment */}
              <div
                className="absolute bottom-8 right-6 bg-gray-900/90 border border-red-500/20 rounded-xl px-3 py-2.5 backdrop-blur-sm shadow-xl"
                style={{ animation: "float2 5s ease-in-out infinite 0.5s" }}
              >
                <p className="text-xs text-gray-500 mb-1">Entertainment 🎮</p>
                <p className="text-sm font-bold text-white">₹4,800</p>
                <div className="w-20 h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "96%" }} />
                </div>
                <p className="text-xs text-red-400 mt-1">96% used ⚠️</p>
              </div>

              {/* Floating Card 3 — Savings */}
              <div
                className="absolute bottom-12 left-4 bg-gray-900/90 border border-green-500/20 rounded-xl px-3 py-2.5 backdrop-blur-sm shadow-xl"
                style={{ animation: "float3 4.5s ease-in-out infinite 1s" }}
              >
                <p className="text-xs text-gray-500 mb-1">Savings 🐷</p>
                <p className="text-sm font-bold text-white">₹12,500</p>
                <p className="text-xs text-green-400 mt-1">↑ +2.4% this month</p>
              </div>

              {/* Floating Card 4 — Transport */}
              <div
                className="absolute top-10 left-6 bg-gray-900/90 border border-indigo-500/20 rounded-xl px-3 py-2.5 backdrop-blur-sm shadow-xl"
                style={{ animation: "float4 3.5s ease-in-out infinite 0.3s" }}
              >
                <p className="text-xs text-gray-500 mb-1">Transport 🚗</p>
                <p className="text-sm font-bold text-white">₹2,100</p>
                <div className="w-20 h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "26%" }} />
                </div>
                <p className="text-xs text-green-400 mt-1">26% used</p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-800/50">
        <div
          className="text-center mb-6 transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transitionDelay: "1000ms"
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-2 font-(family-name:--font-cormorant)">
            Everything you need to
            <span className="text-indigo-400"> stay on budget</span>
          </h2>
          <p className="text-gray-400 text-m max-w-xl mx-auto">
            Powerful tools to help you understand where your money goes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          {[
            {
              icon: PiggyBank,
              title: "Budget Creation",
              desc: "Create unlimited budgets with custom icons and amounts.",
              color: "indigo",
              delay: "1100ms"
            },
            {
              icon: ReceiptText,
              title: "Expense Tracking",
              desc: "Log every expense instantly with detailed breakdowns.",
              color: "purple",
              delay: "1250ms"
            },
            {
              icon: TrendingUp,
              title: "Spending Insights",
              desc: "Visual charts and stats show your spending health at a glance.",
              color: "pink",
              delay: "1400ms"
            },
          ].map(({ icon: Icon, title, desc, color, delay }) => (
            <div
              key={title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-900/20 group"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
                transitionDelay: delay
              }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3
                ${color === 'indigo' ? 'bg-indigo-600/20' : color === 'purple' ? 'bg-purple-600/20' : 'bg-pink-600/20'}`}>
                <Icon className={`w-5 h-5
                  ${color === 'indigo' ? 'text-indigo-400' : color === 'purple' ? 'text-purple-400' : 'text-pink-400'}`} />
              </div>
              <h3 className="text-white font-semibold text-medium mb-1">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="border-t border-gray-800 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transitionDelay: "1500ms"
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3 font-(family-name:--font-cormorant)">
            Ready to take control of
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400"> your money?</span>
          </h2>
          <p className="text-gray-400 text-medium mb-6">
            Join the users who are already saving smarter with Expense Tracker.
          </p>
          <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
            <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-indigo-900/50 hover:scale-105">
              {isSignedIn ? "Go to Dashboard" : "Lets Get Started"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

    </main>
  );
}

export default Hero;