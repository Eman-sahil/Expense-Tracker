"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql, desc } from "drizzle-orm";
import { PiggyBank, ReceiptText, Wallet, TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import StatsCard from "./_components/StatsCard";
import BudgetItem from "./budgets/_components/BudgetItem";
import SavingsTips from "./_components/saving-tips";
import Link from "next/link";

function Dashboard() {
    const { user } = useUser();
    const [budgetList, setBudgetList] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        user && fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([getBudgetList(), getRecentExpenses()]);
        } finally {
            setLoading(false);
        }
    };

    const getBudgetList = async () => {
        const result = await db
            .select({
                id: Budgets.id,
                name: Budgets.name,
                amount: Budgets.amount,
                icon: Budgets.icon,
                createdBy: Budgets.createdBy,
                totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                totalItem: sql`COALESCE(count(${Expenses.id}), 0)`.mapWith(Number),
            })
            .from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
            .groupBy(Budgets.id, Budgets.name, Budgets.amount, Budgets.icon, Budgets.createdBy)
            .orderBy(Budgets.id);
        setBudgetList(result);
    };

    const getRecentExpenses = async () => {
        const result = await db
            .select({
                id: Expenses.id,
                name: Expenses.name,
                amount: Expenses.amount,
                createdAt: Expenses.createdAt,
                budgetName: Budgets.name,
                budgetIcon: Budgets.icon,
            })
            .from(Expenses)
            .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
            .orderBy(desc(Expenses.id))
            .limit(6);
        setRecentExpenses(result);
    };

    const totalBudget = budgetList.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpend = budgetList.reduce((sum, b) => sum + (b.totalSpend || 0), 0);
    const totalRemaining = totalBudget - totalSpend;
    const spentPercent = totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : 0;

    const SkeletonCard = () => (
        <div className="rounded-2xl border border-white/5 bg-white/3 p-5 animate-pulse">
            <div className="w-10 h-10 bg-white/5 rounded-xl mb-4" />
            <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
            <div className="h-6 bg-white/5 rounded w-1/2" />
        </div>
    );

    return (
        <div className="space-y-6 relative">
            {/* Ambient background glow */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-64 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Greeting Banner */}
            <div
                className="relative overflow-hidden rounded-3xl border border-white/10"
                style={{
                    background: "linear-gradient(135deg, rgba(79,70,229,0.3) 0%, rgba(124,58,237,0.2) 50%, rgba(15,23,42,0.8) 100%)",
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.6s ease",
                }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-32 translate-x-32 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-24 -translate-x-24 blur-2xl" />
                <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                <div className="absolute top-8 right-12 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="absolute bottom-6 right-20 w-1 h-1 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />

                <div className="relative p-7">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs text-indigo-400 font-medium uppercase tracking-widest">Financial Overview</span>
                            </div>
                            <h1
                                className="text-3xl font-bold text-white mb-1"
                                style={{ fontFamily: "var(--font-cormorant), serif" }}
                            >
                                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.firstName || "there"} 👋
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Here's your financial snapshot for today
                            </p>

                            {totalBudget > 0 && (
                                <div className="mt-5 max-w-sm">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full inline-block"></span>
                                            Overall Spending
                                        </span>
                                        <span className="text-indigo-300 font-semibold">{spentPercent}% used</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${Math.min(spentPercent, 100)}%`,
                                                background: "linear-gradient(90deg, #6366f1, #a78bfa)"
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs mt-2 text-gray-500">
                                        <span>₹{totalSpend.toLocaleString()} spent</span>
                                        <span>₹{totalBudget.toLocaleString()} total</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden md:flex flex-col items-end gap-2">
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-right backdrop-blur-sm">
                                <p className="text-xs text-gray-500 mb-0.5">Remaining Balance</p>
                                <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                    style={{ fontFamily: "var(--font-cormorant), serif" }}>
                                    ₹{Math.abs(totalRemaining).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">{totalRemaining >= 0 ? 'available' : 'over budget'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                ) : (
                    <>
                        <StatsCard title="Total Budgets" value={budgetList.length} icon={PiggyBank} color="indigo" sub="active budgets" />
                        <StatsCard title="Total Budget" value={`₹${totalBudget.toLocaleString()}`} icon={Wallet} color="green" sub="allocated amount" />
                        <StatsCard title="Total Spent" value={`₹${totalSpend.toLocaleString()}`} icon={ReceiptText} color="orange" sub="across all budgets" />
                        <StatsCard title="Remaining" value={`₹${totalRemaining.toLocaleString()}`} icon={TrendingUp} color={totalRemaining >= 0 ? "green" : "red"} sub={totalRemaining >= 0 ? "available to spend" : "over budget"} />
                    </>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Budget List */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            My Budgets
                        </h2>
                        <Link href="/dashboard/budgets"
                            className="flex items-center gap-1 text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {loading
                            ? [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                            : budgetList.slice(0, 4).map(budget => (
                                <BudgetItem key={budget.id} budget={budget} />
                            ))
                        }
                    </div>
                    {!loading && budgetList.length === 0 && (
                        <div className="rounded-2xl p-8 border border-dashed border-gray-800 text-center bg-gray-900/30">
                            <p className="text-gray-500 text-sm mb-3">No budgets yet</p>
                            <Link href="/dashboard/budgets"
                                className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors">
                                Create your first budget →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Expenses */}
                <div className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            Recent
                        </h2>
                        <Link href="/dashboard/expenses"
                            className="flex items-center gap-1 text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="rounded-2xl border border-white/5 overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.02)" }}>
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-9 h-9 bg-white/5 rounded-xl shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-white/5 rounded w-3/4 mb-1.5" />
                                            <div className="h-2 bg-white/5 rounded w-1/2" />
                                        </div>
                                        <div className="h-4 bg-white/5 rounded w-14" />
                                    </div>
                                ))}
                            </div>
                        ) : recentExpenses.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-600 text-sm">No expenses yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {recentExpenses.map((expense, index) => (
                                    <div
                                        key={expense.id}
                                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/3 transition-colors group"
                                        style={{
                                            opacity: mounted ? 1 : 0,
                                            transform: mounted ? "translateX(0)" : "translateX(10px)",
                                            transition: `all 0.4s ease ${index * 0.07}s`
                                        }}
                                    >
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                                            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)" }}>
                                            {expense.budgetIcon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{expense.name}</p>
                                            <p className="text-xs text-gray-600 truncate">{expense.budgetName} · {expense.createdAt}</p>
                                        </div>
                                        <span className="text-sm font-bold text-indigo-400 shrink-0">
                                            ₹{Number(expense.amount).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Savings Tips */}
            <SavingsTips budgetList={budgetList} expensesList={recentExpenses} />
        </div>
    );
}

export default Dashboard;
