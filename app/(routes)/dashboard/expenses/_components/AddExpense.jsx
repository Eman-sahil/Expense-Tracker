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
        if (!name || !amount) { toast.error("Please fill in all fields"); return; }
        setLoading(true);
        try {
            const result = await db.insert(Expenses).values({
                name, amount, budgetId,
                createdAt: moment().format("DD/MM/YYYY"),
            }).returning({ insertedId: Expenses.id });
            if (result) {
                refreshData();
                toast.success("Expense added!");
                setName(""); setAmount("");
            }
        } catch (err) {
            toast.error("Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl p-6 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <h2 className="font-bold text-white text-lg mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                Add New Expense
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1.5 block">Expense Name</label>
                    <Input
                        placeholder="e.g. Milk, Netflix, Fuel..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1.5 block">Amount (₹)</label>
                    <Input
                        type="number"
                        placeholder="e.g. 499"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="rounded-xl bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-indigo-500"
                    />
                </div>
                <Button
                    onClick={addNewExpense}
                    disabled={loading || !name || !amount}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-5 font-semibold"
                >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Adding...</> : "Add Expense"}
                </Button>
            </div>
        </div>
    );
}

export default AddExpense;
