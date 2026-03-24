"use client";
import React, { useEffect, useState } from "react";
import { Lightbulb, TrendingDown, PiggyBank, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

function SavingsTips({ budgetList = [], expensesList = [] }) {
    const [tips, setTips] = useState([]);

    useEffect(() => {
        if (budgetList.length > 0) generateTips();
    }, [budgetList, expensesList]);

    const generateTips = () => {
        const generatedTips = [];
        const totalBudget = budgetList.reduce((sum, b) => sum + Number(b.amount), 0);
        const totalSpent = budgetList.reduce((sum, b) => sum + (b.totalSpend || 0), 0);
        const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        if (spentPercentage >= 90) {
            generatedTips.push({ icon: AlertTriangle, color: "red", title: "You're almost out of budget!", desc: `You've used ${spentPercentage.toFixed(1)}% of your total budget. Consider cutting down on non-essential expenses immediately.` });
        } else if (spentPercentage >= 70) {
            generatedTips.push({ icon: TrendingDown, color: "orange", title: "Spending is getting high", desc: `You've used ${spentPercentage.toFixed(1)}% of your total budget. Try to slow down spending for the rest of the month.` });
        } else {
            generatedTips.push({ icon: CheckCircle, color: "green", title: "Great spending control!", desc: `You've only used ${spentPercentage.toFixed(1)}% of your total budget. Keep it up and save the rest!` });
        }

        const overBudgetItems = budgetList.filter((b) => (b.totalSpend || 0) > Number(b.amount));
        if (overBudgetItems.length > 0) {
            generatedTips.push({ icon: AlertTriangle, color: "red", title: `${overBudgetItems.length} budget(s) exceeded!`, desc: `${overBudgetItems.map((b) => `${b.icon} ${b.name}`).join(", ")} went over budget.` });
        }

        const highestSpend = [...budgetList].sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0))[0];
        if (highestSpend && highestSpend.totalSpend > 0) {
            generatedTips.push({ icon: TrendingDown, color: "orange", title: `Biggest spend: ${highestSpend.icon} ${highestSpend.name}`, desc: `You spent ₹${Number(highestSpend.totalSpend).toLocaleString()} on ${highestSpend.name}. See if you can reduce it next month.` });
        }

        const unusedBudgets = budgetList.filter((b) => !b.totalSpend || b.totalSpend === 0);
        if (unusedBudgets.length > 0) {
            generatedTips.push({ icon: PiggyBank, color: "green", title: `₹${unusedBudgets.reduce((sum, b) => sum + Number(b.amount), 0).toLocaleString()} untouched!`, desc: `${unusedBudgets.map((b) => `${b.icon} ${b.name}`).join(", ")} ${unusedBudgets.length === 1 ? "has" : "have"} no expenses yet.` });
        }

        const remaining = totalBudget - totalSpent;
        if (remaining > 0) {
            generatedTips.push({ icon: PiggyBank, color: "indigo", title: `Save ₹${Math.round(remaining * 0.5).toLocaleString()} this month!`, desc: `You have ₹${remaining.toLocaleString()} remaining. Try saving at least 50% of what's left.` });
        }

        if (budgetList.length < 3) {
            generatedTips.push({ icon: Lightbulb, color: "indigo", title: "Add more budget categories", desc: "More specific categories help track spending better. Try Food, Transport, Entertainment, and Savings." });
        }

        const nearlyEmptyBudgets = budgetList.filter((b) => {
            const rem = Number(b.amount) - (b.totalSpend || 0);
            const pct = (rem / Number(b.amount)) * 100;
            return pct <= 20 && pct > 0;
        });
        if (nearlyEmptyBudgets.length > 0) {
            generatedTips.push({ icon: AlertTriangle, color: "orange", title: "Some budgets are almost empty", desc: `${nearlyEmptyBudgets.map((b) => `${b.icon} ${b.name}`).join(", ")} ${nearlyEmptyBudgets.length === 1 ? "has" : "have"} less than 20% remaining.` });
        }

        setTips(generatedTips);
    };

    const colorMap = {
        red: { bg: "bg-red-500/5", border: "border-red-500/15", icon: "text-red-400", iconBg: "bg-red-500/10" },
        orange: { bg: "bg-orange-500/5", border: "border-orange-500/15", icon: "text-orange-400", iconBg: "bg-orange-500/10" },
        green: { bg: "bg-green-500/5", border: "border-green-500/15", icon: "text-green-400", iconBg: "bg-green-500/10" },
        indigo: { bg: "bg-indigo-500/5", border: "border-indigo-500/15", icon: "text-indigo-400", iconBg: "bg-indigo-500/10" },
        purple: { bg: "bg-purple-500/5", border: "border-purple-500/15", icon: "text-purple-400", iconBg: "bg-purple-500/10" },
    };

    if (tips.length === 0) return null;

    return (
        <div className="rounded-2xl border border-white/5 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-cormorant), serif" }}>Smart Savings Tips</h2>
                <span className="ml-auto text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold px-2.5 py-1 rounded-full">
                    {tips.length} insights
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tips.map((tip, index) => {
                    const c = colorMap[tip.color];
                    return (
                        <div key={index} className={`${c.bg} ${c.border} border rounded-xl p-4 flex gap-3`}>
                            <div className={`${c.iconBg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                                <tip.icon className={`w-4 h-4 ${c.icon}`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-200 mb-1">{tip.title}</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SavingsTips;
