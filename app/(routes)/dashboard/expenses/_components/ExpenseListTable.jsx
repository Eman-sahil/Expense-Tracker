"use client";
import React from "react";
import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import { Trash2, Calendar } from "lucide-react";

function ExpenseListTable({ expensesList, refreshData }) {
    const deleteExpense = async (expense) => {
        try {
            await db.delete(Expenses).where(eq(Expenses.id, expense.id));
            toast.success("Expense deleted!");
            refreshData();
        } catch (err) {
            toast.error("Failed to delete expense");
        }
    };

    if (!expensesList || expensesList.length === 0) {
        return (
            <div className="rounded-2xl p-8 border border-white/5 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-gray-600 text-sm">No expenses recorded yet. Add your first one!</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-white/5 px-5 py-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider col-span-2">Name</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
                {expensesList.map((expense) => (
                    <div key={expense.id} className="grid grid-cols-4 px-5 py-4 items-center hover:bg-white/3 transition-colors group">
                        <div className="col-span-2 flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-400 font-bold text-xs">
                                    {expense.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="font-medium text-gray-200 text-sm">{expense.name}</span>
                        </div>
                        <span className="font-semibold text-indigo-400 text-sm">
                            ₹{Number(expense.amount).toLocaleString()}
                        </span>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {expense.createdAt}
                            </span>
                            <button
                                onClick={() => deleteExpense(expense)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExpenseListTable;
