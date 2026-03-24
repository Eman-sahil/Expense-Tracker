"use client"
import React, { useEffect } from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { useRouter } from "next/navigation";

function DashboardLayout({ children }) {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        user && checkUserBudgets();
    }, [user]);

    const checkUserBudgets = async () => {
        const result = await db.select()
            .from(Budgets)
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
        if (result?.length === 0) {
            router.replace('/dashboard/budgets');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">

            {/* Desktop Sidebar */}
            <div className="fixed md:w-64 hidden md:block h-screen z-30">
                <SideNav />
            </div>

            {/* Mobile Hamburger + Sidebar */}
            <div className="md:hidden">
                <SideNav />
            </div>

            {/* Main Content */}
            <div className="md:ml-64 transition-all duration-300">
                <DashboardHeader />
                <div className="p-4 md:p-10">
                    {children}
                </div>
            </div>

        </div>
    );
}

export default DashboardLayout;