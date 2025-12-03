import React, { useState } from 'react';
import { useApp } from '../../../context/store';
import { api } from '../../../api/client';
import { Customer } from '../../../types';
import { generateId } from '../../../lib/utils';
import { X } from 'lucide-react';

interface CustomerFormProps {
  onClose: () => void;
  initialData?: Customer;
}

export const CustomerForm = ({ onClose, initialData }: CustomerFormProps) => {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState<Partial<Customer>>(initialData || {
    name: '',
    email: '',
    externalId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (initialData) {
      // Update existing customer
      dispatch({
        type: 'UPDATE_CUSTOMER',
        payload: { ...initialData, ...formData } as Customer,
      });
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: generateId(),
        name: formData.name || '',
        email: formData.email || '',
        externalId: formData.externalId || '',
        customerType: 'individual',
        currency: 'USD',
        billingAddress: {
          line1: '',
          city: '',
          zip: '',
          country: 'US',
        },
        subscriptions: [],
        appliedCoupons: [],
        createdAt: new Date().toISOString(),
        metadata: {},
      };

      // Persist to Backend
      api.createCustomer(newCustomer).then(savedCustomer => {
        dispatch({ type: 'ADD_CUSTOMER', payload: savedCustomer });
      }).catch(err => {
        console.error("Failed to save customer", err);
        // Fallback to local state if API fails (or show error)
        dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
      });
    }

    onClose();
  };

  const handleChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="customer@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="externalId" className="block text-sm font-medium text-gray-700 mb-1">
              External ID
            </label>
            <input
              type="text"
              id="externalId"
              value={formData.externalId || ''}
              onChange={(e) => handleChange('externalId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., cust_123456"
              required
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
              {initialData ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
