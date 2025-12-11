import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/store';
import { ChevronRight, ArrowLeft, MoreHorizontal, Copy, Tag, X, Calendar, Edit2, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { QuotaUsageCard } from '../components/customers/QuotaUsageCard';

export const AccountDetail = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const [account, setAccount] = useState(null);
    const [activeTab, setActiveTab] = useState('account-details');
    const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');
    const [cycleOverride, setCycleOverride] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        currency: ''
    });
    const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);

    // Get active subscriptions for this account
    const accountSubscriptions = state.subscriptions?.filter(
        s => s.customerId === account?.id && s.status === 'active'
    ) || [];

    const calculateCycleEndDate = (startDate, cycle) => {
        if (!startDate) return '-';
        const date = new Date(startDate);
        if (isNaN(date.getTime())) return '-';

        const newDate = new Date(date);

        switch (cycle?.toLowerCase()) {
            case 'yearly':
            case 'year':
            case 'annually':
                newDate.setFullYear(date.getFullYear() + 1);
                break;
            case 'weekly':
            case 'week':
                newDate.setDate(date.getDate() + 7);
                break;
            case 'daily':
            case 'day':
                newDate.setDate(date.getDate() + 1);
                break;
            case 'monthly':
            case 'month':
            default:
                newDate.setMonth(date.getMonth() + 1);
                break;
        }

        // Return formatted date (e.g. "Dec 14, 2025")
        return newDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    useEffect(() => {
        // Find customers by accountId or id matching the param
        // Find customers by accountId (in metadata or root) or id matching the param
        const foundAccount = state.customers.find(c =>
            (c.metadata?.accountId && c.metadata.accountId.toString() === accountId) ||
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

    const handleAttachPlan = async () => {
        if (!selectedPlanId || !effectiveDate) {
            toast.error('Please select a plan and effective date');
            return;
        }

        const selectedPlan = state.plans.find(p => p.id === selectedPlanId);

        if (!selectedPlan) {
            toast.error('Invalid plan selected');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create subscription via API
            const response = await fetch('http://localhost:3000/api/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: account.id,
                    planId: selectedPlan.id,
                    status: 'active',
                    startDate: effectiveDate,
                    billingTime: 'calendar'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create subscription');
            }

            const newSubscription = await response.json();

            // Add to state
            dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSubscription });

            setIsAttachModalOpen(false);
            setSelectedPlanId('');
            setSelectedProductId('');
            setEffectiveDate('');

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Subscription created successfully
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
        } catch (error) {
            console.error('Error creating subscription:', error);
            toast.error(error.message || 'Failed to create subscription');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditAccount = () => {
        setEditForm({
            name: account.name || '',
            email: account.email || '',
            currency: account.currency || 'USD'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveAccount = async () => {
        if (!editForm.name || !editForm.email) {
            toast.error('Name and email are required');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:3000/api/customers/${account.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            if (!response.ok) {
                throw new Error('Failed to update account');
            }

            const updatedAccount = await response.json();

            // Update state
            dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedAccount });
            setAccount(updatedAccount);

            setIsEditModalOpen(false);
            toast.success('Account updated successfully');
        } catch (error) {
            console.error('Error updating account:', error);
            toast.error(error.message || 'Failed to update account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!subscriptionToCancel) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:3000/api/subscriptions/${subscriptionToCancel.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'cancelled'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to cancel subscription');
            }

            const updatedSubscription = await response.json();

            // Update state
            dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: updatedSubscription });

            setSubscriptionToCancel(null);
            toast.success('Subscription cancelled successfully');
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            toast.error(error.message || 'Failed to cancel subscription');
        } finally {
            setIsSubmitting(false);
        }
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
                    <button
                        onClick={handleEditAccount}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
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

                    {/* Left Column - Subscriptions Area */}
                    <div className="col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Active Subscriptions</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {accountSubscriptions.length === 0
                                            ? 'No active subscriptions'
                                            : `${accountSubscriptions.length} active subscription${accountSubscriptions.length > 1 ? 's' : ''}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsAttachModalOpen(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                >
                                    Add Subscription
                                </button>
                            </div>

                            {/* Subscriptions List */}
                            {accountSubscriptions.length === 0 ? (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                        <Tag className="w-8 h-8 text-purple-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscriptions</h3>
                                    <p className="text-gray-500 mb-6 text-sm max-w-xs">
                                        Add a subscription to start billing this account for a product.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {accountSubscriptions.map((subscription) => {
                                        const plan = state.plans?.find(p => p.id === subscription.planId);
                                        const product = state.products?.find(p => p.id === plan?.productId);

                                        return (
                                            <div key={subscription.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                                            <Tag className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="text-lg font-bold text-gray-900">
                                                                    {product?.name || 'Unknown Product'}
                                                                </h4>
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                                    • {subscription.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {plan?.name || 'Unknown Plan'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => navigate(`/plans/${plan?.id}`)}
                                                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded px-3 py-1.5"
                                                        >
                                                            View Plan Details
                                                            <div className="w-3 h-3 border-t border-r border-gray-500 transform rotate-45 ml-1"></div>
                                                        </button>
                                                        <button
                                                            onClick={() => setSubscriptionToCancel(subscription)}
                                                            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded px-3 py-1.5 hover:bg-red-50"
                                                        >
                                                            Unsubscribe
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-xs text-gray-500 mb-1">Start Date</div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {new Date(subscription.startDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-xs text-gray-500 mb-1">Billing Cycle</div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {plan?.interval || 'Monthly'}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-xs text-gray-500 mb-1">Next Billing</div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {calculateCycleEndDate(subscription.startDate, plan?.interval)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
                                    <div className="text-sm font-bold text-gray-900">{account.metadata?.accountId || account.accountId || account.id}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Customer ID</div>
                                    <div className="text-sm font-bold text-gray-900">{account.externalId || account.customerId || account.id}</div>
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

                            {/* Quota & Usage Section */}
                            <div className="mt-8">
                                <QuotaUsageCard accountId={account.id} accountName={account.accountName || account.name} />
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
                            <h3 className="text-lg font-bold text-gray-900">Add Subscription</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Product
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedProductId}
                                            onChange={(e) => {
                                                setSelectedProductId(e.target.value);
                                                setSelectedPlanId(''); // Reset plan when product changes
                                            }}
                                            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select a product...</option>
                                            {state.products?.map(product => (
                                                <option key={product.id} value={product.id}>{product.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-gray-500 transform rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Associated Price Plan
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedPlanId}
                                            onChange={(e) => setSelectedPlanId(e.target.value)}
                                            disabled={!selectedProductId}
                                            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <option value="" disabled>Select a plan ({!selectedProductId ? 'Select Product first' : 'Select Plan'})</option>
                                            {state.plans
                                                .filter(plan => !selectedProductId || plan.productId === selectedProductId)
                                                .map(plan => (
                                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                                ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-gray-500 transform rotate-90" />
                                        </div>
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
                                disabled={!selectedPlanId || !effectiveDate || isSubmitting}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Subscription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Account Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Edit Account</h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter account name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                </label>
                                <select
                                    value={editForm.currency}
                                    onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="INR">INR</option>
                                    <option value="CAD">CAD</option>
                                    <option value="AUD">AUD</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAccount}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsubscribe Confirmation Modal */}
            {subscriptionToCancel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Unsubscribe</h3>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to unsubscribe from this plan? This action will cancel the subscription immediately.
                            </p>
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Plan</div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {state.plans?.find(p => p.id === subscriptionToCancel.planId)?.name || 'Unknown Plan'}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSubscriptionToCancel(null)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCancelSubscription}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {isSubmitting ? 'Unsubscribing...' : 'Unsubscribe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
