import React, { useState } from 'react';
import { Plus, Search, Edit2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useApp } from '../context/store';
import { api } from '../api/client';

export function AddOns() {
  const { state, dispatch } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  // Form State
  const [editingAddOn, setEditingAddOn] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('fixed_fee');
  const [creditAmountCents, setCreditAmountCents] = useState(0);

  const handleEdit = (addOn) => {
    setEditingAddOn(addOn);
    setName(addOn.name);
    setType(addOn.type);
    setCreditAmountCents(addOn.creditAmountCents || 0);
    setIsCreating(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingAddOn ? 'Updating add-on...' : 'Creating add-on...');
    try {
      if (editingAddOn) {
        const updatedAddOn = await api.updateAddOn({
          id: editingAddOn.id,
          name,
          type,
          creditAmountCents: type === 'credit' ? creditAmountCents : undefined,
        });

        dispatch({ type: 'UPDATE_ADDON', payload: updatedAddOn });
        toast.success('Add-on updated successfully!', {
          id: loadingToast,
          position: 'top-right',
          style: {
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0'
          },
          iconTheme: {
            primary: '#059669',
            secondary: '#ecfdf5',
          }
        });
      } else {
        const newAddOn = await api.createAddOn({
          name,
          type,
          creditAmountCents: type === 'credit' ? creditAmountCents : undefined,
        });

        dispatch({ type: 'ADD_ADDON', payload: newAddOn });
        toast.success('Add-on created successfully!', {
          id: loadingToast,
          position: 'top-right',
          style: {
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0'
          },
          iconTheme: {
            primary: '#059669',
            secondary: '#ecfdf5',
          }
        });
      }

      setIsCreating(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(editingAddOn ? 'Failed to update add-on' : 'Failed to create add-on', { id: loadingToast });
    }
  };

  function resetForm() {
    setEditingAddOn(null);
    setName('');
    setType('fixed_fee');
    setCreditAmountCents(0);
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const filteredAddOns = state.addOns
    .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'created_desc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      <Toaster />
      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="name_asc">Name Ascending</option>
            <option value="name_desc">Name Descending</option>
            <option value="created_desc">Recently Created</option>
          </select>

          <button
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Add-On
          </button>
        </div>
      </div>

      {/* Add-Ons Table */}
      {filteredAddOns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No add-ons found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first add-on to get started</p>
          <div className="mt-6">
            <button
              onClick={() => { resetForm(); setIsCreating(true); }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Add-On
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Add-On Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Created At</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAddOns.map((addOn) => (
                <tr key={addOn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-cyan-600 text-base">{addOn.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{addOn.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded ${addOn.type === 'license' || addOn.type === 'Licensed'
                      ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                      : addOn.type === 'fixed_fee' || addOn.type === 'Fixed'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                      {addOn.type === 'fixed_fee' ? 'Fixed' :
                        addOn.type === 'license' ? 'Licensed' :
                          addOn.type === 'credit' ? 'Credit' : addOn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{formatTimeAgo(addOn.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(addOn)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Add-On"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen w-4 h-4 text-gray-600" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingAddOn ? 'Edit Add-On' : 'New Add-On'}</h2>
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
                  onClick={() => { setIsCreating(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingAddOn ? 'Update Add-On' : 'Create Add-On'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
