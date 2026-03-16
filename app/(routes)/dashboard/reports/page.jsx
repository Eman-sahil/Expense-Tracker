"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { BarChart2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ReportsPage() {
    const { user } = useUser();
    const [budgetList, setBudgetList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        user && fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([getBudgets(), getExpenses()]);
        } finally {
            setLoading(false);
        }
    };

    const getBudgets = async () => {
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
            .groupBy(
                Budgets.id,
                Budgets.name,
                Budgets.amount,
                Budgets.icon,
                Budgets.createdBy
            );
        setBudgetList(result);
    };

    const getExpenses = async () => {
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
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
        setExpensesList(result);
    };

    // Total stats
    const totalBudget = budgetList.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgetList.reduce((sum, b) => sum + (b.totalSpend || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const totalTransactions = expensesList.length;

    // Budget vs Spent bar chart
    const budgetVsSpentData = budgetList.map((budget) => ({
        name: budget.icon + " " + budget.name,
        Budget: Number(budget.amount),
        Spent: budget.totalSpend || 0,
    }));

    // Pie chart — spending by budget
    const pieData = budgetList
        .map((budget) => ({
            name: budget.icon + " " + budget.name,
            value: budget.totalSpend || 0,
        }))
        .filter((item) => item.value > 0);

    // Monthly spending trend — area chart
    const monthlyData = MONTHS.map((month, index) => {
        const monthExpenses = expensesList.filter((e) => {
            const parts = e.createdAt.split("/");
            return parseInt(parts[1]) - 1 === index;
        });
        const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        return { month, Spending: total };
    });

    // Top 5 expenses
    const topExpenses = [...expensesList]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5);

    // Spending by budget for horizontal bar
    const spendingByBudget = budgetList
        .map((b) => ({
            name: b.icon + " " + b.name,
            amount: b.totalSpend || 0,
            percentage: totalSpent > 0 ? ((b.totalSpend || 0) / totalSpent) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-28" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-sm text-gray-400">Visual overview of all your finances</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Budget",
                        value: `₹${totalBudget.toLocaleString()}`,
                        icon: Wallet,
                        color: "indigo",
                        sub: `${budgetList.length} budgets`
                    },
                    {
                        label: "Total Spent",
                        value: `₹${totalSpent.toLocaleString()}`,
                        icon: TrendingDown,
                        color: "orange",
                        sub: `${totalTransactions} transactions`
                    },
                    {
                        label: "Remaining",
                        value: `₹${totalRemaining.toLocaleString()}`,
                        icon: TrendingUp,
                        color: totalRemaining >= 0 ? "green" : "red",
                        sub: totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% used` : "0% used"
                    },
                    {
                        label: "Avg per Budget",
                        value: budgetList.length > 0 ? `₹${Math.round(totalSpent / budgetList.length).toLocaleString()}` : "₹0",
                        icon: BarChart2,
                        color: "purple",
                        sub: "average spending"
                    },
                ].map(({ label, value, icon: Icon, color, sub }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3
                            ${color === 'indigo' ? 'bg-indigo-50' : color === 'orange' ? 'bg-orange-50' : color === 'green' ? 'bg-green-50' : color === 'red' ? 'bg-red-50' : 'bg-purple-50'}`}>
                            <Icon className={`w-5 h-5
                                ${color === 'indigo' ? 'text-indigo-600' : color === 'orange' ? 'text-orange-600' : color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-purple-600'}`} />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className={`text-xl font-bold
                            ${color === 'indigo' ? 'text-indigo-600' : color === 'orange' ? 'text-orange-600' : color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-purple-600'}`}>
                            {value}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Spending Trend */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Spending Trend</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={monthlyData}>
                        <defs>
                            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <Tooltip
                            formatter={(value) => `₹${Number(value).toLocaleString()}`}
                            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Spending"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fill="url(#spendingGradient)"
                            dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Budget vs Spent + Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Budget vs Spent</h2>
                    {budgetVsSpentData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                            No budget data available
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={budgetVsSpentData} margin={{ bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <Tooltip
                                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                                />
                                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                                <Bar dataKey="Budget" fill="#e0e7ff" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="Spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h2>
                    {pieData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                            No spending data available
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

            </div>

            {/* Spending Share + Top Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Spending Share by Budget */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Spending Share</h2>
                    {spendingByBudget.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                            No data available
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {spendingByBudget.map((item, index) => (
                                <div key={item.name}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-gray-700">{item.name}</span>
                                        <span className="text-gray-500">
                                            ₹{item.amount.toLocaleString()} ({item.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${item.percentage}%`,
                                                backgroundColor: COLORS[index % COLORS.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top 5 Expenses */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Top 5 Expenses</h2>
                    {topExpenses.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                            No expenses recorded
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topExpenses.map((expense, index) => (
                                <div key={expense.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{expense.name}</p>
                                        <p className="text-xs text-gray-400">{expense.budgetIcon} {expense.budgetName}</p>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 flex shrink-0">
                                        ₹{Number(expense.amount).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}

export default ReportsPage;