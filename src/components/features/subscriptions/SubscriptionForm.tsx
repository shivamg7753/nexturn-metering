import React, { useState } from 'react';
import { useApp } from '../../../context/store';
import { api } from '../../../api/client';
import { Subscription, Invoice } from '../../../types';
import { generateId } from '../../../lib/utils';
import { X } from 'lucide-react';

interface SubscriptionFormProps {
  onClose: () => void;
  customerId?: string;
}

export const SubscriptionForm = ({ onClose, customerId }: SubscriptionFormProps) => {
  const { state, dispatch } = useApp();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const plan = state.plans.find(p => p.id === selectedPlanId);
    const customer = state.customers.find(c => c.id === selectedCustomerId);

    if (!plan || !customer) return;

    const subscription: Subscription = {
      id: generateId('sub_'),
      externalId: generateId('ext_sub_'),
      customerId: customer.id,
      planId: plan.id,
      status: 'active',
      startDate: new Date(startDate).toISOString(),
      billingTime: 'calendar', // Default
      createdAt: new Date().toISOString(),
    };

    // Persist to Backend
    api.createSubscription(subscription).then(savedSub => {
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: savedSub });
    }).catch(err => {
      console.error("Failed to save subscription", err);
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: subscription });
    });

    // Simulate Invoice Generation if Pay in Advance
    if (plan.payInAdvance) {
      const invoice: Invoice = {
        id: generateId('inv_'),
        number: `INV-${generateId('num_').substring(0, 6).toUpperCase()}`,
        customerId: customer.id,
        subscriptionIds: [subscription.id],
        issuingDate: new Date().toISOString(),
        dueDate: new Date().toISOString(), // Immediate due
        status: 'finalized',
        paymentStatus: 'pending',
        currency: plan.currency,
        fees: [
          {
            id: generateId('fee_'),
            invoiceId: '', // Will be set by reducer or ignored in mock
            type: 'subscription',
            description: `Subscription to ${plan.name}`,
            units: 1,
            unitAmountCents: plan.amountCents,
            amountCents: plan.amountCents,
            taxesAmountCents: 0,
            totalAmountCents: plan.amountCents,
          }
        ],
        subscriptionAmountCents: plan.amountCents,
        chargesAmountCents: 0,
        couponsAmountCents: 0,
        creditsAmountCents: 0,
        taxesAmountCents: 0,
        totalAmountCents: plan.amountCents,
        prepaidCreditAmountCents: 0,
        createdAt: new Date().toISOString(),
      };
      // Fix circular ref for fee.invoiceId
      invoice.fees[0].invoiceId = invoice.id;

      dispatch({ type: 'ADD_INVOICE', payload: invoice });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Subscription</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!customerId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                required
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a customer</option>
                {state.customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select
              required
              value={selectedPlanId}
              onChange={e => setSelectedPlanId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a plan</option>
              {state.plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Create Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
