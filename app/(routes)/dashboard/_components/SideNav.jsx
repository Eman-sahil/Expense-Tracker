"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { LayoutGrid, PiggyBank, ReceiptText, CalendarDays, CalendarRange, BarChart2, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";

function SideNav() {
    const pathname = usePathname();
    const { user } = useUser();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuList = [
        { id: 1, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
        { id: 2, name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
        { id: 3, name: "Expenses", icon: ReceiptText, path: "/dashboard/expenses" },
        { id: 4, name: "Monthly", icon: CalendarDays, path: "/dashboard/monthly-review" },
        { id: 5, name: "Yearly", icon: CalendarRange, path: "/dashboard/yearly-review" },
        { id: 6, name: "Reports", icon: BarChart2, path: "/dashboard/reports" },
    ];

    const MenuItems = ({ onClose }) => (
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-4">
                Navigation
            </p>
            {menuList.map((menu) => {
                const isActive = pathname === menu.path;
                return (
                    <Link
                        key={menu.id}
                        href={menu.path}
                        onClick={onClose}
                    >
                        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group mb-2
                            ${isActive
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}>
                            <menu.icon className={`w-5 h-5 shrink-0
                                ${isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-600"}`} />
                            <span className={`font-medium text-sm ${isActive ? "text-white" : ""}`}>
                                {menu.name}
                            </span>
                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );

    return (
        <>
            {/* ===== DESKTOP SIDEBAR — hidden on mobile ===== */}
            <div className="hidden md:flex h-screen flex-col bg-white border-r border-gray-100 shadow-sm">
                <div className="px-6 py-6 border-b border-gray-100">
                    <Image src="/logo.svg" alt="logo" width={140} height={80} />
                    <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider uppercase">
                        Expense Tracker
                    </p>
                </div>
                <MenuItems onClose={() => { }} />
                <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 bg-gray-50">
                    <UserButton fallbackRedirectUrl="/" />
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {user?.fullName || "Profile"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== MOBILE HAMBURGER BUTTON ===== */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2.5 bg-white rounded-xl shadow-md border border-gray-100"
                >
                    <Menu className="w-5 h-5 text-gray-700" />
                </button>
            </div>

            {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
            {mobileOpen && (
                <>
                    {/* Dark backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* Slide-in sidebar */}
                    <div className="fixed top-0 left-0 h-screen w-72 bg-white z-50 flex flex-col shadow-2xl">

                        {/* Header */}
                        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <Image src="/logo.svg" alt="logo" width={120} height={70} />
                                <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider uppercase">
                                    Expense Tracker
                                </p>
                            </div>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <MenuItems onClose={() => setMobileOpen(false)} />

                        {/* Profile */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 bg-gray-50">
                            <UserButton fallbackRedirectUrl="/" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                    {user?.fullName || "Profile"}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {user?.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </>
    );
}

export default SideNav;