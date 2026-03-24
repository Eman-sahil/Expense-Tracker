"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { PlusCircle, Smile } from "lucide-react";

function CreateBudget({ refreshData }) {
    const [emojiIcon, setEmojiIcon] = useState("😀");
    const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const onCreateBudget = async () => {
        if (!name || !amount) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            const result = await db.insert(Budgets).values({
                name, amount,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                icon: emojiIcon,
            }).returning({ insertedId: Budgets.id });

            if (result) {
                refreshData();
                toast.success("New Budget Created!");
                setName(""); setAmount(""); setEmojiIcon("😀");
            }
        } catch (err) {
            toast.error("Failed to create budget");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="border-2 border-dashed border-indigo-500/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200 min-h-45 group">
                    <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                        <PlusCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-gray-300">Create New Budget</p>
                        <p className="text-sm text-gray-600 mt-1">Track your spending</p>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl bg-gray-900 border border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                        Create New Budget
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Set a budget with a name, amount, and an emoji to represent it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">

                    {/* Emoji Picker */}
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">Budget Icon</label>
                        <div className="relative">
                            <button
                                onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                                className="text-3xl p-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
                            >
                                {emojiIcon}
                                <Smile className="w-4 h-4 text-gray-500" />
                            </button>
                            {openEmojiPicker && (
                                <div className="absolute z-50 mt-2">
                                    <EmojiPicker
                                        onEmojiClick={(e) => {
                                            setEmojiIcon(e.emoji);
                                            setOpenEmojiPicker(false);
                                        }}
                                        theme="dark"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Budget Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">Budget Name</label>
                        <Input
                            placeholder="e.g. Groceries, Entertainment..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-xl bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-indigo-500"
                        />
                    </div>

                    {/* Budget Amount */}
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">Budget Amount (₹)</label>
                        <Input
                            type="number"
                            placeholder="e.g. 5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="rounded-xl bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" className="rounded-xl flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            onClick={onCreateBudget}
                            disabled={loading || !name || !amount}
                            className="rounded-xl flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {loading ? "Creating..." : "Create Budget"}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CreateBudget;
