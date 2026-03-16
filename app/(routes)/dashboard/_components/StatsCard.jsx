import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function StatsCard({ title, value, icon: Icon, color, sub, trend }) {

    const colorMap = {
        indigo: {
            bg: "bg-indigo-50",
            icon: "text-indigo-600",
            text: "text-indigo-600",
        },
        green: {
            bg: "bg-green-50",
            icon: "text-green-600",
            text: "text-green-600",
        },
        orange: {
            bg: "bg-orange-50",
            icon: "text-orange-600",
            text: "text-orange-600",
        },
        red: {
            bg: "bg-red-50",
            icon: "text-red-600",
            text: "text-red-600",
        },
    };

    const c = colorMap[color] || colorMap.indigo;

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">

            {/* Top Row */}
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                        ${trend > 0
                            ? 'bg-red-50 text-red-500'
                            : trend < 0
                                ? 'bg-green-50 text-green-500'
                                : 'bg-gray-50 text-gray-400'
                        }`}>
                        {trend > 0
                            ? <TrendingUp className="w-3 h-3" />
                            : trend < 0
                                ? <TrendingDown className="w-3 h-3" />
                                : <Minus className="w-3 h-3" />
                        }
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            {/* Bottom Row */}
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>

        </div>
    );
}

export default StatsCard;