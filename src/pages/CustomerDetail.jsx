import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';
import { ArrowLeft, ChevronRight, Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { QuotaUsageCard } from '../components/customers/QuotaUsageCard';

export const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Customer Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    billingAddress: ''
  });

  // Add Account Form State
  const [accountForm, setAccountForm] = useState({
    accountName: '',
    accountId: '',
    currency: 'USD',
    aliases: ['']
  });

  const customer = state.customers.find(c => c.id === id);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Customer not found</h2>
        <Link to="/customers" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Return to Customers
        </Link>
      </div>
    );
  }

  // Get all accounts for this customer (accounts are customer records with accountId)
  const customerAccounts = state.customers.filter(c =>
    c.id === customer.id || (c.metadata?.parentCustomerId === customer.id)
  );

  // Show customer as main account plus any child accounts created under it
  const childAccounts = state.customers.filter(c => c.metadata?.parentCustomerId === customer.id);
  const accounts = [customer, ...childAccounts];

  // Calculate monthly revenue across all accounts
  const monthlyRevenue = 0; // TODO: Calculate from subscriptions

  // Get account subscriptions and calculate billing
  const getAccountBilling = (accountId) => {
    const subscriptions = state.subscriptions?.filter(s => s.customerId === accountId && s.status === 'active') || [];

    if (subscriptions.length === 0) return { plan: 'Startup', amount: 0 };

    const plan = state.plans?.find(p => p.id === subscriptions[0].planId);
    return {
      plan: plan?.name || 'Startup',
      amount: 0.00
    };
  };

  const handleCopyId = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleAccountClick = (accountId) => {
    navigate(`/accounts/${accountId}`);
  };

  // Edit Customer Handlers
  const handleOpenEditModal = () => {
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      billingAddress: customer.billingAddress || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveCustomer = async () => {
    if (!editForm.name || !editForm.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3000/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      const updatedCustomer = await response.json();
      dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });

      setIsEditModalOpen(false);
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error(error.message || 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Account Handlers
  const handleOpenAddAccountModal = () => {
    setAccountForm({
      accountName: '',
      accountId: '',
      currency: 'USD',
      aliases: ['']
    });
    setIsAddAccountModalOpen(true);
  };

  const handleAddAlias = () => {
    setAccountForm(prev => ({
      ...prev,
      aliases: [...prev.aliases, '']
    }));
  };

  const handleRemoveAlias = (index) => {
    setAccountForm(prev => ({
      ...prev,
      aliases: prev.aliases.filter((_, i) => i !== index)
    }));
  };

  const handleAliasChange = (index, value) => {
    setAccountForm(prev => {
      const newAliases = [...prev.aliases];
      newAliases[index] = value;
      return {
        ...prev,
        aliases: newAliases
      };
    });
  };

  const handleCreateAccount = async () => {
    if (!accountForm.accountName || !accountForm.accountId) {
      toast.error('Account name and ID are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const newAccountData = {
        name: accountForm.accountName, // Use the account name from the form
        email: customer.email, // Inherit email from parent customer
        customerId: `${customer.externalId || customer.customerId}-${accountForm.accountId}`, // Unique customer ID
        billingAddress: customer.billingAddress,
        currency: accountForm.currency,
        accountId: accountForm.accountId,
        accountName: accountForm.accountName,
        aliases: accountForm.aliases.filter(a => a.trim() !== ''),
        metadata: {
          parentCustomerId: customer.id
        }
      };

      const savedAccount = await api.createCustomer(newAccountData);

      if (savedAccount.error) {
        throw new Error(savedAccount.error);
      }

      dispatch({ type: 'ADD_CUSTOMER', payload: savedAccount });

      setIsAddAccountModalOpen(false);
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <Link to="/customers" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            {/* Customer Name */}
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleOpenEditModal}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit Customer
            </button>
            <button
              onClick={handleOpenAddAccountModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Add Account
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Accounts Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Total Accounts <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{accounts.length}</span>
                  </h3>
                </div>
              </div>

              {/* Table */}
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billed to-date
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.map((account) => {
                    const billing = getAccountBilling(account.id);
                    return (
                      <tr
                        key={account.id}
                        onClick={() => handleAccountClick(account.accountId || account.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {account.accountName || account.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {account.accountId || account.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{billing.plan}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{billing.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Customer Info */}
          <div className="space-y-6">
            {/* Monthly Revenue Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="w-full">
                  <div className="h-2 bg-indigo-600 rounded-full"></div>
                </div>
              </div>
              <div className="text-xs font-medium text-gray-500 mb-1">Monthly Revenue Across Accounts</div>
              <div className="text-3xl font-bold text-gray-900">
                {monthlyRevenue} <span className="text-lg font-normal text-gray-500">USD</span>
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">Customer Name</div>
                  <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">E-mail ID</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">{customer.email}</div>
                    <button
                      onClick={() => handleCopyId(customer.email)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">Customer ID</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-gray-900">{customer.externalId || customer.customerId || customer.id}</div>
                    <button
                      onClick={() => handleCopyId(customer.externalId || customer.customerId || customer.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">Total Accounts</div>
                  <div className="text-sm font-bold text-gray-900">{accounts.length}</div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
                  <div className="text-xs text-gray-500">
                    Created <span className="text-gray-900 font-medium">{customer.createdAt}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last Updated <span className="text-gray-900 font-medium">an hour ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quota & Usage Card */}
            <QuotaUsageCard accountId={customer.id} accountName={customer.name} />
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Customer</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter customer name"
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
                  Billing Address
                </label>
                <input
                  type="text"
                  value={editForm.billingAddress}
                  onChange={(e) => setEditForm({ ...editForm, billingAddress: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter billing address"
                />
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
                onClick={handleSaveCustomer}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add New Account</h3>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountForm.accountName}
                  onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter account name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account ID
                </label>
                <input
                  type="text"
                  value={accountForm.accountId}
                  onChange={(e) => setAccountForm({ ...accountForm, accountId: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter account ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={accountForm.currency}
                  onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="USD">USD - United States dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Alias
                </label>
                {accountForm.aliases.map((alias, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => handleAliasChange(index, e.target.value)}
                      placeholder="Enter alias"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {accountForm.aliases.length > 1 && (
                      <button
                        onClick={() => handleRemoveAlias(index)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddAlias}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  type="button"
                >
                  + Add Alias
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

