"use client";
import React, { useState } from "react";
import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import moment from "moment";

function AddExpense({ budgetId, user, refreshData }) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const addNewExpense = async () => {
        if (!name || !amount) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            const result = await db.insert(Expenses).values({
                name: name,
                amount: amount,
                budgetId: budgetId,
                createdAt: moment().format("DD/MM/YYYY"),
            }).returning({ insertedId: Expenses.id });

            if (result) {
                refreshData();
                toast.success("Expense added!");
                setName("");
                setAmount("");
            }
        } catch (err) {
            toast.error("Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Add New Expense
            </h2>

            <div className="space-y-4">

                {/* Expense Name */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Expense Name
                    </label>
                    <Input
                        placeholder="e.g. Milk, Netflix, Fuel..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border-gray-200"
                    />
                </div>

                {/* Expense Amount */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Amount (₹)
                    </label>
                    <Input
                        type="number"
                        placeholder="e.g. 499"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="rounded-xl border-gray-200"
                    />
                </div>

                {/* Submit Button */}
                <Button
                    onClick={addNewExpense}
                    disabled={loading || !name || !amount}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-5 font-semibold"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Adding...</>
                    ) : (
                        "Add Expense"
                    )}
                </Button>

            </div>
        </div>
    );
}

export default AddExpense;