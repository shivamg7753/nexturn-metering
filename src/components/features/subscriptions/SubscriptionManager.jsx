import React, { useState } from 'react';
import { useApp } from '../../../context/store';

import { X, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';



export const SubscriptionManager = ({ subscription, onClose }) => {
  const { state, dispatch } = useApp();
  const [view, setView] = useState('details');
  const [selectedPlanId, setSelectedPlanId] = useState(subscription.planId);

  const currentPlan = state.plans.find(p => p.id === subscription.planId);
  const selectedPlan = state.plans.find(p => p.id === selectedPlanId);

  const handleCancel = () => {
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: {
        id: subscription.id,
        updates: {
          status: 'canceled',
          terminatedAt: new Date().toISOString(),
        }
      }
    });
    onClose();
  };

  const handleSwitchPlan = () => {
    if (selectedPlanId === subscription.planId) return;

    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: {
        id: subscription.id,
        updates: {
          planId: selectedPlanId,
        }
      }
    });
    // In a real app, we'd handle proration and invoicing here
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Manage Subscription</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {view === 'details' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                <h3 className="text-lg font-semibold text-gray-900">{currentPlan?.name}</h3>
                <p className="text-gray-600">
                  {formatCurrency(currentPlan?.amountCents || 0, currentPlan?.currency || 'USD')} / {currentPlan?.interval}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {subscription.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Started {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setView('switch')}
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Switch Plan
                </button>
                <button
                  onClick={() => setView('cancel')}
                  className="w-full py-2 px-4 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}

          {view === 'switch' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Select New Plan</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {state.plans.map(plan => (
                  <label
                    key={plan.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors
                      ${selectedPlanId === plan.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={selectedPlanId === plan.id}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(plan.amountCents, plan.currency)} / {plan.interval}
                    </p>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setView('details')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Back
                </button>
                <button
                  onClick={handleSwitchPlan}
                  disabled={selectedPlanId === subscription.planId}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          )}

          {view === 'cancel' && (
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Cancel Subscription?</h3>
                  <p className="mt-1 text-sm text-red-700">
                    This will immediately cancel the subscription. The customer will no longer be billed.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setView('details')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

