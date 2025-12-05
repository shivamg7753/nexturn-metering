import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, DollarSign, CreditCard } from 'lucide-react';
import { useApp } from '../context/store';
import { api } from '../api/client';


export function AddOns() {
  const { state, dispatch } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('fixed_fee');
  const [creditAmountCents, setCreditAmountCents] = useState(0);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newAddOn = await api.createAddOn({
        name,
        type,
        creditAmountCents: type === 'credit' ? creditAmountCents : undefined,
      });

      dispatch({ type: 'ADD_ADDON', payload: newAddOn });
      setIsCreating(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to create Add-On');
    }
  };

  function resetForm() {
    setName('');
    setType('fixed_fee');
    setCreditAmountCents(0);
  }

  const filteredAddOns = state.addOns.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search add-ons..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Add-On
        </button>
      </div>

      {filteredAddOns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No add-ons found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new add-on.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Add-On
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAddOns.map((addOn) => (
            <div key={addOn.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{addOn.name}</h3>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${addOn.type === 'fixed_fee' ? 'bg-green-100 text-green-800' :
                  addOn.type === 'credit' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                  {addOn.type === 'fixed_fee' ? 'Fixed Fee' : addOn.type === 'credit' ? 'Credit' : 'License'}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">

                {addOn.type === 'credit' && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                    ${(addOn.creditAmountCents || 0) / 100} Credit
                  </div>
                )}
                {addOn.type === 'license' && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Tag className="h-4 w-4 mr-2 text-gray-400" />
                    License
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">New Add-On</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Add-On Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="fixed_fee">Fixed Fee</option>
                  <option value="credit">Credit</option>
                  <option value="license">License</option>
                </select>
              </div>





              {type === 'credit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credit Amount (Cents)</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={creditAmountCents}
                    onChange={(e) => setCreditAmountCents(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Add-On
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

