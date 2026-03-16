"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { CalendarDays } from "lucide-react";
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
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function MonthlyReviewPage() {
    const { user } = useUser();
    const [budgetList, setBudgetList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear] = useState(new Date().getFullYear());
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
                ...getTableColumns(Budgets),
                totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                totalItem: sql`COALESCE(count(${Expenses.id}), 0)`.mapWith(Number),
            })
            .from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
            .groupBy(Budgets.id);
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

    // Filter expenses for selected month
    const filteredExpenses = expensesList.filter((expense) => {
        const parts = expense.createdAt.split("/");
        const expMonth = parseInt(parts[1]) - 1;
        const expYear = parseInt(parts[2]);
        return expMonth === selectedMonth && expYear === selectedYear;
    });

    // Total spent this month
    const totalSpentThisMonth = filteredExpenses.reduce(
        (sum, e) => sum + Number(e.amount), 0
    );

    // Total budget
    const totalBudget = budgetList.reduce(
        (sum, b) => sum + Number(b.amount), 0
    );

    // Budget vs Spent bar chart data
    const barChartData = budgetList.map((budget) => {
        const budgetExpenses = filteredExpenses.filter(
            (e) => e.budgetName === budget.name
        );
        const spent = budgetExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        return {
            name: budget.icon + " " + budget.name,
            Budget: Number(budget.amount),
            Spent: spent,
        };
    });

    // Pie chart data — spending by budget
    const pieChartData = budgetList
        .map((budget) => {
            const budgetExpenses = filteredExpenses.filter(
                (e) => e.budgetName === budget.name
            );
            const spent = budgetExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
            return {
                name: budget.icon + " " + budget.name,
                value: spent,
            };
        })
        .filter((item) => item.value > 0);

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Monthly Review</h1>
                        <p className="text-sm text-gray-400">Track your spending month by month</p>
                    </div>
                </div>

                {/* Month Selector */}
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                    {MONTHS.map((month, index) => (
                        <option key={month} value={index}>{month} {selectedYear}</option>
                    ))}
                </select>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-indigo-600">₹{totalBudget.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">across {budgetList.length} budgets</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Spent in {MONTHS[selectedMonth]}</p>
                    <p className="text-2xl font-bold text-orange-500">₹{totalSpentThisMonth.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{filteredExpenses.length} transactions</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Remaining</p>
                    <p className={`text-2xl font-bold ${totalBudget - totalSpentThisMonth >= 0 ? "text-green-500" : "text-red-500"}`}>
                        ₹{(totalBudget - totalSpentThisMonth).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {totalBudget > 0 ? ((totalSpentThisMonth / totalBudget) * 100).toFixed(1) : 0}% used
                    </p>
                </div>
            </div>

            {/* Bar Chart — Budget vs Spent */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Budget vs Spent — {MONTHS[selectedMonth]}</h2>
                {barChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                        No data for this month
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                angle={-30}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                            <Tooltip
                                formatter={(value) => `₹${Number(value).toLocaleString()}`}
                                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            <Bar dataKey="Budget" fill="#e0e7ff" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bottom Row — Pie Chart + Expense List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Spending Breakdown</h2>
                    {pieChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                            No spending data for this month
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
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

                {/* Expense List */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Transactions in {MONTHS[selectedMonth]}
                    </h2>
                    {filteredExpenses.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                            No transactions this month
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {filteredExpenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-lg">
                                            {expense.budgetIcon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{expense.name}</p>
                                            <p className="text-xs text-gray-400">{expense.budgetName} · {expense.createdAt}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
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

export default MonthlyReviewPage;