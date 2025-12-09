import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';
import { Plus, AlertCircle, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Customers = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all-customers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState([]);

  const [step1Data, setStep1Data] = useState({
    customerName: '',
    emailId: '',
    customerId: '',
    billingAddress: ''
  });

  const [step2Data, setStep2Data] = useState({
    accountName: '',
    currency: 'USD - United States dollar',
    accountId: '',
    aliases: [''] // Array to hold multiple aliases
  });

  const handleStep1Change = (e) => {
    const { name, value } = e.target;
    setStep1Data(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStep2Change = (e) => {
    const { name, value } = e.target;
    setStep2Data(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceedToStep2 = () => {
    if (!step1Data.customerName || !step1Data.emailId || !step1Data.customerId || !step1Data.billingAddress) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCurrentStep(2);
  };

  const handleAddAlias = () => {
    setStep2Data(prev => ({
      ...prev,
      aliases: [...prev.aliases, '']
    }));
  };

  const handleRemoveAlias = (index) => {
    setStep2Data(prev => ({
      ...prev,
      aliases: prev.aliases.filter((_, i) => i !== index)
    }));
  };

  const handleAliasChange = (index, value) => {
    setStep2Data(prev => {
      const newAliases = [...prev.aliases];
      newAliases[index] = value;
      return {
        ...prev,
        aliases: newAliases
      };
    });
  };

  const handleCreateCustomer = () => {
    if (!step2Data.accountName || !step2Data.accountId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCustomer = {
      id: Date.now(),
      name: step1Data.customerName,
      email: step1Data.emailId,
      customerId: step1Data.customerId,
      billingAddress: step1Data.billingAddress,
      currency: step2Data.currency,
      accountId: step2Data.accountId,
      accountAlias: step2Data.accountAlias1,
      createdAt: new Date().toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };

    // setCustomers([...customers, newCustomer]); // Removed local state update
    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer }); // Added global store dispatch
    toast.success('Created a customer successfully');
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setStep1Data({
      customerName: '',
      emailId: '',
      customerId: '',
      billingAddress: ''
    });
    setStep2Data({
      accountName: '',
      currency: 'USD - United States dollar',
      accountId: '',
      aliases: ['']
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleAccountClick = (accountId) => {
    navigate(`/accounts/${accountId}`);
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Customer
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all-customers')}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all-customers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              All Customers
            </button>
            <button
              onClick={() => setActiveTab('all-accounts')}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all-accounts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              All Accounts
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {activeTab === 'all-customers' ? (
          state.customers.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg border border-gray-200 py-24 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Create your first Customer</h3>
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                New Customer
              </button>
            </div>
          ) : (
            /* Customer Table */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created on
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold mr-3">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.customerId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{customer.createdAt}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* All Accounts Table */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created on
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.customers.map((customer) => (
                  <tr
                    key={customer.accountId || customer.id}
                    onClick={() => handleAccountClick(customer.accountId || customer.id)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.accountName || customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.accountId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold mr-3 text-xs">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.customerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.pricePlan ? customer.pricePlan.name : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.createdAt}
                    </td>
                  </tr>
                ))}
                {state.customers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No accounts found. Create a customer to see accounts here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className={`flex items-center ${currentStep === 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Customer Details</span>
                </div>
                <ChevronRight className="w-5 h-5 mx-4 text-gray-400" />
                <div className={`flex items-center ${currentStep === 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Account Details</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              {currentStep === 1 ? (
                /* Step 1: Customer Details */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={step1Data.customerName}
                      onChange={handleStep1Change}
                      placeholder=""
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID
                    </label>
                    <input
                      type="email"
                      name="emailId"
                      value={step1Data.emailId}
                      onChange={handleStep1Change}
                      placeholder=""
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer ID
                    </label>
                    <input
                      type="text"
                      name="customerId"
                      value={step1Data.customerId}
                      onChange={handleStep1Change}
                      placeholder=""
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Address
                    </label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={step1Data.billingAddress}
                      onChange={handleStep1Change}
                      placeholder=""
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                /* Step 2: Account Details */
                <div className="space-y-4">
                  {/* Display Step 1 Data */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Customer Name
                        </label>
                        <div className="text-sm text-gray-900">{step1Data.customerName}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Email ID
                        </label>
                        <div className="text-sm text-gray-900">{step1Data.emailId}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Customer ID
                        </label>
                        <div className="text-sm text-gray-900">{step1Data.customerId}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Billing Address
                        </label>
                        <div className="text-sm text-gray-900">{step1Data.billingAddress}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={step2Data.currency}
                      onChange={handleStep2Change}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="USD - United States dollar">USD - United States dollar</option>
                      <option value="EUR - Euro">EUR - Euro</option>
                      <option value="GBP - British Pound">GBP - British Pound</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Account level currency cannot be changed once set
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={step2Data.accountName}
                      onChange={handleStep2Change}
                      placeholder=""
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account ID
                    </label>
                    <input
                      type="text"
                      name="accountId"
                      value={step2Data.accountId}
                      onChange={handleStep2Change}
                      placeholder=""
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Alias
                    </label>
                    {step2Data.aliases.map((alias, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={alias}
                          onChange={(e) => handleAliasChange(index, e.target.value)}
                          placeholder=""
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleRemoveAlias(index)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          type="button"
                        >
                          <X className="w-5 h-5" />
                        </button>
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

                  {/* Info Message */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      A default account needs to be created for every customer. We've prefilled the following details, you can change them if required.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              {currentStep === 1 ? (
                <button
                  onClick={handleProceedToStep2}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Proceed
                </button>
              ) : (
                <button
                  onClick={handleCreateCustomer}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Customer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
