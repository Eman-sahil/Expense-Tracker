import Link from "next/link";
import React from "react";

function BudgetItem({ budget }) {
    const spent = budget.totalSpend || 0;
    const total = Number(budget.amount);
    const remaining = total - spent;
    const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;

    const getBarColor = () => {
        if (percentage >= 90) return "from-red-500 to-red-400";
        if (percentage >= 70) return "from-orange-500 to-orange-400";
        return "from-indigo-500 to-purple-500";
    };

    const getStatusColor = () => {
        if (percentage >= 90) return "text-red-400";
        if (percentage >= 70) return "text-orange-400";
        return "text-green-400";
    };

    return (
        <Link href={`/dashboard/expenses?budgetId=${budget.id}`}>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-900/10 transition-all duration-300 cursor-pointer group p-5">

                {/* Subtle gradient bg */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300"
                                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)" }}>
                                {budget.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-200 text-sm group-hover:text-white transition-colors">{budget.name}</h3>
                                <p className="text-xs text-gray-600">{budget.totalItem || 0} {budget.totalItem === 1 ? 'item' : 'items'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-indigo-300 text-base" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                                ₹{Number(budget.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">budget</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">
                                ₹{Number(spent).toLocaleString()} spent
                            </span>
                            <span className={`font-semibold ${getStatusColor()}`}>
                                {remaining < 0 ? `₹${Math.abs(remaining).toLocaleString()} over` : `₹${remaining.toLocaleString()} left`}
                            </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`bg-linear-to-r ${getBarColor()} h-1.5 rounded-full transition-all duration-700`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-1 h-1 rounded-full transition-all ${i < Math.ceil(percentage / 20) ? (percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-orange-500' : 'bg-indigo-500') : 'bg-white/10'}`} />
                                ))}
                            </div>
                            <p className="text-xs text-gray-600">{percentage.toFixed(0)}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default BudgetItem;
