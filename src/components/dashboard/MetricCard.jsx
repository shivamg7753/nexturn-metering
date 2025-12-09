import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * MetricCard Component
 * Displays a single metric with icon, value, and trend
 */
export const MetricCard = ({
    title,
    value,
    change,
    trend,
    icon: Icon,
    trendGood = trend === 'up'
}) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
                <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div className={`flex items-center text-xs font-medium ${trendGood ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {change}
            </div>
        </div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
);
