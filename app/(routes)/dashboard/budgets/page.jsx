"use client";
import React, { useEffect, useState } from "react";
import CreateBudget from "./_components/CreateBudget";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql } from "drizzle-orm";
import BudgetItem from "./_components/BudgetItem";
import { PiggyBank } from "lucide-react";

function BudgetsPage() {
    const [budgetList, setBudgetList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        user && getBudgetList();
    }, [user]);

    const getBudgetList = async () => {
        setLoading(true);
        try {
            const result = await db
                .select({
                    ...getTableColumns(Budgets),
                    totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
                    totalItem: sql`COALESCE(count(${Expenses.id}), 0)`.mapWith(Number),
                })
                .from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
                .groupBy(Budgets.id)
                .orderBy(Budgets.id);
            setBudgetList(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <PiggyBank className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Budgets</h1>
                        <p className="text-sm text-gray-400">Manage and track all your budgets</p>
                    </div>
                </div>
            </div>

            {/* Budget Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* Create Budget Card */}
                <CreateBudget refreshData={getBudgetList} />

                {/* Loading Skeleton */}
                {loading
                    ? [1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full mt-4" />
                        </div>
                    ))
                    : budgetList.map((budget) => (
                        <BudgetItem key={budget.id} budget={budget} />
                    ))}
            </div>

            {/* Empty State */}
            {!loading && budgetList.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PiggyBank className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No budgets yet</h3>
                    <p className="text-gray-400 text-sm">Create your first budget to start tracking expenses</p>
                </div>
            )}
        </div>
    );
}

export default BudgetsPage;