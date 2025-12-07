import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';

import { ArrowLeft, DollarSign, Activity, Gift, Users, Shield, Copy } from 'lucide-react';
import { api } from '../api/client';
import { generateId } from '../lib/utils';

export const PlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [plan, setPlan] = useState(undefined);

  useEffect(() => {
    if (id) {
      const foundPlan = state.plans.find(p => p.id === id);
      setPlan(foundPlan);
    }
  }, [id, state.plans]);

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Plan not found</p>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    const updatedPlan = { ...plan, status: newStatus };

    try {
      await api.updatePlan(updatedPlan);
      dispatch({ type: 'UPDATE_PLAN', payload: updatedPlan });
      setPlan(updatedPlan);
    } catch (error) {
      console.error('Failed to update plan status:', error);
    }
  };

  const handleClone = () => {
    // Clone charges with new IDs (handle undefined/null charges)
    const clonedCharges = (plan.charges || []).map(charge => ({
      ...charge,
      id: generateId('chg_'),
    }));

    const clonedPlan = {
      ...plan,
      id: generateId('plan_'),
      name: `${plan.name} (Copy)`,
      charges: clonedCharges,
      status: 'draft', // Set cloned plans to draft by default
      createdAt: new Date().toISOString(),
    };

    api.createPlan(clonedPlan).then(savedPlan => {
      dispatch({ type: 'ADD_PLAN', payload: savedPlan });
      // Navigate to the cloned plan's detail page
      navigate(`/plans/${savedPlan.id}`);
    }).catch(err => {
      console.error('Failed to clone plan:', err);
      dispatch({ type: 'ADD_PLAN', payload: clonedPlan });
      navigate(`/plans/${clonedPlan.id}`);
    });
  };

  const getRateCardIcon = (type) => {
    switch (type) {
      case 'fixed': return DollarSign;
      case 'usage': return Activity;
      case 'credit': return Gift;
      case 'license': return Users;
      case 'entitlement': return Shield;
      default: return Activity;
    }
  };

  const getChargeTag = (charge) => {
    if (charge.properties?.invoiceAssociation) {
      return charge.properties.invoiceAssociation === 'arrears' ? 'In Arrears' : 'In Advance';
    }
    return '-';
  };

  const getChargePrice = (charge) => {
    if (charge.amountCents !== undefined) {
      return `USD ${charge.amountCents}`;
    }
    if (charge.tiers && charge.tiers.length > 0) {
      const firstTier = charge.tiers[0];
      return `USD ${firstTier.unitAmountCents || 0}`;
    }
    return 'USD 0';
  };

  const typeColors = {
    fixed: 'bg-blue-50 text-blue-700 border-blue-200',
    usage: 'bg-purple-50 text-purple-700 border-purple-200',
    license: 'bg-orange-50 text-orange-700 border-orange-200',
    credit: 'bg-green-50 text-green-700 border-green-200',
    entitlement: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const getTypeName = (type) => {
    const names = {
      fixed: 'Fixed Fee',
      usage: 'Usage Based',
      license: 'Licensed',
      credit: 'Credit',
      entitlement: 'Entitlement',
    };
    return names[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {plan.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Recurring
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 uppercase mb-1">Toggle Status</span>
                  <button
                    onClick={handleToggleStatus}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${plan.status === 'active' ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${plan.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/plans/edit/${plan.id}`)}
                  disabled={plan.status === 'active'}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${plan.status === 'active'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  title={plan.status === 'active' ? 'Deactivate plan to edit' : ''}
                >
                  Edit Plan
                </button>

                <button
                  onClick={handleClone}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Clone Price Plan
                </button>
              </div>
            </div>
          </div>

          {/* Rate Cards Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Rate Cards</h2>
            </div>

            {plan.charges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No rate cards added to this plan</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Tag</div>
                  <div className="col-span-3 text-right">Price</div>
                </div>

                {/* Table Rows */}
                {plan.charges.map((charge, idx) => {
                  const Icon = getRateCardIcon(charge.type);

                  return (
                    <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors items-center">
                      {/* Name Column */}
                      <div className="col-span-5">
                        <p className="text-sm font-medium text-gray-900">{charge.name || 'Unnamed'}</p>
                      </div>

                      {/* Type Column */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[charge.type] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {getTypeName(charge.type)}
                        </span>
                      </div>

                      {/* Tag Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600">{getChargeTag(charge)}</span>
                      </div>

                      {/* Price Column */}
                      <div className="col-span-3 text-right">
                        <p className="text-sm font-medium text-gray-900">{getChargePrice(charge)}</p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">
                  Price Plan ID
                </label>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                    {plan.id}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(plan.id)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copy ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">
                  Pricing Cycle
                </label>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {plan.interval}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">
                  Pricing Cycle Start Date
                </label>
                <p className="text-sm font-medium text-gray-900">
                  1st of Every Month
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">
                  Grace Period
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {plan.trialPeriod} Days
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">
                  Account Overrides
                </label>
                <p className="text-sm font-medium text-gray-900">
                  0
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">
                  Usage Meters
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {plan.charges.filter(c => c.type === 'usage').length}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
              <p className="text-xs text-gray-500">
                Created {new Date(plan.createdAt).toUTCString()}
              </p>
              <p className="text-xs text-gray-500">
                Last Updated 1 second ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


