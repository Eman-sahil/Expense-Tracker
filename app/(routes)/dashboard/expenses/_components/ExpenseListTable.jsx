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
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <p className="text-gray-400 text-sm">No expenses recorded yet. Add your first one!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100 px-5 py-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider col-span-2">Name</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-50">
                {expensesList.map((expense) => (
                    <div key={expense.id} className="grid grid-cols-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors group">

                        {/* Name */}
                        <div className="col-span-2 flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-xs">
                                    {expense.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="font-medium text-gray-800 text-sm">{expense.name}</span>
                        </div>

                        {/* Amount */}
                        <span className="font-semibold text-gray-900 text-sm">
                            ₹{Number(expense.amount).toLocaleString()}
                        </span>

                        {/* Date + Delete */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {expense.createdAt}
                            </span>
                            <button
                                onClick={() => deleteExpense(expense)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
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