import Link from "next/link";
import React from "react";
import { TrendingDown } from "lucide-react";

function BudgetItem({ budget }) {
    const spent = budget.totalSpend || 0;
    const total = Number(budget.amount);
    const remaining = total - spent;
    const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;

    const getBarColor = () => {
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 70) return "bg-orange-400";
        return "bg-indigo-500";
    };

    return (
        <Link href={`/dashboard/expenses?budgetId=${budget.id}`}>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200 cursor-pointer group">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {budget.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">{budget.name}</h3>
                            <p className="text-xs text-gray-400">{budget.totalItem || 0} items</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-indigo-600 text-lg">₹{Number(budget.amount).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Budget</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-red-400" />
                            ₹{Number(spent).toLocaleString()} spent
                        </span>
                        <span className={`font-medium ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            ₹{Math.abs(remaining).toLocaleString()} {remaining < 0 ? 'over' : 'left'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className={`${getBarColor()} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 text-right">{percentage.toFixed(0)}% used</p>
                </div>

            </div>
        </Link>
    );
}

export default BudgetItem;