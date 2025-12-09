import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/store';
import { ChevronRight, ArrowLeft, MoreHorizontal, Copy, Tag, X, Calendar, Edit2, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const AccountDetail = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const [account, setAccount] = useState(null);
    const [activeTab, setActiveTab] = useState('account-details');
    const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');
    const [cycleOverride, setCycleOverride] = useState(false);

    useEffect(() => {
        // Find customers by accountId or id matching the param
        const foundAccount = state.customers.find(c =>
            (c.accountId && c.accountId.toString() === accountId) ||
            (c.id && c.id.toString() === accountId)
        );

        if (foundAccount) {
            setAccount(foundAccount);
        }
    }, [accountId, state.customers]);

    if (!account) {
        return <div className="p-8">Loading account...</div>;
    }

    const handleAttachPlan = () => {
        if (!selectedPlanId || !effectiveDate) {
            toast.error('Please select a plan and effective date');
            return;
        }

        const selectedPlan = state.plans.find(p => p.id === selectedPlanId);

        if (!selectedPlan) {
            toast.error('Invalid plan selected');
            return;
        }

        const updatedAccount = {
            ...account,
            pricePlan: {
                id: selectedPlan.id,
                name: selectedPlan.name,
                startDate: effectiveDate,
                status: 'Active',
                cycle: selectedPlan.interval || 'Monthly'
            }
        };

        dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedAccount });
        setAccount(updatedAccount); // Update local state immediately
        setIsAttachModalOpen(false);
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Price Plan associated successfully
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={() => toast.dismiss(t.id)}
                            >
                                <span className="sr-only">Close</span>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ), { duration: 3000 });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster position="top-right" />

            {/* Header Breadcrumbs & Title */}
            <div className="bg-white border-b border-gray-200 px-8 py-5">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link to="/customers" className="hover:text-gray-900">All Customers</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>{account.name}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">{account.accountName || account.name}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/customers')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">{account.accountName || account.name}</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                            {account.name}
                        </span>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Edit Account
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 mt-8">
                    {['Account Details', 'Credits', 'Invoices'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.toLowerCase().replace(' ', '-')
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-8 py-8">
                <div className="grid grid-cols-3 gap-6">

                    {/* Left Column - Price Plan Area */}
                    <div className="col-span-2">
                        {!account.pricePlan ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center h-96">
                                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                    <Tag className="w-8 h-8 text-purple-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Price Plan Attached</h3>
                                <p className="text-gray-500 mb-6 text-sm max-w-xs">
                                    Please attach a price plan to this account to initiate billing.
                                </p>
                                <button
                                    onClick={() => setIsAttachModalOpen(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                >
                                    Attach Price Plan &gt;
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                                <Tag className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Associated Price Plan</div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{account.pricePlan.name}</h3>
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                        • {account.pricePlan.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded px-3 py-1.5">
                                            View Price Plan Details
                                            <div className="w-3 h-3 border-t border-r border-gray-500 transform rotate-45 ml-1"></div>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="text-xs text-gray-500 mb-1">Plan Start Date</div>
                                            <div className="text-sm font-semibold text-gray-900">{account.pricePlan.startDate}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="text-xs text-gray-500 mb-1">Cycle Start Date</div>
                                            <div className="text-sm font-semibold text-gray-900">{account.pricePlan.startDate}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="text-xs text-gray-500 mb-1">Cycle End Date</div>
                                            <div className="text-sm font-semibold text-gray-900">Mar 31, 2023</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50/50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-gray-900">Price Plan Schedule</h4>
                                        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                            <Edit2 className="w-3 h-3" /> Edit Price Schedule
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Price Plan Name</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Effective Dates</th>
                                                    <th className="px-4 py-2 text-right font-medium text-gray-500">Pricing Cycle</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{account.pricePlan.name}</td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded border border-gray-200 text-xs">
                                                            <Calendar className="w-3 h-3" />
                                                            {account.pricePlan.startDate} → Forever
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600">{account.pricePlan.cycle}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Account Info */}
                    <div className="col-span-1 space-y-6">
                        {/* Revenue Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="text-xs font-medium text-gray-500 mb-1">Monthly Revenue</div>
                            <div className="text-3xl font-bold text-gray-900">0 <span className="text-lg font-normal text-gray-500">USD</span></div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="space-y-6">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Account Name</div>
                                    <div className="text-sm font-bold text-gray-900">{account.accountName || account.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Account ID</div>
                                    <div className="text-sm font-bold text-gray-900">{account.accountId || 'PA123'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Customer ID</div>
                                    <div className="text-sm font-bold text-gray-900">{account.customerId || 'PA123'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Currency</div>
                                    <div className="text-sm font-bold text-gray-900">{account.currency || 'USD'}</div>
                                </div>
                                <div className="border-t border-dashed border-gray-200 pt-4">
                                    <div className="text-xs text-gray-500 mb-1">Created <span className="text-gray-900">{account.createdAt}</span></div>
                                    <div className="text-xs text-gray-500">Last Updated <span className="text-gray-900">a few seconds ago</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Aliases Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">Account Aliases</div>
                            <div className="flex flex-wrap gap-2">
                                {account.accountAlias ? (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                                        {account.accountAlias}
                                    </span>
                                ) : account.aliases && account.aliases.map((alias, i) => (
                                    alias && (
                                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                                            {alias}
                                        </span>
                                    )
                                ))}

                                {(!account.accountAlias && (!account.aliases || account.aliases.length === 0)) && (
                                    <span className="text-xs text-gray-400 italic">No aliases</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attach Price Plan Modal */}
            {isAttachModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Associate Price Plan</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Associated Price Plan
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedPlanId}
                                        onChange={(e) => setSelectedPlanId(e.target.value)}
                                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="" disabled>Select a plan</option>
                                        {state.plans.map(plan => (
                                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <ChevronRight className="w-4 h-4 text-gray-500 transform rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Effective From Date
                                </label>
                                <input
                                    type="date"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Add Cycle Override</span>
                                <button
                                    role="switch"
                                    aria-checked={cycleOverride}
                                    onClick={() => setCycleOverride(!cycleOverride)}
                                    className={`${cycleOverride ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                >
                                    <span className={`${cycleOverride ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 transition-all">
                            <button
                                onClick={() => setIsAttachModalOpen(false)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAttachPlan}
                                disabled={!selectedPlanId || !effectiveDate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                Add Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
