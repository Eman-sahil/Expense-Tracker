import React from 'react'
import { CalendarRange } from 'lucide-react'

function YearlyReviewPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarRange className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Yearly Review</h1>
            <p className="text-gray-400 text-sm">Coming soon — yearly trends and financial summary.</p>
        </div>
    )
}

export default YearlyReviewPage