import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function StatsCard({ title, value, icon: Icon, color, sub, trend }) {
    const colorMap = {
        indigo: {
            gradient: "from-indigo-500/20 via-indigo-600/10 to-transparent",
            border: "border-indigo-500/20",
            icon: "text-indigo-400",
            iconBg: "bg-indigo-500/10 border-indigo-500/20",
            text: "text-indigo-300",
            glow: "shadow-indigo-900/20",
        },
        green: {
            gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
            border: "border-emerald-500/20",
            icon: "text-emerald-400",
            iconBg: "bg-emerald-500/10 border-emerald-500/20",
            text: "text-emerald-300",
            glow: "shadow-emerald-900/20",
        },
        orange: {
            gradient: "from-orange-500/20 via-orange-600/10 to-transparent",
            border: "border-orange-500/20",
            icon: "text-orange-400",
            iconBg: "bg-orange-500/10 border-orange-500/20",
            text: "text-orange-300",
            glow: "shadow-orange-900/20",
        },
        red: {
            gradient: "from-red-500/20 via-red-600/10 to-transparent",
            border: "border-red-500/20",
            icon: "text-red-400",
            iconBg: "bg-red-500/10 border-red-500/20",
            text: "text-red-300",
            glow: "shadow-red-900/20",
        },
        purple: {
            gradient: "from-purple-500/20 via-purple-600/10 to-transparent",
            border: "border-purple-500/20",
            icon: "text-purple-400",
            iconBg: "bg-purple-500/10 border-purple-500/20",
            text: "text-purple-300",
            glow: "shadow-purple-900/20",
        },
    };

    const c = colorMap[color] || colorMap.indigo;

    return (
        <div className={`relative overflow-hidden rounded-2xl border ${c.border} bg-gray-950 hover:scale-[1.02] transition-all duration-300 shadow-xl ${c.glow} group`}>
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-linear-to-br ${c.gradient} opacity-60`} />

            {/* Decorative corner dot */}
            <div className={`absolute top-3 right-3 w-1 h-1 rounded-full ${c.icon} opacity-50`} />

            <div className="relative p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 ${c.iconBg} border rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                            ${trend > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : trend < 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">{title}</p>
                <p className={`text-2xl font-bold ${c.text}`}
                    style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    {value}
                </p>
                {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

export default StatsCard;
