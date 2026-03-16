"use client";
import React, { useEffect, useState } from "react";
import { Lightbulb, TrendingDown, PiggyBank, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

function SavingsTips({ budgetList = [], expensesList = [] }) {
    const [tips, setTips] = useState([]);

    useEffect(() => {
        if (budgetList.length > 0) {
            generateTips();
        }
    }, [budgetList, expensesList]);

    const generateTips = () => {
        const generatedTips = [];

        const totalBudget = budgetList.reduce((sum, b) => sum + Number(b.amount), 0);
        const totalSpent = budgetList.reduce((sum, b) => sum + (b.totalSpend || 0), 0);
        const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        // Tip 1 — Overall spending health
        if (spentPercentage >= 90) {
            generatedTips.push({
                icon: AlertTriangle,
                color: "red",
                title: "You're almost out of budget!",
                desc: `You've used ${spentPercentage.toFixed(1)}% of your total budget. Consider cutting down on non-essential expenses immediately.`,
            });
        } else if (spentPercentage >= 70) {
            generatedTips.push({
                icon: TrendingDown,
                color: "orange",
                title: "Spending is getting high",
                desc: `You've used ${spentPercentage.toFixed(1)}% of your total budget. Try to slow down spending for the rest of the month.`,
            });
        } else {
            generatedTips.push({
                icon: CheckCircle,
                color: "green",
                title: "Great spending control!",
                desc: `You've only used ${spentPercentage.toFixed(1)}% of your total budget. Keep it up and save the rest!`,
            });
        }

        // Tip 2 — Over budget categories
        const overBudgetItems = budgetList.filter(
            (b) => (b.totalSpend || 0) > Number(b.amount)
        );
        if (overBudgetItems.length > 0) {
            generatedTips.push({
                icon: AlertTriangle,
                color: "red",
                title: `${overBudgetItems.length} budget(s) exceeded!`,
                desc: `${overBudgetItems.map((b) => `${b.icon} ${b.name}`).join(", ")} went over budget. Consider increasing the budget or reducing spending there.`,
            });
        }

        // Tip 3 — Highest spending category
        const highestSpend = [...budgetList].sort(
            (a, b) => (b.totalSpend || 0) - (a.totalSpend || 0)
        )[0];
        if (highestSpend && highestSpend.totalSpend > 0) {
            generatedTips.push({
                icon: TrendingDown,
                color: "orange",
                title: `Biggest spend: ${highestSpend.icon} ${highestSpend.name}`,
                desc: `You spent ₹${Number(highestSpend.totalSpend).toLocaleString()} on ${highestSpend.name}. This is your highest spending category — see if you can reduce it next month.`,
            });
        }

        // Tip 4 — Unused budgets
        const unusedBudgets = budgetList.filter(
            (b) => !b.totalSpend || b.totalSpend === 0
        );
        if (unusedBudgets.length > 0) {
            generatedTips.push({
                icon: PiggyBank,
                color: "green",
                title: `₹${unusedBudgets.reduce((sum, b) => sum + Number(b.amount), 0).toLocaleString()} untouched!`,
                desc: `${unusedBudgets.map((b) => `${b.icon} ${b.name}`).join(", ")} ${unusedBudgets.length === 1 ? "has" : "have"} no expenses yet. Consider moving unused funds to savings.`,
            });
        }

        // Tip 5 — Savings potential
        const remaining = totalBudget - totalSpent;
        if (remaining > 0) {
            generatedTips.push({
                icon: PiggyBank,
                color: "indigo",
                title: `Save ₹${Math.round(remaining * 0.5).toLocaleString()} this month!`,
                desc: `You have ₹${remaining.toLocaleString()} remaining. Try saving at least 50% of what's left — that's ₹${Math.round(remaining * 0.5).toLocaleString()} you could put aside.`,
            });
        }

        // Tip 6 — Number of transactions
        if (expensesList.length > 20) {
            generatedTips.push({
                icon: Lightbulb,
                color: "purple",
                title: "Too many small transactions",
                desc: `You have ${expensesList.length} expense entries. Try bundling small purchases to reduce impulse spending and track better.`,
            });
        }

        // Tip 7 — Budget diversity
        if (budgetList.length < 3) {
            generatedTips.push({
                icon: Lightbulb,
                color: "indigo",
                title: "Add more budget categories",
                desc: "Having more specific budget categories helps you track spending better. Try adding categories like Food, Transport, Entertainment, and Savings.",
            });
        }

        // Tip 8 — Low remaining budget warning
        const nearlyEmptyBudgets = budgetList.filter((b) => {
            const remaining = Number(b.amount) - (b.totalSpend || 0);
            const percentage = (remaining / Number(b.amount)) * 100;
            return percentage <= 20 && percentage > 0;
        });
        if (nearlyEmptyBudgets.length > 0) {
            generatedTips.push({
                icon: AlertTriangle,
                color: "orange",
                title: "Some budgets are almost empty",
                desc: `${nearlyEmptyBudgets.map((b) => `${b.icon} ${b.name}`).join(", ")} ${nearlyEmptyBudgets.length === 1 ? "has" : "have"} less than 20% remaining. Plan your spending carefully.`,
            });
        }

        setTips(generatedTips);
    };

    const colorMap = {
        red: {
            bg: "bg-red-50",
            border: "border-red-100",
            icon: "text-red-500",
            iconBg: "bg-red-100",
            badge: "bg-red-100 text-red-600",
        },
        orange: {
            bg: "bg-orange-50",
            border: "border-orange-100",
            icon: "text-orange-500",
            iconBg: "bg-orange-100",
            badge: "bg-orange-100 text-orange-600",
        },
        green: {
            bg: "bg-green-50",
            border: "border-green-100",
            icon: "text-green-500",
            iconBg: "bg-green-100",
            badge: "bg-green-100 text-green-600",
        },
        indigo: {
            bg: "bg-indigo-50",
            border: "border-indigo-100",
            icon: "text-indigo-500",
            iconBg: "bg-indigo-100",
            badge: "bg-indigo-100 text-indigo-600",
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-100",
            icon: "text-purple-500",
            iconBg: "bg-purple-100",
            badge: "bg-purple-100 text-purple-600",
        },
    };

    if (tips.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Smart Savings Tips</h2>
                <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-full">
                    {tips.length} insights
                </span>
            </div>

            {/* Tips Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tips.map((tip, index) => {
                    const c = colorMap[tip.color];
                    return (
                        <div key={index}
                            className={`${c.bg} ${c.border} border rounded-xl p-4 flex gap-3`}>
                            <div className={`${c.iconBg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                                <tip.icon className={`w-4 h-4 ${c.icon}`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 mb-1">{tip.title}</p>
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