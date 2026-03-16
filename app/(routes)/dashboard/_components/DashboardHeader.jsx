"use client"
import { UserButton, useUser } from '@clerk/nextjs'
import { Search, Bell, X, AlertTriangle, TrendingDown, PiggyBank, ReceiptText } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { db } from '@/utils/dbConfig'
import { Budgets, Expenses } from '@/utils/schema'
import { eq, getTableColumns, sql, ilike, or } from 'drizzle-orm'
import { useRouter } from 'next/navigation'

function DashboardHeader() {
    const { user } = useUser();
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ budgets: [], expenses: [] });
    const [showSearch, setShowSearch] = useState(false);
    const [searching, setSearching] = useState(false);
    const notifRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        user && fetchBudgetAlerts();
    }, [user]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search with debounce
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults({ budgets: [], expenses: [] });
            setShowSearch(false);
            return;
        }
        const timer = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        if (!searchQuery.trim() || !user) return;
        setSearching(true);
        try {
            // Search budgets
            const budgetResults = await db
                .select()
                .from(Budgets)
                .where(
                    eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)
                )
                .limit(3);

            const filteredBudgets = budgetResults.filter(b =>
                b.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Search expenses
            const expenseResults = await db
                .select({
                    id: Expenses.id,
                    name: Expenses.name,
                    amount: Expenses.amount,
                    createdAt: Expenses.createdAt,
                    budgetId: Expenses.budgetId,
                    budgetName: Budgets.name,
                    budgetIcon: Budgets.icon,
                })
                .from(Expenses)
                .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
                .where(
                    eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)
                )
                .limit(20);

            const filteredExpenses = expenseResults.filter(e =>
                e.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 4);

            setSearchResults({
                budgets: filteredBudgets,
                expenses: filteredExpenses,
            });
            setShowSearch(true);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const fetchBudgetAlerts = async () => {
        try {
            const result = await db
                .select({
                    ...getTableColumns(Budgets),
                    totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                })
                .from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
                .groupBy(Budgets.id);

            const alerts = [];
            result.forEach((budget) => {
                const total = Number(budget.amount);
                const spent = budget.totalSpend || 0;
                const percentage = total > 0 ? (spent / total) * 100 : 0;
                const remaining = total - spent;

                if (spent > total) {
                    alerts.push({
                        type: "overspent",
                        icon: TrendingDown,
                        color: "red",
                        title: `${budget.icon} ${budget.name} is over budget!`,
                        desc: `You've overspent by ₹${(spent - total).toLocaleString()}`,
                    });
                } else if (percentage >= 90) {
                    alerts.push({
                        type: "critical",
                        icon: AlertTriangle,
                        color: "red",
                        title: `${budget.icon} ${budget.name} is almost full!`,
                        desc: `${percentage.toFixed(0)}% used — only ₹${remaining.toLocaleString()} left`,
                    });
                } else if (percentage >= 75) {
                    alerts.push({
                        type: "warning",
                        icon: AlertTriangle,
                        color: "orange",
                        title: `${budget.icon} ${budget.name} is running low`,
                        desc: `${percentage.toFixed(0)}% used — ₹${remaining.toLocaleString()} remaining`,
                    });
                }
            });
            setNotifications(alerts);
        } catch (err) {
            console.error(err);
        }
    };

    const colorMap = {
        red: { bg: "bg-red-50", border: "border-red-100", icon: "text-red-500", iconBg: "bg-red-100" },
        orange: { bg: "bg-orange-50", border: "border-orange-100", icon: "text-orange-500", iconBg: "bg-orange-100" },
    };

    const hasResults = searchResults.budgets.length > 0 || searchResults.expenses.length > 0;

    return (
        <div className='sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm'>

            {/* Search Bar */}
            <div className='relative flex-1 max-w-md' ref={searchRef}>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                    type='text'
                    placeholder='Search budgets, expenses...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearch(true)}
                    className='w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                />
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setShowSearch(false);
                        }}
                        className='absolute right-3 top-1/2 -translate-y-1/2'
                    >
                        <X className='w-4 h-4 text-gray-400 hover:text-gray-600' />
                    </button>
                )}

                {/* Search Dropdown */}
                {showSearch && (
                    <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden'>

                        {searching ? (
                            <div className='px-4 py-6 text-center text-sm text-gray-400'>
                                Searching...
                            </div>
                        ) : !hasResults ? (
                            <div className='px-4 py-6 text-center'>
                                <p className='text-sm text-gray-500 font-medium'>No results found</p>
                                <p className='text-xs text-gray-400 mt-1'>Try a different search term</p>
                            </div>
                        ) : (
                            <div>
                                {/* Budget Results */}
                                {searchResults.budgets.length > 0 && (
                                    <div>
                                        <div className='px-4 py-2 bg-gray-50 border-b border-gray-100'>
                                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Budgets</p>
                                        </div>
                                        {searchResults.budgets.map((budget) => (
                                            <div
                                                key={budget.id}
                                                onClick={() => {
                                                    router.push(`/dashboard/budgets`);
                                                    setShowSearch(false);
                                                    setSearchQuery('');
                                                }}
                                                className='flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors'
                                            >
                                                <div className='w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shrink-0'>
                                                    {budget.icon}
                                                </div>
                                                <div className='flex-1'>
                                                    <p className='text-sm font-medium text-gray-800'>{budget.name}</p>
                                                    <p className='text-xs text-gray-400'>Budget · ₹{Number(budget.amount).toLocaleString()}</p>
                                                </div>
                                                <PiggyBank className='w-4 h-4 text-indigo-400' />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Expense Results */}
                                {searchResults.expenses.length > 0 && (
                                    <div>
                                        <div className='px-4 py-2 bg-gray-50 border-b border-gray-100'>
                                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Expenses</p>
                                        </div>
                                        {searchResults.expenses.map((expense) => (
                                            <div
                                                key={expense.id}
                                                onClick={() => {
                                                    router.push(`/dashboard/expenses?budgetId=${expense.budgetId}`);
                                                    setShowSearch(false);
                                                    setSearchQuery('');
                                                }}
                                                className='flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors'
                                            >
                                                <div className='w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shrink-0'>
                                                    {expense.budgetIcon}
                                                </div>
                                                <div className='flex-1'>
                                                    <p className='text-sm font-medium text-gray-800'>{expense.name}</p>
                                                    <p className='text-xs text-gray-400'>{expense.budgetName} · ₹{Number(expense.amount).toLocaleString()}</p>
                                                </div>
                                                <ReceiptText className='w-4 h-4 text-gray-400' />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className='px-4 py-2.5 bg-gray-50 border-t border-gray-100'>
                                    <p className='text-xs text-gray-400 text-center'>
                                        {searchResults.budgets.length + searchResults.expenses.length} results found
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Section */}
            <div className='flex items-center gap-4 ml-4'>

                {/* Notification Bell */}
                <div className='relative' ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className='relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors'
                    >
                        <Bell className='w-5 h-5 text-gray-500' />
                        {notifications.length > 0 && (
                            <span className='absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className='absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden'>
                            <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
                                <h3 className='font-semibold text-gray-900 text-sm'>Notifications</h3>
                                <div className='flex items-center gap-2'>
                                    {notifications.length > 0 && (
                                        <span className='text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full'>
                                            {notifications.length} alerts
                                        </span>
                                    )}
                                    <button onClick={() => setShowNotifications(false)} className='p-1 rounded-lg hover:bg-gray-100'>
                                        <X className='w-4 h-4 text-gray-400' />
                                    </button>
                                </div>
                            </div>
                            <div className='max-h-80 overflow-y-auto'>
                                {notifications.length === 0 ? (
                                    <div className='px-4 py-8 text-center'>
                                        <div className='w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3'>
                                            <Bell className='w-6 h-6 text-green-400' />
                                        </div>
                                        <p className='text-sm font-medium text-gray-700'>All good!</p>
                                        <p className='text-xs text-gray-400 mt-1'>No budget alerts right now</p>
                                    </div>
                                ) : (
                                    <div className='divide-y divide-gray-50'>
                                        {notifications.map((notif, index) => {
                                            const c = colorMap[notif.color];
                                            return (
                                                <div key={index} className={`flex gap-3 px-4 py-3 ${c.bg}`}>
                                                    <div className={`w-8 h-8 ${c.iconBg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                                                        <notif.icon className={`w-4 h-4 ${c.icon}`} />
                                                    </div>
                                                    <div>
                                                        <p className='text-sm font-semibold text-gray-800'>{notif.title}</p>
                                                        <p className='text-xs text-gray-500 mt-0.5'>{notif.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className='px-4 py-3 border-t border-gray-100 bg-gray-50'>
                                <p className='text-xs text-gray-400 text-center'>Alerts update based on your budget usage</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className='flex items-center gap-3'>
                    <div className='text-right hidden sm:block'>
                        <p className='text-sm font-semibold text-gray-800'>{user?.fullName}</p>
                        <p className='text-xs text-gray-400'>{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <UserButton fallbackRedirectUrl='/' />
                </div>

            </div>
        </div>
    )
}

export default DashboardHeader