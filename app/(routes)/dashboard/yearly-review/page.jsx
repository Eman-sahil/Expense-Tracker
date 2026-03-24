"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, sql } from "drizzle-orm";
import { CalendarRange, TrendingUp, TrendingDown, Wallet, PiggyBank, ChevronDown, Award, Flame } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    AreaChart, Area, LineChart, Line,
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

function YearlyReviewPage() {
    const { user } = useUser();
    const [budgetList, setBudgetList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => { user && fetchData(); }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try { await Promise.all([getBudgets(), getExpenses()]); }
        finally { setLoading(false); }
    };

    const getBudgets = async () => {
        const result = await db.select({
            id: Budgets.id, name: Budgets.name, amount: Budgets.amount, icon: Budgets.icon, createdBy: Budgets.createdBy,
            totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
            totalItem: sql`COALESCE(count(${Expenses.id}), 0)`.mapWith(Number),
        }).from(Budgets).leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
            .groupBy(Budgets.id, Budgets.name, Budgets.amount, Budgets.icon, Budgets.createdBy);
        setBudgetList(result);
    };

    const getExpenses = async () => {
        const result = await db.select({
            id: Expenses.id, name: Expenses.name, amount: Expenses.amount,
            createdAt: Expenses.createdAt, budgetName: Budgets.name, budgetIcon: Budgets.icon,
            budgetId: Expenses.budgetId,
        }).from(Expenses).innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
        setExpensesList(result);
    };

    // Filter expenses for selected year
    const yearlyExpenses = expensesList.filter((e) => {
        const parts = e.createdAt.split("/");
        return parseInt(parts[2]) === selectedYear;
    });

    // Monthly breakdown for selected year
    const monthlyData = MONTHS.map((month, index) => {
        const monthExpenses = yearlyExpenses.filter((e) => parseInt(e.createdAt.split("/")[1]) - 1 === index);
        const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        return { month, Spending: total, count: monthExpenses.length };
    });

    // Stats
    const totalBudget = budgetList.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpentYearly = yearlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalRemaining = totalBudget - totalSpentYearly;
    const avgMonthlySpend = totalSpentYearly / 12;
    const peakMonth = monthlyData.reduce((max, m) => m.Spending > max.Spending ? m : max, monthlyData[0]);
    const lowestMonth = monthlyData.filter(m => m.Spending > 0).reduce((min, m) => m.Spending < min.Spending ? m : min, { Spending: Infinity, month: "N/A" });

    // Category breakdown for year
    const categoryData = budgetList.map((budget) => {
        const spent = yearlyExpenses.filter((e) => e.budgetName === budget.name)
            .reduce((sum, e) => sum + Number(e.amount), 0);
        return { name: budget.icon + " " + budget.name, value: spent, budget: Number(budget.amount) };
    }).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);

    // Quarter breakdown
    const quarterData = [
        { quarter: "Q1", months: "Jan-Mar", spending: monthlyData.slice(0, 3).reduce((sum, m) => sum + m.Spending, 0) },
        { quarter: "Q2", months: "Apr-Jun", spending: monthlyData.slice(3, 6).reduce((sum, m) => sum + m.Spending, 0) },
        { quarter: "Q3", months: "Jul-Sep", spending: monthlyData.slice(6, 9).reduce((sum, m) => sum + m.Spending, 0) },
        { quarter: "Q4", months: "Oct-Dec", spending: monthlyData.slice(9, 12).reduce((sum, m) => sum + m.Spending, 0) },
    ];

    // Top expenses for year
    const topExpenses = [...yearlyExpenses].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

    // Monthly comparison line chart
    const monthlyComparisonData = MONTHS.map((month, index) => {
        const currentYearSpend = expensesList.filter((e) => {
            const parts = e.createdAt.split("/");
            return parseInt(parts[1]) - 1 === index && parseInt(parts[2]) === selectedYear;
        }).reduce((sum, e) => sum + Number(e.amount), 0);

        const prevYearSpend = expensesList.filter((e) => {
            const parts = e.createdAt.split("/");
            return parseInt(parts[1]) - 1 === index && parseInt(parts[2]) === selectedYear - 1;
        }).reduce((sum, e) => sum + Number(e.amount), 0);

        return { month, [selectedYear]: currentYearSpend, [selectedYear - 1]: prevYearSpend };
    });

    const statsConfig = [
        {
            label: "Total Budget",
            value: `₹${totalBudget.toLocaleString()}`,
            sub: `${budgetList.length} active budgets`,
            icon: Wallet,
            gradient: "from-indigo-500/20 via-indigo-600/10 to-transparent",
            border: "border-indigo-500/25",
            iconBg: "bg-indigo-500/15 border-indigo-500/25",
            iconColor: "text-indigo-400",
            textColor: "text-indigo-300",
        },
        {
            label: `Total Spent in ${selectedYear}`,
            value: `₹${totalSpentYearly.toLocaleString()}`,
            sub: `${yearlyExpenses.length} transactions`,
            icon: TrendingDown,
            gradient: "from-orange-500/20 via-orange-600/10 to-transparent",
            border: "border-orange-500/25",
            iconBg: "bg-orange-500/15 border-orange-500/25",
            iconColor: "text-orange-400",
            textColor: "text-orange-300",
        },
        {
            label: "Avg Monthly Spend",
            value: `₹${Math.round(avgMonthlySpend).toLocaleString()}`,
            sub: "per month average",
            icon: TrendingUp,
            gradient: "from-purple-500/20 via-purple-600/10 to-transparent",
            border: "border-purple-500/25",
            iconBg: "bg-purple-500/15 border-purple-500/25",
            iconColor: "text-purple-400",
            textColor: "text-purple-300",
        },
        {
            label: "Remaining Balance",
            value: `₹${Math.abs(totalRemaining).toLocaleString()}`,
            sub: totalRemaining >= 0 ? "available to spend" : "over budget",
            icon: PiggyBank,
            gradient: totalRemaining >= 0 ? "from-emerald-500/20 via-emerald-600/10 to-transparent" : "from-red-500/20 via-red-600/10 to-transparent",
            border: totalRemaining >= 0 ? "border-emerald-500/25" : "border-red-500/25",
            iconBg: totalRemaining >= 0 ? "bg-emerald-500/15 border-emerald-500/25" : "bg-red-500/15 border-red-500/25",
            iconColor: totalRemaining >= 0 ? "text-emerald-400" : "text-red-400",
            textColor: totalRemaining >= 0 ? "text-emerald-300" : "text-red-300",
        },
    ];

    return (
        <div className="space-y-6 relative">

            {/* Ambient glow */}
            <div className="fixed top-20 right-20 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 left-80 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
                        <CalendarRange className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            Yearly Review
                        </h1>
                        <p className="text-sm text-gray-500">Your complete financial year at a glance</p>
                    </div>
                </div>

                {/* Year Selector */}
                <div className="relative">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="appearance-none pl-4 pr-10 py-2.5 bg-gray-900 border border-gray-700/50 rounded-xl text-sm text-gray-300 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-2xl p-5 border border-white/5 bg-white/3 animate-pulse h-32" />
                    ))
                ) : statsConfig.map(({ label, value, sub, icon: Icon, gradient, border, iconBg, iconColor, textColor }) => (
                    <div key={label}
                        className={`relative overflow-hidden rounded-2xl border ${border} bg-gray-950 hover:scale-[1.02] transition-all duration-300 group`}>
                        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-70`} />
                        <div className="relative p-5">
                            <div className={`w-11 h-11 ${iconBg} border rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`w-5 h-5 ${iconColor}`} />
                            </div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                            <p className={`text-xl font-bold ${textColor}`}
                                style={{ fontFamily: "var(--font-cormorant), serif" }}>
                                {value}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Highlights Row */}
            {!loading && yearlyExpenses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Peak Month */}
                    <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gray-950 p-5">
                        <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-transparent" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/15 border border-orange-500/25 rounded-xl flex items-center justify-center shrink-0">
                                <Flame className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Peak Month</p>
                                <p className="text-lg font-bold text-orange-300"
                                    style={{ fontFamily: "var(--font-cormorant), serif" }}>
                                    {peakMonth.month}
                                </p>
                                <p className="text-xs text-gray-600">₹{peakMonth.Spending.toLocaleString()} spent</p>
                            </div>
                        </div>
                    </div>

                    {/* Best Month */}
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gray-950 p-5">
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/25 rounded-xl flex items-center justify-center shrink-0">
                                <Award className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Most Frugal</p>
                                <p className="text-lg font-bold text-emerald-300"
                                    style={{ fontFamily: "var(--font-cormorant), serif" }}>
                                    {lowestMonth.month === "N/A" ? "N/A" : lowestMonth.month}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {lowestMonth.month === "N/A" ? "No data" : `₹${lowestMonth.Spending.toLocaleString()} spent`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Biggest Category */}
                    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gray-950 p-5">
                        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/15 border border-indigo-500/25 rounded-xl flex items-center justify-center text-2xl shrink-0">
                                {categoryData[0]?.name.split(" ")[0] || "📊"}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Top Category</p>
                                <p className="text-lg font-bold text-indigo-300 truncate"
                                    style={{ fontFamily: "var(--font-cormorant), serif" }}>
                                    {categoryData[0]?.name.split(" ").slice(1).join(" ") || "N/A"}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {categoryData[0] ? `₹${categoryData[0].value.toLocaleString()} spent` : "No data"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Year Comparison Line Chart */}
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 p-6">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent" />
                <div className="relative">
                    <h2 className="text-xl font-bold text-white mb-1"
                        style={{ fontFamily: "var(--font-cormorant), serif" }}>
                        Year over Year Comparison
                    </h2>
                    <p className="text-xs text-gray-600 mb-6">{selectedYear} vs {selectedYear - 1} spending comparison</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={monthlyComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4b5563" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} contentStyle={darkTooltip} />
                            <Legend wrapperStyle={{ color: "#6b7280", fontSize: "12px" }} />
                            <Line type="monotone" dataKey={String(selectedYear)} stroke="#6366f1" strokeWidth={2.5}
                                dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
                            <Line type="monotone" dataKey={String(selectedYear - 1)} stroke="#4b5563" strokeWidth={2}
                                strokeDasharray="5 5" dot={{ fill: "#4b5563", r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quarter Breakdown */}
            <div className="grid grid-cols-1 lg:col-span-2 gap-5">

                {/* Quarter Breakdown */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 p-6">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent" />
                    <div className="relative">
                        <h2 className="text-xl font-bold text-white mb-1"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            Quarterly Breakdown
                        </h2>
                        <p className="text-xs text-gray-600 mb-5">Spending split across 4 quarters</p>
                        {yearlyExpenses.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-gray-600 text-sm">No data for {selectedYear}</div>
                        ) : (
                            <div className="space-y-4">
                                {quarterData.map((q, index) => {
                                    const pct = totalSpentYearly > 0 ? (q.spending / totalSpentYearly) * 100 : 0;
                                    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];
                                    return (
                                        <div key={q.quarter}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-300">{q.quarter}</span>
                                                    <span className="text-xs text-gray-600">{q.months}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-gray-200">₹{q.spending.toLocaleString()}</span>
                                                    <span className="text-xs text-gray-600 ml-2">({pct.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                                                <div className="h-2.5 rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, backgroundColor: colors[index] }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Category Bar + Top Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Category Spending Bar */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 p-6">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent" />
                    <div className="relative">
                        <h2 className="text-xl font-bold text-white mb-1"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            Category vs Budget
                        </h2>
                        <p className="text-xs text-gray-600 mb-4">How much you spent vs your budget per category</p>
                        {categoryData.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-gray-600 text-sm">No data available</div>
                        ) : (
                            <div className="space-y-4">
                                {categoryData.map((item, index) => {
                                    const pct = item.budget > 0 ? Math.min((item.value / item.budget) * 100, 100) : 0;
                                    const isOver = item.value > item.budget;
                                    return (
                                        <div key={item.name}>
                                            <div className="flex justify-between mb-1.5">
                                                <span className="text-sm font-medium text-gray-300">{item.name}</span>
                                                <span className={`text-xs font-semibold ${isOver ? 'text-red-400' : 'text-gray-500'}`}>
                                                    ₹{item.value.toLocaleString()} / ₹{item.budget.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                                <div className="h-2 rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${pct}%`,
                                                        backgroundColor: isOver ? "#ef4444" : COLORS[index % COLORS.length]
                                                    }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Expenses */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 p-6">
                    <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent" />
                    <div className="relative">
                        <h2 className="text-xl font-bold text-white mb-1"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            Top Expenses of {selectedYear}
                        </h2>
                        <p className="text-xs text-gray-600 mb-5">Your biggest spending transactions this year</p>
                        {topExpenses.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-gray-600 text-sm">No expenses for {selectedYear}</div>
                        ) : (
                            <div className="space-y-3">
                                {topExpenses.map((expense, index) => (
                                    <div key={expense.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/3 transition-colors"
                                        style={{ background: "rgba(255,255,255,0.02)" }}>
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-200 truncate">{expense.name}</p>
                                            <p className="text-xs text-gray-600">{expense.budgetIcon} {expense.budgetName} · {expense.createdAt}</p>
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
        </div>
    );
}

export default YearlyReviewPage;