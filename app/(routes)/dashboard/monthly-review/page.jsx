"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { CalendarDays, TrendingUp, TrendingDown, Wallet, ChevronDown } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const darkTooltip = {
    backgroundColor: "#0f172a",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "12px",
    color: "#e2e8f0",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
};

function MonthlyReviewPage() {
    const { user } = useUser();
    const [budgetList, setBudgetList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => { user && fetchData(); }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try { await Promise.all([getBudgets(), getExpenses()]); }
        finally { setLoading(false); }
    };

    const getBudgets = async () => {
        const result = await db.select({
            ...getTableColumns(Budgets),
            totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
            totalItem: sql`COALESCE(count(${Expenses.id}), 0)`.mapWith(Number),
        }).from(Budgets).leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)).groupBy(Budgets.id);
        setBudgetList(result);
    };

    const getExpenses = async () => {
        const result = await db.select({
            id: Expenses.id, name: Expenses.name, amount: Expenses.amount,
            createdAt: Expenses.createdAt, budgetName: Budgets.name, budgetIcon: Budgets.icon,
        }).from(Expenses).innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
        setExpensesList(result);
    };

    const filteredExpenses = expensesList.filter((e) => {
        const parts = e.createdAt.split("/");
        return parseInt(parts[1]) - 1 === selectedMonth && parseInt(parts[2]) === selectedYear;
    });

    const totalSpentThisMonth = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalBudget = budgetList.reduce((sum, b) => sum + Number(b.amount), 0);
    const remaining = totalBudget - totalSpentThisMonth;
    const spentPercent = totalBudget > 0 ? ((totalSpentThisMonth / totalBudget) * 100).toFixed(1) : 0;

    const barChartData = budgetList.map((budget) => {
        const spent = filteredExpenses.filter((e) => e.budgetName === budget.name)
            .reduce((sum, e) => sum + Number(e.amount), 0);
        return { name: budget.icon + " " + budget.name, Budget: Number(budget.amount), Spent: spent };
    });

    const pieChartData = budgetList.map((budget) => {
        const spent = filteredExpenses.filter((e) => e.budgetName === budget.name)
            .reduce((sum, e) => sum + Number(e.amount), 0);
        return { name: budget.icon + " " + budget.name, value: spent };
    }).filter((item) => item.value > 0);

    const stats = [
        {
            label: "Total Budget",
            value: `₹${totalBudget.toLocaleString()}`,
            sub: `${budgetList.length} active budgets`,
            icon: Wallet,
            gradient: "from-indigo-500/20 via-indigo-600/10 to-transparent",
            border: "border-indigo-500/25",
            iconBg: "bg-indigo-500/15 border-indigo-500/25",
            icon_color: "text-indigo-400",
            text: "text-indigo-300",
        },
        {
            label: `Spent in ${MONTHS[selectedMonth]}`,
            value: `₹${totalSpentThisMonth.toLocaleString()}`,
            sub: `${filteredExpenses.length} transactions`,
            icon: TrendingDown,
            gradient: "from-orange-500/20 via-orange-600/10 to-transparent",
            border: "border-orange-500/25",
            iconBg: "bg-orange-500/15 border-orange-500/25",
            icon_color: "text-orange-400",
            text: "text-orange-300",
        },
        {
            label: "Remaining",
            value: `₹${Math.abs(remaining).toLocaleString()}`,
            sub: `${spentPercent}% of budget used`,
            icon: TrendingUp,
            gradient: remaining >= 0 ? "from-emerald-500/20 via-emerald-600/10 to-transparent" : "from-red-500/20 via-red-600/10 to-transparent",
            border: remaining >= 0 ? "border-emerald-500/25" : "border-red-500/25",
            iconBg: remaining >= 0 ? "bg-emerald-500/15 border-emerald-500/25" : "bg-red-500/15 border-red-500/25",
            icon_color: remaining >= 0 ? "text-emerald-400" : "text-red-400",
            text: remaining >= 0 ? "text-emerald-300" : "text-red-300",
        },
    ];

    return (
        <div className="space-y-6 relative">

            {/* Ambient glow */}
            <div className="fixed top-20 right-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 left-80 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                        <CalendarDays className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            Monthly Review
                        </h1>
                        <p className="text-sm text-gray-500">Track your spending month by month</p>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="relative">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="appearance-none pl-4 pr-10 py-2.5 bg-gray-900 border border-gray-700/50 rounded-xl text-sm  text-gray-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                    >
                        {MONTHS.map((month, index) => (
                            <option key={month} value={index}>{month} {selectedYear}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="rounded-2xl p-5 border border-white/5 bg-white/3 animate-pulse h-32" />
                    ))
                ) : stats.map(({ label, value, sub, icon: Icon, gradient, border, iconBg, icon_color, text }) => (
                    <div key={label}
                        className={`relative overflow-hidden rounded-2xl border ${border} bg-gray-950 hover:scale-[1.02] transition-all duration-300`}>
                        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-70`} />
                        <div className="relative p-5">
                            <div className={`w-11 h-11 ${iconBg} border rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={`w-5 h-5 ${icon_color}`} />
                            </div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                            <p className={`text-2xl font-bold ${text}`}
                                style={{ fontFamily: "var(--font-cormorant), serif" }}>
                                {value}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bar Chart */}
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 p-6">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent" />
                <div className="relative">
                    <h2 className="text-xl font-bold text-white mb-1"
                        style={{ fontFamily: "var(--font-cormorant), serif" }}>
                        Budget vs Spent
                    </h2>
                    <p className="text-xs text-gray-600 mb-6">{MONTHS[selectedMonth]} {selectedYear}</p>
                    {barChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No data for this month</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4b5563" }} angle={-30} textAnchor="end" interval={0} />
                                <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} contentStyle={darkTooltip} />
                                <Legend wrapperStyle={{ paddingTop: "20px", color: "#6b7280" }} />
                                <Bar dataKey="Budget" fill="rgba(99,102,241,0.15)" radius={[6, 6, 0, 0]} stroke="rgba(99,102,241,0.3)" strokeWidth={1} />
                                <Bar dataKey="Spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:col-span-2 gap-5">


                {/* Transactions */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 p-6">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent" />
                    <div className="relative">
                        <h2 className="text-xl font-bold text-white mb-1"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            Transactions
                        </h2>
                        <p className="text-xs text-gray-600 mb-4">{filteredExpenses.length} entries in {MONTHS[selectedMonth]}</p>
                        {filteredExpenses.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No transactions this month</div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {filteredExpenses.map((expense, index) => (
                                    <div key={expense.id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:bg-white/3 transition-colors group"
                                        style={{ background: "rgba(255,255,255,0.02)" }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/15 rounded-xl flex items-center justify-center text-base">
                                                {expense.budgetIcon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-200">{expense.name}</p>
                                                <p className="text-xs text-gray-600">{expense.budgetName} · {expense.createdAt}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-indigo-400">
                                            ₹{Number(expense.amount).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MonthlyReviewPage;
