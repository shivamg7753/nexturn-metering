import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, CreditCard, BarChart3, FileText,
    Settings, Zap, Wallet, Tag, Receipt, Code, Gauge, Package
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Plans', href: '/plans', icon: CreditCard },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Events', href: '/events', icon: Zap },
    { name: 'Billable Items', href: '/billable-items', icon: Gauge },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
    return (
        <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 min-h-screen">
            <div className="flex items-center h-16 px-6 border-b border-slate-800">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">LagoClone</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-200 font-medium text-xs">
                        JD
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">John Doe</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
