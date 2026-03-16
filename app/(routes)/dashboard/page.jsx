"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql, desc } from "drizzle-orm";
import { PiggyBank, ReceiptText, Wallet, TrendingUp } from "lucide-react";
import StatsCard from "./_components/StatsCard";
import BudgetItem from "./budgets/_components/BudgetItem";
import SavingsTips from "./_components/saving-tips";
import Link from "next/link";

function Dashboard() {
    const { user } = useUser();
    const [budgetList, setBudgetList] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                ...getTableColumns(Budgets),
                totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                totalItem: sql`COALESCE(count(${Expenses.id}), 0)`.mapWith(Number),
            })
            .from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
            .groupBy(Budgets.id)
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

    return (
        <div className="space-y-8">

            {/* Greeting Banner */}
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-7 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            Hi, {user?.firstName || "there"}! 👋
                        </h1>
                        <p className="text-indigo-200 text-sm">
                            Here's a summary of your finances. Stay on track!
                        </p>
                    </div>
                    <div className="hidden sm:block text-5xl opacity-30">💰</div>
                </div>
                {totalBudget > 0 && (
                    <div className="mt-5">
                        <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
                            <span>Overall Spending</span>
                            <span>{((totalSpend / totalBudget) * 100).toFixed(1)}% of total budget</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full transition-all duration-700"
                                style={{ width: `${Math.min((totalSpend / totalBudget) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                            <div className="h-6 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatsCard
                            title="Total Budgets"
                            value={budgetList.length}
                            icon={PiggyBank}
                            color="indigo"
                            sub="active budgets"
                        />
                        <StatsCard
                            title="Total Budget"
                            value={`₹${totalBudget.toLocaleString()}`}
                            icon={Wallet}
                            color="green"
                            sub="allocated amount"
                        />
                        <StatsCard
                            title="Total Spent"
                            value={`₹${totalSpend.toLocaleString()}`}
                            icon={ReceiptText}
                            color="orange"
                            sub="across all budgets"
                        />
                        <StatsCard
                            title="Remaining"
                            value={`₹${totalRemaining.toLocaleString()}`}
                            icon={TrendingUp}
                            color={totalRemaining >= 0 ? "green" : "red"}
                            sub={totalRemaining >= 0 ? "available to spend" : "over budget"}
                        />
                    </>
                )}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Budget List */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">My Budgets</h2>
                        <Link href="/dashboard/budgets"
                            className="text-sm text-indigo-600 font-medium hover:underline">
                            View all →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {loading
                            ? [1, 2].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full" />
                                </div>
                            ))
                            : budgetList.slice(0, 4).map(budget => (
                                <BudgetItem key={budget.id} budget={budget} />
                            ))
                        }
                    </div>
                    {!loading && budgetList.length === 0 && (
                        <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center">
                            <p className="text-gray-400 text-sm mb-3">No budgets yet</p>
                            <Link href="/dashboard/budgets"
                                className="text-indigo-600 text-sm font-semibold hover:underline">
                                Create your first budget →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Expenses */}
                <div className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Expenses</h2>
                        <Link href="/dashboard/expenses"
                            className="text-sm text-indigo-600 font-medium hover:underline">
                            View all →
                        </Link>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-9 h-9 bg-gray-200 rounded-xl shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
                                            <div className="h-2 bg-gray-200 rounded w-1/2" />
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded w-16" />
                                    </div>
                                ))}
                            </div>
                        ) : recentExpenses.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-400 text-sm">No expenses yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {recentExpenses.map(expense => (
                                    <div key={expense.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-lg shrink-0">
                                            {expense.budgetIcon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{expense.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{expense.budgetName} · {expense.createdAt}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 shrink-0">
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
            <SavingsTips
                budgetList={budgetList}
                expensesList={recentExpenses}
            />

        </div>
    );
}

export default Dashboard;