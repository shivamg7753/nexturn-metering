import React from 'react';
import { StatusBadge } from '../dashboard/StatusBadge';
import { formatCurrency } from '../../lib/utils';
import { SubscriptionForm } from '../features/subscriptions/SubscriptionForm';
import { SubscriptionManager } from '../features/subscriptions/SubscriptionManager';

/**
 * SubscriptionsSection Component
 * Manages display and editing of customer subscriptions
 */
export const SubscriptionsSection = ({
    subscriptions,
    plans,
    products,
    customerId,
    isFormOpen,
    onOpenForm,
    onCloseForm,
    managingSubscription,
    onManageSubscription,
    onCloseManager,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Subscriptions</h2>
                <button
                    onClick={onOpenForm}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                    Add Subscription
                </button>
            </div>

            {isFormOpen && (
                <SubscriptionForm onClose={onCloseForm} customerId={customerId} />
            )}

            {managingSubscription && (
                <SubscriptionManager
                    subscription={managingSubscription}
                    onClose={onCloseManager}
                />
            )}

            {subscriptions.length > 0 ? (
                <div className="space-y-4">
                    {subscriptions.map(sub => {
                        const plan = plans.find(p => p.id === sub.planId);
                        const product = products?.find(prod => prod.id === plan?.productId);
                        return (
                            <div key={sub.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        {product ? <span className="text-indigo-600 mr-2">[{product.name}]</span> : null}
                                        {plan?.name || 'Unknown Plan'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {formatCurrency(plan?.amountCents || 0, plan?.currency || 'USD')} / {plan?.interval}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <StatusBadge status={sub.status} />
                                    <button
                                        onClick={() => onManageSubscription(sub)}
                                        className="text-sm text-gray-500 hover:text-gray-900"
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">No active subscriptions</p>
            )}
        </div>
    );
};
