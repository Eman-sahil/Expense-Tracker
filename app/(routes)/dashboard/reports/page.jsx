"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, sql } from "drizzle-orm";
import {
    BarChart2, TrendingUp, TrendingDown, Wallet,
    CalendarDays, CalendarRange, ChevronDown, Flame, Award, Sparkles
} from "lucide-react";
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

const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "monthly", label: "Monthly", icon: CalendarDays },
    { id: "yearly", label: "Yearly", icon: CalendarRange },
];

// Reusable Stat Card
function StatCard({ label, value, sub, icon: Icon, gradient, border, iconBg, iconColor, textColor }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border ${border} bg-gray-950 hover:scale-[1.02] transition-all duration-300 group`}>
            <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-70`} />
            <div className="relative p-5">
                <div className={`w-11 h-11 ${iconBg} border rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-xl font-bold ${textColor}`} style={{ fontFamily: "var(--font-cormorant), serif" }}>{value}</p>
                <p className="text-xs text-gray-600 mt-1">{sub}</p>
            </div>
        </div>
    );
}

// Reusable Chart Card
function ChartCard({ title, subtitle, children, gradient = "from-indigo-500/5" }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 p-6">
            <div className={`absolute inset-0 bg-linear-to-br ${gradient} to-transparent`} />
            <div className="relative">
                <h2 className="text-xl font-bold text-white mb-0.5" style={{ fontFamily: "var(--font-cormorant), serif" }}>{title}</h2>
                {subtitle && <p className="text-xs text-gray-600 mb-5">{subtitle}</p>}
                {children}
            </div>
        </div>
    );
}

// Reusable Selector
function Selector({ value, onChange, options, accentColor = "indigo" }) {
    return (
        <div className="relative">
            <select value={value} onChange={(e) => onChange(Number(e.target.value))}
                className={`appearance-none pl-4 pr-10 py-2.5 bg-gray-900 border border-gray-700/50 rounded-xl text-sm text-gray-300 font-medium focus:outline-none focus:ring-1 focus:ring-${accentColor}-500 cursor-pointer`}>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
    );
}

