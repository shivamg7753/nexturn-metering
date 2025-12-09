import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';
import { Plus, Check, Trash2, Search, Tag } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { api } from '../api/client';
import toast, { Toaster } from 'react-hot-toast';

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

export const Plans = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('recurring');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_desc');

  const handleEdit = (plan) => {
    navigate(`/plans/edit/${plan.id}`);
  };

  const handleCreate = () => {
    navigate('/plans/new');
  };

  const handleDelete = async (plan, e) => {
    e.stopPropagation();

    // Check if plan is associated with a product
    if (plan.productId) {
      const product = state.products?.find(p => p.id === plan.productId);
      const productName = product?.name || 'a product';

      toast.error(
        `Cannot delete this plan. It is associated with ${productName}. Please remove the product association first.`,
        { duration: 5000 }
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
      try {
        await api.deletePlan(plan.id);
        dispatch({ type: 'DELETE_PLAN', payload: plan.id });
        toast.success('Plan deleted successfully');
      } catch (error) {
        console.error('Failed to delete plan:', error);
        dispatch({ type: 'DELETE_PLAN', payload: plan.id });
        toast.error('Failed to delete plan');
      }
    }
  };

  const filteredPlans = state.plans
    .filter(plan => {
      const matchesTab = activeTab === 'recurring'
        ? (plan.type === 'recurring' || plan.interval)
        : (plan.type === 'one_time' || !plan.interval);
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'updated_desc') return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Price Plans</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Price Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('recurring')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'recurring'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Recurring Plans
          </button>
          <button
            onClick={() => setActiveTab('one_time')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'one_time'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            One-Time Plans
          </button>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="updated_desc">Updated At Descending</option>
            <option value="name_asc">Name Ascending</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {filteredPlans.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 h-[400px]">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Pricing Plan Found</h3>
            <p className="text-gray-500 mb-6 text-sm">Create a new plan to get started</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Price Plan
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Name
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Cycle
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Currencies
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Last Updated
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">
                Actions
              </div>
            </div>

            {/* Table Rows */}
            {filteredPlans.map(plan => {
              const lastUpdated = plan.updatedAt || plan.createdAt;
              const timeAgo = lastUpdated ? getTimeAgo(new Date(lastUpdated)) : 'N/A';

              return (
                <div
                  key={plan.id}
                  onClick={() => navigate(`/plans/${plan.id}`)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer items-center"
                >
                  {/* Name Column */}
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                      {plan.name}
                    </p>
                  </div>

                  {/* Status Column */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${plan.status === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${plan.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      {plan.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  {/* Cycle Column */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700 capitalize">
                      {plan.type === 'one_time' ? 'One-time' : plan.interval || 'Monthly'}
                    </p>
                  </div>

                  {/* Currencies Column */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {plan.currency || 'USD'}
                    </span>
                  </div>

                  {/* Last Updated Column */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">
                      {timeAgo}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(plan);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit plan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDelete(plan, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


