"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql, desc } from "drizzle-orm";
import BudgetItem from "../budgets/_components/BudgetItem";
import AddExpense from "./_components/AddExpense";
import ExpenseListTable from "./_components/ExpenseListTable";
import { ReceiptText, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function ExpensesContent() {
    const searchParams = useSearchParams();
    const budgetId = searchParams.get("budgetId");
    const router = useRouter();
    const { user } = useUser();
    const [budgetInfo, setBudgetInfo] = useState(null);
    const [expensesList, setExpensesList] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        if (budgetId) {
            getBudgetInfo();
        } else {
            getAllExpenses();
        }
    }, [user, budgetId]);

    const getBudgetInfo = async () => {
        setLoading(true);
        try {
            const result = await db.select({
                ...getTableColumns(Budgets),
                totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                totalItem: sql`COALESCE(count(${Expenses.id}), 0)`.mapWith(Number),
            }).from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.id, parseInt(budgetId)))
                .groupBy(Budgets.id);
            setBudgetInfo(result[0]);
            await getExpensesList();
        } finally {
            setLoading(false);
        }
    };

    const getExpensesList = async () => {
        const result = await db.select().from(Expenses)
            .where(eq(Expenses.budgetId, parseInt(budgetId)))
            .orderBy(desc(Expenses.id));
        setExpensesList(result);
    };

    const getAllExpenses = async () => {
        setLoading(true);
        try {
            const result = await db.select({
                id: Expenses.id,
                name: Expenses.name,
                amount: Expenses.amount,
                createdAt: Expenses.createdAt,
                budgetName: Budgets.name,
                budgetIcon: Budgets.icon,
            }).from(Expenses)
                .innerJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
                .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
                .orderBy(desc(Expenses.id));
            setAllExpenses(result);
        } finally {
            setLoading(false);
        }
    };

    const deleteBudget = async () => {
        try {
            await db.delete(Expenses).where(eq(Expenses.budgetId, parseInt(budgetId)));
            await db.delete(Budgets).where(eq(Budgets.id, parseInt(budgetId)));
            toast.success("Budget deleted!");
            router.push("/dashboard/budgets");
        } catch (err) {
            toast.error("Failed to delete budget");
        }
    };

    // All Expenses View
    if (!budgetId) {
        return (
            <div>
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                        <ReceiptText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            All Expenses
                        </h1>
                        <p className="text-sm text-gray-500">Every expense across all your budgets</p>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl p-8 border border-white/5"
                        style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 bg-white/5 rounded-xl" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/5 overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="grid grid-cols-4 border-b border-white/5 px-5 py-3"
                            style={{ background: "rgba(255,255,255,0.03)" }}>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider col-span-2">Name</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {allExpenses.length === 0 ? (
                                <div className="px-5 py-10 text-center text-gray-600 text-sm">
                                    No expenses recorded yet.
                                </div>
                            ) : allExpenses.map((expense) => (
                                <div key={expense.id} className="grid grid-cols-4 px-5 py-4 items-center hover:bg-white/3 transition-colors">
                                    <div className="col-span-2 flex items-center gap-3">
                                        <span className="text-xl">{expense.budgetIcon}</span>
                                        <div>
                                            <p className="font-medium text-gray-200 text-sm">{expense.name}</p>
                                            <p className="text-xs text-gray-600">{expense.budgetName}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-indigo-400 text-sm">
                                        ₹{Number(expense.amount).toLocaleString()}
                                    </span>
                                    <span className="text-gray-600 text-xs">{expense.createdAt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Single Budget Expenses View
    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/budgets">
                        <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            {budgetInfo?.icon} {budgetInfo?.name}
                        </h1>
                        <p className="text-sm text-gray-500">Manage budget expenses</p>
                    </div>
                </div>

                {/* Delete Budget */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline"
                            className="text-red-400 border-red-500/20 bg-transparent hover:bg-red-500/10 rounded-xl gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete Budget
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl bg-gray-900 border border-gray-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete this budget?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                This will permanently delete this budget and all its expenses. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={deleteBudget}
                                className="bg-red-500 hover:bg-red-600 rounded-xl">
                                Yes, Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-1 space-y-5">
                    {budgetInfo && <BudgetItem budget={budgetInfo} />}
                    {budgetId && (
                        <AddExpense
                            budgetId={budgetId}
                            user={user}
                            refreshData={getBudgetInfo}
                        />
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-white text-lg"
                            style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            Expense History
                        </h2>
                        <span className="text-sm text-gray-500">{expensesList.length} entries</span>
                    </div>
                    <ExpenseListTable
                        expensesList={expensesList}
                        refreshData={getBudgetInfo}
                    />
                </div>

            </div>
        </div>
    );
}

export default function ExpensesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ExpensesContent />
        </Suspense>
    );
}