function ReportsPage() {
    const { user } = useUser();
    const [budgetList, setBudgetList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const monthOptions = MONTHS.map((m, i) => ({ value: i, label: m }));
    const yearOptions = years.map((y) => ({ value: y, label: String(y) }));

    useEffect(() => { user && fetchData(); }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try { await Promise.all([getBudgets(), getExpenses()]); }
        finally { setLoading(false); }
    };

    const getBudgets = async () => {
        const result = await db.select({
            id: Budgets.id, name: Budgets.name, amount: Budgets.amount,
            icon: Budgets.icon, createdBy: Budgets.createdBy,
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
        }).from(Expenses).innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
        setExpensesList(result);
    };

    // ── OVERVIEW DATA ──
    const totalBudget = budgetList.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgetList.reduce((sum, b) => sum + (b.totalSpend || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const allMonthlyTrend = MONTHS.map((month, i) => ({
        month,
        Spending: expensesList.filter((e) => parseInt(e.createdAt.split("/")[1]) - 1 === i)
            .reduce((sum, e) => sum + Number(e.amount), 0),
    }));
    const overviewPieData = budgetList
        .map((b) => ({ name: b.icon + " " + b.name, value: b.totalSpend || 0 }))
        .filter((i) => i.value > 0);
    const topExpenses = [...expensesList]
        .sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

    // ── MONTHLY DATA ──
    const monthlyExp = expensesList.filter((e) => {
        const p = e.createdAt.split("/");
        return parseInt(p[1]) - 1 === selectedMonth && parseInt(p[2]) === selectedYear;
    });
    const totalSpentMonth = monthlyExp.reduce((sum, e) => sum + Number(e.amount), 0);
    const monthBarData = budgetList.map((b) => ({
        name: b.icon + " " + b.name,
        Budget: Number(b.amount),
        Spent: monthlyExp.filter((e) => e.budgetName === b.name).reduce((sum, e) => sum + Number(e.amount), 0),
    }));
    const monthPieData = monthBarData
        .map((b) => ({ name: b.name, value: b.Spent }))
        .filter((i) => i.value > 0);

    // ── YEARLY DATA ──
    const yearlyExp = expensesList.filter((e) => parseInt(e.createdAt.split("/")[2]) === selectedYear);
    const totalSpentYear = yearlyExp.reduce((sum, e) => sum + Number(e.amount), 0);
    const yearMonthlyData = MONTHS.map((month, i) => ({
        month,
        Spending: yearlyExp.filter((e) => parseInt(e.createdAt.split("/")[1]) - 1 === i)
            .reduce((sum, e) => sum + Number(e.amount), 0),
    }));
    const peakMonth = yearMonthlyData.reduce((max, m) => m.Spending > max.Spending ? m : max, yearMonthlyData[0]);
    const activeMonths = yearMonthlyData.filter((m) => m.Spending > 0);
    const lowestMonth = activeMonths.length > 0
        ? activeMonths.reduce((min, m) => m.Spending < min.Spending ? m : min)
        : { month: "N/A", Spending: 0 };
    const yearCategoryData = budgetList.map((b) => ({
        name: b.icon + " " + b.name,
        value: yearlyExp.filter((e) => e.budgetName === b.name).reduce((sum, e) => sum + Number(e.amount), 0),
        budget: Number(b.amount),
    })).filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
    const quarterData = [
        { quarter: "Q1", months: "Jan–Mar", spending: yearMonthlyData.slice(0, 3).reduce((s, m) => s + m.Spending, 0) },
        { quarter: "Q2", months: "Apr–Jun", spending: yearMonthlyData.slice(3, 6).reduce((s, m) => s + m.Spending, 0) },
        { quarter: "Q3", months: "Jul–Sep", spending: yearMonthlyData.slice(6, 9).reduce((s, m) => s + m.Spending, 0) },
        { quarter: "Q4", months: "Oct–Dec", spending: yearMonthlyData.slice(9, 12).reduce((s, m) => s + m.Spending, 0) },
    ];
    const yearCompData = MONTHS.map((month, i) => ({
        month,
        [selectedYear]: yearlyExp.filter((e) => parseInt(e.createdAt.split("/")[1]) - 1 === i).reduce((s, e) => s + Number(e.amount), 0),
        [selectedYear - 1]: expensesList.filter((e) => parseInt(e.createdAt.split("/")[1]) - 1 === i && parseInt(e.createdAt.split("/")[2]) === selectedYear - 1).reduce((s, e) => s + Number(e.amount), 0),
    }));
    const topYearlyExp = [...yearlyExp].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-12 bg-white/5 rounded-xl animate-pulse w-48" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="rounded-2xl p-5 border border-white/5 animate-pulse h-32" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="fixed top-20 right-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 left-80 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                    <BarChart2 className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-cormorant), serif" }}>Reports</h1>
                    <p className="text-sm text-gray-500">Visual overview of your finances</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900/50 border border-white/5 rounded-xl p-1 w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ══════════════ OVERVIEW TAB ══════════════ */}
            {activeTab === "overview" && (
                <div className="space-y-5">

                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Budget" value={`₹${totalBudget.toLocaleString()}`} sub={`${budgetList.length} budgets`} icon={Wallet} gradient="from-indigo-500/20 via-indigo-600/10 to-transparent" border="border-indigo-500/25" iconBg="bg-indigo-500/15 border-indigo-500/25" iconColor="text-indigo-400" textColor="text-indigo-300" />
                        <StatCard label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} sub={`${expensesList.length} transactions`} icon={TrendingDown} gradient="from-orange-500/20 via-orange-600/10 to-transparent" border="border-orange-500/25" iconBg="bg-orange-500/15 border-orange-500/25" iconColor="text-orange-400" textColor="text-orange-300" />
                        <StatCard label="Remaining" value={`₹${Math.abs(totalRemaining).toLocaleString()}`} sub={totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% used` : "0% used"} icon={TrendingUp} gradient={totalRemaining >= 0 ? "from-emerald-500/20 via-emerald-600/10 to-transparent" : "from-red-500/20 via-red-600/10 to-transparent"} border={totalRemaining >= 0 ? "border-emerald-500/25" : "border-red-500/25"} iconBg={totalRemaining >= 0 ? "bg-emerald-500/15 border-emerald-500/25" : "bg-red-500/15 border-red-500/25"} iconColor={totalRemaining >= 0 ? "text-emerald-400" : "text-red-400"} textColor={totalRemaining >= 0 ? "text-emerald-300" : "text-red-300"} />
                        <StatCard label="Avg per Budget" value={budgetList.length > 0 ? `₹${Math.round(totalSpent / budgetList.length).toLocaleString()}` : "₹0"} sub="average spending" icon={BarChart2} gradient="from-purple-500/20 via-purple-600/10 to-transparent" border="border-purple-500/25" iconBg="bg-purple-500/15 border-purple-500/25" iconColor="text-purple-400" textColor="text-purple-300" />
                    </div>

                    {/* Spending Trend */}
                    <ChartCard title="Spending Trend" subtitle="All-time monthly spending pattern" gradient="from-indigo-500/5">
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={allMonthlyTrend}>
                                <defs>
                                    <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4b5563" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={darkTooltip} />
                                <Area type="monotone" dataKey="Spending" stroke="#6366f1" strokeWidth={2.5} fill="url(#ovGrad)" dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Pie + Top Expenses */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <ChartCard title="Spending by Category" subtitle="Distribution across all budgets" gradient="from-purple-500/5">
                            {overviewPieData.length === 0
                                ? <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No spending data</div>
                                : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie data={overviewPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                                                {overviewPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={darkTooltip} />
                                            <Legend wrapperStyle={{ color: "#6b7280", fontSize: "11px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                        </ChartCard>

                        <ChartCard title="Top 5 Expenses" subtitle="Your biggest transactions" gradient="from-orange-500/5">
                            {topExpenses.length === 0
                                ? <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No expenses yet</div>
                                : (
                                    <div className="space-y-3 mt-1">
                                        {topExpenses.map((e, i) => (
                                            <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/3 transition-colors" style={{ background: "rgba(255,255,255,0.02)" }}>
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}>{i + 1}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-200 truncate">{e.name}</p>
                                                    <p className="text-xs text-gray-600">{e.budgetIcon} {e.budgetName}</p>
                                                </div>
                                                <span className="text-sm font-bold text-indigo-400 shrink-0">₹{Number(e.amount).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </ChartCard>
                    </div>
                </div>
            )}

            {/* ══════════════ MONTHLY TAB ══════════════ */}
            {activeTab === "monthly" && (
                <div className="space-y-5">

                    {/* Selectors */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <Selector value={selectedMonth} onChange={setSelectedMonth} options={monthOptions} />
                        <Selector value={selectedYear} onChange={setSelectedYear} options={yearOptions} />
                        <span className="text-sm text-gray-500">
                            {monthlyExp.length} transactions · ₹{totalSpentMonth.toLocaleString()} spent
                        </span>
                    </div>

                    {/* Monthly Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard label="Total Budget" value={`₹${totalBudget.toLocaleString()}`} sub={`${budgetList.length} budgets`} icon={Wallet} gradient="from-indigo-500/20 via-indigo-600/10 to-transparent" border="border-indigo-500/25" iconBg="bg-indigo-500/15 border-indigo-500/25" iconColor="text-indigo-400" textColor="text-indigo-300" />
                        <StatCard label={`Spent in ${MONTHS[selectedMonth]}`} value={`₹${totalSpentMonth.toLocaleString()}`} sub={`${monthlyExp.length} transactions`} icon={TrendingDown} gradient="from-orange-500/20 via-orange-600/10 to-transparent" border="border-orange-500/25" iconBg="bg-orange-500/15 border-orange-500/25" iconColor="text-orange-400" textColor="text-orange-300" />
                        <StatCard label="Remaining" value={`₹${Math.abs(totalBudget - totalSpentMonth).toLocaleString()}`} sub={`${totalBudget > 0 ? ((totalSpentMonth / totalBudget) * 100).toFixed(1) : 0}% used`} icon={TrendingUp} gradient={(totalBudget - totalSpentMonth) >= 0 ? "from-emerald-500/20 via-emerald-600/10 to-transparent" : "from-red-500/20 via-red-600/10 to-transparent"} border={(totalBudget - totalSpentMonth) >= 0 ? "border-emerald-500/25" : "border-red-500/25"} iconBg={(totalBudget - totalSpentMonth) >= 0 ? "bg-emerald-500/15 border-emerald-500/25" : "bg-red-500/15 border-red-500/25"} iconColor={(totalBudget - totalSpentMonth) >= 0 ? "text-emerald-400" : "text-red-400"} textColor={(totalBudget - totalSpentMonth) >= 0 ? "text-emerald-300" : "text-red-300"} />
                    </div>

                    {/* Monthly Bar Chart */}
                    <ChartCard title={`Budget vs Spent — ${MONTHS[selectedMonth]} ${selectedYear}`} subtitle="Per category comparison" gradient="from-indigo-500/5">
                        {monthBarData.length === 0
                            ? <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No data for this month</div>
                            : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={monthBarData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4b5563" }} angle={-30} textAnchor="end" interval={0} />
                                        <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                                        <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={darkTooltip} />
                                        <Legend wrapperStyle={{ paddingTop: "20px", color: "#6b7280" }} />
                                        <Bar dataKey="Budget" fill="rgba(99,102,241,0.15)" radius={[6, 6, 0, 0]} stroke="rgba(99,102,241,0.3)" strokeWidth={1} />
                                        <Bar dataKey="Spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                    </ChartCard>

                    {/* Monthly Pie + Transactions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <ChartCard title="Spending Breakdown" subtitle={`${MONTHS[selectedMonth]} ${selectedYear}`} gradient="from-purple-500/5">
                            {monthPieData.length === 0
                                ? <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No spending data this month</div>
                                : (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie data={monthPieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value">
                                                {monthPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={darkTooltip} />
                                            <Legend wrapperStyle={{ color: "#6b7280", fontSize: "11px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                        </ChartCard>

                        <ChartCard title="Transactions" subtitle={`${monthlyExp.length} entries in ${MONTHS[selectedMonth]}`} gradient="from-emerald-500/5">
                            {monthlyExp.length === 0
                                ? <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No transactions this month</div>
                                : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mt-1">
                                        {monthlyExp.map((e) => (
                                            <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:bg-white/3 transition-colors" style={{ background: "rgba(255,255,255,0.02)" }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/15 rounded-xl flex items-center justify-center text-base">{e.budgetIcon}</div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-200">{e.name}</p>
                                                        <p className="text-xs text-gray-600">{e.budgetName} · {e.createdAt}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-indigo-400">₹{Number(e.amount).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </ChartCard>
                    </div>
                </div>
            )}

            {/* ══════════════ YEARLY TAB ══════════════ */}
            {activeTab === "yearly" && (
                <div className="space-y-5">

                    {/* Year Selector */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <Selector value={selectedYear} onChange={setSelectedYear} options={yearOptions} accentColor="purple" />
                        <span className="text-sm text-gray-500">
                            {yearlyExp.length} transactions · ₹{totalSpentYear.toLocaleString()} spent
                        </span>
                    </div>

                    {/* Yearly Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Budget" value={`₹${totalBudget.toLocaleString()}`} sub={`${budgetList.length} budgets`} icon={Wallet} gradient="from-indigo-500/20 via-indigo-600/10 to-transparent" border="border-indigo-500/25" iconBg="bg-indigo-500/15 border-indigo-500/25" iconColor="text-indigo-400" textColor="text-indigo-300" />
                        <StatCard label={`Spent in ${selectedYear}`} value={`₹${totalSpentYear.toLocaleString()}`} sub={`${yearlyExp.length} transactions`} icon={TrendingDown} gradient="from-orange-500/20 via-orange-600/10 to-transparent" border="border-orange-500/25" iconBg="bg-orange-500/15 border-orange-500/25" iconColor="text-orange-400" textColor="text-orange-300" />
                        <StatCard label="Avg Monthly" value={`₹${Math.round(totalSpentYear / 12).toLocaleString()}`} sub="per month average" icon={BarChart2} gradient="from-purple-500/20 via-purple-600/10 to-transparent" border="border-purple-500/25" iconBg="bg-purple-500/15 border-purple-500/25" iconColor="text-purple-400" textColor="text-purple-300" />
                        <StatCard label="Remaining" value={`₹${Math.abs(totalBudget - totalSpentYear).toLocaleString()}`} sub={(totalBudget - totalSpentYear) >= 0 ? "available" : "over budget"} icon={TrendingUp} gradient={(totalBudget - totalSpentYear) >= 0 ? "from-emerald-500/20 via-emerald-600/10 to-transparent" : "from-red-500/20 via-red-600/10 to-transparent"} border={(totalBudget - totalSpentYear) >= 0 ? "border-emerald-500/25" : "border-red-500/25"} iconBg={(totalBudget - totalSpentYear) >= 0 ? "bg-emerald-500/15 border-emerald-500/25" : "bg-red-500/15 border-red-500/25"} iconColor={(totalBudget - totalSpentYear) >= 0 ? "text-emerald-400" : "text-red-400"} textColor={(totalBudget - totalSpentYear) >= 0 ? "text-emerald-300" : "text-red-300"} />
                    </div>

                    {/* Highlight Cards */}
                    {yearlyExp.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { icon: Flame, label: "Peak Month", value: peakMonth.month, sub: `₹${peakMonth.Spending.toLocaleString()} spent`, border: "border-orange-500/20", bg: "from-orange-500/10", iconBg: "bg-orange-500/15 border-orange-500/25", iconColor: "text-orange-400", textColor: "text-orange-300" },
                                { icon: Award, label: "Most Frugal", value: lowestMonth.month, sub: lowestMonth.month === "N/A" ? "No data" : `₹${lowestMonth.Spending.toLocaleString()} spent`, border: "border-emerald-500/20", bg: "from-emerald-500/10", iconBg: "bg-emerald-500/15 border-emerald-500/25", iconColor: "text-emerald-400", textColor: "text-emerald-300" },
                                { icon: Sparkles, label: "Top Category", value: yearCategoryData[0]?.name.split(" ").slice(1).join(" ") || "N/A", sub: yearCategoryData[0] ? `₹${yearCategoryData[0].value.toLocaleString()} spent` : "No data", border: "border-indigo-500/20", bg: "from-indigo-500/10", iconBg: "bg-indigo-500/15 border-indigo-500/25", iconColor: "text-indigo-400", textColor: "text-indigo-300" },
                            ].map(({ icon: Icon, label, value, sub, border, bg, iconBg, iconColor, textColor }) => (
                                <div key={label} className={`relative overflow-hidden rounded-2xl border ${border} bg-gray-950 p-5`}>
                                    <div className={`absolute inset-0 bg-linear-to-br ${bg} to-transparent`} />
                                    <div className="relative flex items-center gap-4">
                                        <div className={`w-12 h-12 ${iconBg} border rounded-xl flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-6 h-6 ${iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                                            <p className={`text-lg font-bold ${textColor} truncate`} style={{ fontFamily: "var(--font-cormorant), serif" }}>{value}</p>
                                            <p className="text-xs text-gray-600">{sub}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Yearly Area Chart */}
                    <ChartCard title={`Monthly Spending — ${selectedYear}`} subtitle="Your spending pattern across all 12 months" gradient="from-purple-500/5">
                        {yearlyExp.length === 0
                            ? <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No data for {selectedYear}</div>
                            : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={yearMonthlyData}>
                                        <defs>
                                            <linearGradient id="yGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4b5563" }} />
                                        <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                                        <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={darkTooltip} />
                                        <Area type="monotone" dataKey="Spending" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#yGrad)" dot={{ fill: "#8b5cf6", r: 4 }} activeDot={{ r: 6, fill: "#a78bfa" }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                    </ChartCard>

                    {/* Year Comparison */}
                    <ChartCard title="Year over Year" subtitle={`${selectedYear} vs ${selectedYear - 1} spending comparison`} gradient="from-indigo-500/5">
                        <ResponsiveContainer width="100%" height={230}>
                            <LineChart data={yearCompData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4b5563" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={darkTooltip} />
                                <Legend wrapperStyle={{ color: "#6b7280", fontSize: "12px" }} />
                                <Line type="monotone" dataKey={String(selectedYear)} stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey={String(selectedYear - 1)} stroke="#4b5563" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#4b5563", r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Quarterly + Category */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {/* Quarterly */}
                        <ChartCard title="Quarterly Breakdown" subtitle={`Spending split across 4 quarters of ${selectedYear}`} gradient="from-emerald-500/5">
                            {yearlyExp.length === 0
                                ? <div className="flex items-center justify-center h-32 text-gray-600 text-sm">No data for {selectedYear}</div>
                                : (
                                    <div className="space-y-4 mt-1">
                                        {quarterData.map((q, i) => {
                                            const pct = totalSpentYear > 0 ? (q.spending / totalSpentYear) * 100 : 0;
                                            const qColors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];
                                            return (
                                                <div key={q.quarter}>
                                                    <div className="flex justify-between mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-300">{q.quarter}</span>
                                                            <span className="text-xs text-gray-600">{q.months}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-gray-200">₹{q.spending.toLocaleString()}</span>
                                                            <span className="text-xs text-gray-600 ml-1.5">({pct.toFixed(1)}%)</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                                                        <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: qColors[i] }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                        </ChartCard>

                        {/* Category Pie */}
                        <ChartCard title="Category Breakdown" subtitle={`Spending by category in ${selectedYear}`} gradient="from-pink-500/5">
                            {yearCategoryData.length === 0
                                ? <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No spending data for {selectedYear}</div>
                                : (
                                    <ResponsiveContainer width="100%" height={230}>
                                        <PieChart>
                                            <Pie data={yearCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                                                {yearCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={darkTooltip} />
                                            <Legend wrapperStyle={{ color: "#6b7280", fontSize: "11px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                        </ChartCard>
                    </div>

                    {/* Top Yearly Expenses */}
                    <ChartCard title={`Top Expenses of ${selectedYear}`} subtitle="Your biggest spending transactions this year" gradient="from-orange-500/5">
                        {topYearlyExp.length === 0
                            ? <div className="flex items-center justify-center h-32 text-gray-600 text-sm">No expenses for {selectedYear}</div>
                            : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
                                    {topYearlyExp.map((e, i) => (
                                        <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/3 transition-colors" style={{ background: "rgba(255,255,255,0.02)" }}>
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}>{i + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-200 truncate">{e.name}</p>
                                                <p className="text-xs text-gray-600">{e.budgetIcon} {e.budgetName}</p>
                                            </div>
                                            <span className="text-sm font-bold text-indigo-400 shrink-0">₹{Number(e.amount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </ChartCard>
                </div>
            )}
        </div>
    );
}

export default ReportsPage;
