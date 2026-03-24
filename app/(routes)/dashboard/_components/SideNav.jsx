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
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">
                Navigation
            </p>
            {menuList.map((menu) => {
                const isActive = pathname === menu.path;
                return (
                    <Link key={menu.id} href={menu.path} onClick={onClose}>
                        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group mb-1
                            ${isActive
                                ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30"
                                : "text-gray-500 hover:bg-gray-800/50 hover:text-gray-200"
                            }`}>
                            <menu.icon className={`w-4 h-4 shrink-0
                                ${isActive ? "text-white" : "text-gray-600 group-hover:text-gray-300"}`} />
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
            {/* ===== DESKTOP SIDEBAR ===== */}
            <div className="hidden md:flex h-screen flex-col bg-gray-950 border-r border-gray-800/50">

                {/* Logo */}
                <div className="px-5 py-5 border-b border-gray-800/50">
                    <Image
                        src="/logo.svg"
                        alt="logo"
                        width={130}
                        height={70}
                        className="brightness-0 invert"
                    />
                    <p className="text-xs text-gray-600 mt-1 tracking-wider uppercase">
                        Expense Tracker
                    </p>
                </div>

                <MenuItems onClose={() => { }} />

                {/* Profile */}
                <div className="px-5 py-4 border-t border-gray-800/50 flex items-center gap-3 bg-gray-900/50">
                    <UserButton fallbackRedirectUrl="/" />
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-200 truncate">
                            {user?.fullName || "Profile"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== MOBILE HAMBURGER BUTTON ===== */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2.5 bg-gray-900 rounded-xl shadow-md border border-gray-800"
                >
                    <Menu className="w-5 h-5 text-gray-300" />
                </button>
            </div>

            {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="fixed top-0 left-0 h-screen w-72 bg-gray-950 z-50 flex flex-col shadow-2xl border-r border-gray-800/50">
                        <div className="px-5 py-5 border-b border-gray-800/50 flex items-center justify-between">
                            <div>
                                <Image src="/logo.svg" alt="logo" width={120} height={70} className="brightness-0 invert" />
                                <p className="text-xs text-gray-600 mt-1 tracking-wider uppercase">Expense Tracker</p>
                            </div>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <MenuItems onClose={() => setMobileOpen(false)} />
                        <div className="px-5 py-4 border-t border-gray-800/50 flex items-center gap-3 bg-gray-900/50">
                            <UserButton fallbackRedirectUrl="/" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-gray-200 truncate">{user?.fullName || "Profile"}</p>
                                <p className="text-xs text-gray-600 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default SideNav;