import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-950 overflow-hidden">

      {/* Background Rings */}
      <div className="absolute w-150 h-150 rounded-full border border-indigo-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-112.5 h-112.5 rounded-full border border-indigo-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-75 h-75 rounded-full border border-indigo-500/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Glow Effects */}
      <div className="absolute w-100 h-100 bg-indigo-600/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute w-50 h-50 bg-purple-600/10 rounded-full blur-3xl top-20 right-20 animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Floating Cards */}
      <div className="absolute top-16 left-16 bg-gray-900/90 border border-indigo-500/20 rounded-xl px-4 py-3 backdrop-blur-sm hidden md:block"
        style={{ animation: "float1 4s ease-in-out infinite" }}>
        <p className="text-xs text-gray-500 mb-1">Total Budget 💰</p>
        <p className="text-sm font-bold text-white">₹1,20,000</p>
        <p className="text-xs text-indigo-400 mt-1">4 active budgets</p>
      </div>

      <div className="absolute top-16 right-16 bg-gray-900/90 border border-green-500/20 rounded-xl px-4 py-3 backdrop-blur-sm hidden md:block"
        style={{ animation: "float2 5s ease-in-out infinite 0.5s" }}>
        <p className="text-xs text-gray-500 mb-1">Total Saved 🐷</p>
        <p className="text-sm font-bold text-green-400">₹78,000</p>
        <p className="text-xs text-green-400 mt-1">↑ +12% this month</p>
      </div>

      <div className="absolute bottom-16 left-16 bg-gray-900/90 border border-purple-500/20 rounded-xl px-4 py-3 backdrop-blur-sm hidden md:block"
        style={{ animation: "float3 4.5s ease-in-out infinite 1s" }}>
        <p className="text-xs text-gray-500 mb-1">Expenses 🧾</p>
        <p className="text-sm font-bold text-white">₹42,000</p>
        <p className="text-xs text-orange-400 mt-1">35% of budget used</p>
      </div>

      <div className="absolute bottom-16 right-16 bg-gray-900/90 border border-indigo-500/20 rounded-xl px-4 py-3 backdrop-blur-sm hidden md:block"
        style={{ animation: "float4 3.5s ease-in-out infinite 0.3s" }}>
        <p className="text-xs text-gray-500 mb-1">100% Secure 🔒</p>
        <p className="text-sm font-bold text-indigo-400">Clerk Auth</p>
        <p className="text-xs text-gray-500 mt-1">End-to-end encrypted</p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            💰
          </div>
          <h1 className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: "var(--font-cormorant), serif" }}>
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">Sign up and start tracking your expenses</p>
        </div>

        {/* Clerk SignUp */}
        <div>
          <SignUp />
        </div>

      </div>

      {/* Animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

    </div>
  );
}