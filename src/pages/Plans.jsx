import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';

import { Plus, Check, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { api } from '../api/client';

export const Plans = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleEdit = (plan) => {
    navigate(`/plans/edit/${plan.id}`);
  };

  const handleCreate = () => {
    navigate('/plans/new');
  };

  const handleDelete = async (plan, e) => {
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
      try {
        await api.deletePlan(plan.id);
        dispatch({ type: 'DELETE_PLAN', payload: plan.id });
      } catch (error) {
        console.error('Failed to delete plan:', error);
        // Still remove from state even if API fails
        dispatch({ type: 'DELETE_PLAN', payload: plan.id });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
          <p className="text-gray-500 mt-1">Configure subscription plans and pricing models</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.plans.map(plan => (
          <div
            key={plan.id}
            onClick={() => navigate(`/plans/${plan.id}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(plan.amountCents, plan.currency)}
                  </p>
                  <p className="text-xs text-gray-500 uppercase">/{plan.interval}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6 min-h-[40px]">
                {plan.description || 'No description provided.'}
              </p>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>{plan.charges.length} Billable Charges</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>{plan.payInAdvance ? 'Paid in Advance' : 'Paid in Arrears'}</span>
                </div>
                {plan.trialPeriod > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>{plan.trialPeriod}-day Free Trial</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(plan);
                }}
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Edit Plan
              </button>
              <button
                onClick={(e) => handleDelete(plan, e)}
                className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


