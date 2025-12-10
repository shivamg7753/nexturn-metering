import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../../context/store';
import { api } from '../../../api/client';
import { generateId } from '../../../lib/utils';
import { X, Plus, ChevronRight, DollarSign, Activity, Gift, Users, Shield, Edit2, Copy, Trash2, MoreVertical } from 'lucide-react';



const getChargePrice = (charge) => {
  if (charge.amountCents !== undefined) {
    return `USD ${charge.amountCents}`;
  }
  if (charge.tiers && charge.tiers.length > 0) {
    const firstTier = charge.tiers[0];
    if (firstTier.type === 'package') {
      return `USD ${firstTier.unitAmountCents || 0}`;
    }
    if (charge.chargeModel === 'tiered' || charge.chargeModel === 'volume') {
      return `Flat for first ${firstTier.lastUnit || '∞'}`;
    }
    return `USD ${firstTier.unitAmountCents || 0}`;
  }
  return 'USD 0';
};

const getChargeSubtext = (charge) => {
  if (charge.type === 'license' && charge.properties?.addonName) {
    return `Flat licenses`;
  }
  if (charge.type === 'usage' && charge.tiers && charge.tiers.length > 0) {
    const firstTier = charge.tiers[0];
    if (firstTier.lastUnit) {
      return `Flat for first ${firstTier.lastUnit}`;
    }
  }
  return '';
};

export const PlanForm = ({ onClose, initialData }) => {
  const { dispatch, state } = useApp();
  const [currentStep, setCurrentStep] = useState('billing');
  const [showRateCardMenu, setShowRateCardMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [editingChargeIndex, setEditingChargeIndex] = useState(null);
  const [editingCharge, setEditingCharge] = useState(null);

  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    type: 'recurring',
    interval: 'monthly',
    intervalCount: 1,
    amountCents: 0,
    currency: 'USD',
    payInAdvance: true,
    trialPeriod: 0,
    charges: [],
  });

  // Fetch features on mount if not already in state
  useEffect(() => {
    if (!state.features || state.features.length === 0) {
      api.getFeatures().then(features => {
        dispatch({ type: 'SET_FEATURES', payload: features });
      }).catch(err => {
        console.error('Failed to fetch features:', err);
      });
    }
  }, []);

  const handleSubmit = (status = 'active') => {
    const plan = {
      id: initialData?.id || generateId('plan_'),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      interval: formData.interval,
      intervalCount: Number(formData.intervalCount),
      amountCents: Number(formData.amountCents),
      currency: formData.currency,
      payInAdvance: formData.payInAdvance,
      trialPeriod: Number(formData.trialPeriod),
      charges: formData.charges || [],
      status,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData) {
      api.updatePlan(plan).then(updatedPlan => {
        dispatch({ type: 'UPDATE_PLAN', payload: updatedPlan });
      }).catch(err => {
        console.error("Failed to update plan", err);
      });
    } else {
      api.createPlan(plan).then(savedPlan => {
        dispatch({ type: 'ADD_PLAN', payload: savedPlan });
      }).catch(err => {
        console.error("Failed to save plan", err);
        dispatch({ type: 'ADD_PLAN', payload: plan });
      });
    }
    onClose();
  };

  const addRateCard = (charge) => {
    if (editingChargeIndex !== null) {
      // Update existing charge
      const newCharges = [...(formData.charges || [])];
      newCharges[editingChargeIndex] = charge;
      setFormData({ ...formData, charges: newCharges });
      setEditingChargeIndex(null);
      setEditingCharge(null);
    } else {
      // Add new charge
      setFormData({ ...formData, charges: [...(formData.charges || []), charge] });
    }
    setActiveModal(null);
  };

  const removeRateCard = (index) => {
    const newCharges = formData.charges?.filter((_, i) => i !== index);
    setFormData({ ...formData, charges: newCharges });
  };

  const cloneRateCard = (index) => {
    const chargeToClone = formData.charges?.[index];
    if (chargeToClone) {
      const clonedCharge = {
        ...chargeToClone,
        id: generateId('chg_'),
        name: `${chargeToClone.name} (Copy)`,
      };
      setFormData({ ...formData, charges: [...(formData.charges || []), clonedCharge] });
    }
  };

  const editRateCard = (index) => {
    const chargeToEdit = formData.charges?.[index];
    if (chargeToEdit) {
      setEditingChargeIndex(index);
      setEditingCharge(chargeToEdit);
      setActiveModal(chargeToEdit.type);
    }
  };

  const getRateCardIcon = (type) => {
    switch (type) {
      case 'fixed': return DollarSign;
      case 'usage': return Activity;
      case 'credit': return Gift;
      case 'license': return Users;
      case 'entitlement': return Shield;
    }
  };

  const getRateCardLabel = (charge) => {
    switch (charge.type) {
      case 'fixed': return `Fixed Fee: ${charge.name || 'Unnamed'}`;
      case 'usage': {
        const metric = state.billableMetrics?.find(m => m.id === charge.billableMetricId);
        return `Usage: ${metric?.name || 'Unknown Metric'}`;
      }
      case 'credit': return `Credit: ${charge.name || 'Unnamed'}`;
      case 'license': return `License: ${charge.name || 'Unnamed'}`;
      case 'entitlement': {
        const feature = state.features?.find(f => f.id === charge.featureId);
        return `Entitlement: ${feature?.name || 'Unknown Feature'}`;
      }
    }
  };

  const getIntervalLabel = () => {
    if (formData.type === 'one_time') return 'one-time';
    const count = formData.intervalCount || 1;
    const interval = formData.interval || 'monthly';

    if (count === 1) {
      return `/${interval.replace('_', ' ')}`;
    }
    return ` every ${count} ${interval.replace('ly', 's').replace('_', ' ')}`;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {initialData ? 'Edit Plan' : 'Create New Price Plan'}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setCurrentStep('billing')}
                className={`flex items-center gap-2 text-sm ${currentStep === 'billing' ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === 'billing' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</span>
                Billing Details
              </button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => setCurrentStep('ratecards')}
                className={`flex items-center gap-2 text-sm ${currentStep === 'ratecards' ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === 'ratecards' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</span>
                Add Rate Cards
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="grid grid-cols-3">
            {/* Main Form Area */}
            <div className="col-span-2 p-6 border-r border-gray-100">
              {currentStep === 'billing' && (
                <BillingDetailsStep formData={formData} setFormData={setFormData} />
              )}
              {currentStep === 'ratecards' && (
                <RateCardsStep
                  charges={formData.charges || []}
                  onAddClick={() => setShowRateCardMenu(!showRateCardMenu)}
                  onRemove={removeRateCard}
                  onClone={cloneRateCard}
                  onEdit={editRateCard}
                  getRateCardLabel={getRateCardLabel}
                  getRateCardIcon={getRateCardIcon}
                  showMenu={showRateCardMenu}
                  onMenuSelect={(type) => {
                    setEditingChargeIndex(null);
                    setEditingCharge(null);
                    setActiveModal(type);
                    setShowRateCardMenu(false);
                  }}
                />
              )}
            </div>

            {/* Preview Pane */}
            <div className="col-span-1 bg-gray-50 p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">PREVIEW</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                {/* Plan Name */}
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  {formData.name || 'Plan Name'}
                </h4>

                {/* Currency Badge */}
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {formData.currency || 'USD'}
                  </span>
                </div>

                {/* Billing Cycle */}
                <p className="text-sm text-gray-600 mb-4">
                  {formData.type === 'one_time'
                    ? 'One-time'
                    : `Recurring: ${formData.interval ? formData.interval.charAt(0).toUpperCase() + formData.interval.slice(1) : 'Monthly'}`
                  }
                </p>

                {/* Currency Dropdown */}
                <div className="mb-4">
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                {/* LINE ITEMS Section */}
                {formData.charges && formData.charges.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">LINE ITEMS</p>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PRICE</p>
                    </div>
                    <div className="space-y-3">
                      {formData.charges.map((charge, idx) => {
                        const price = getChargePrice(charge);
                        const subtext = getChargeSubtext(charge);

                        return (
                          <div key={idx} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {charge.name || getRateCardLabel(charge)}
                                </p>
                                {subtext && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {subtext}
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-sm font-semibold text-gray-900">
                                  {price}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State for Line Items */}
                {(!formData.charges || formData.charges.length === 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">LINE ITEMS</p>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PRICE</p>
                    </div>
                    <p className="text-sm text-gray-400 text-center py-4">No rate cards added</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {currentStep === 'ratecards' && (
              <button
                onClick={() => setCurrentStep('billing')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {currentStep === 'billing' && (
              <button
                onClick={() => setCurrentStep('ratecards')}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Next: Rate Cards
              </button>
            )}
            {currentStep === 'ratecards' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('active')}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  {initialData ? 'Save Changes' : 'Publish Plan'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rate Card Modals */}
      {activeModal === 'fixed' && <FixedFeeModal onClose={() => { setActiveModal(null); setEditingChargeIndex(null); setEditingCharge(null); }} onSave={addRateCard} addOns={state.addOns || []} initialData={editingCharge || undefined} />}
      {activeModal === 'usage' && <UsageFeeModal onClose={() => { setActiveModal(null); setEditingChargeIndex(null); setEditingCharge(null); }} onSave={addRateCard} metrics={state.billableMetrics || []} initialData={editingCharge || undefined} />}
      {activeModal === 'credit' && <CreditModal onClose={() => { setActiveModal(null); setEditingChargeIndex(null); setEditingCharge(null); }} onSave={addRateCard} initialData={editingCharge || undefined} />}
      {activeModal === 'license' && <LicenseFeeModal onClose={() => { setActiveModal(null); setEditingChargeIndex(null); setEditingCharge(null); }} onSave={addRateCard} addOns={state.addOns || []} initialData={editingCharge || undefined} />}
      {activeModal === 'entitlement' && <EntitlementModal onClose={() => { setActiveModal(null); setEditingChargeIndex(null); setEditingCharge(null); }} onSave={addRateCard} features={state.features || []} initialData={editingCharge || undefined} />}
    </div>
  );
};

// Billing Details Step Component
const BillingDetailsStep = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4">BILLING DETAILS</h3>
      <p className="text-sm text-gray-500 mb-6">Define the basic information for your pricing plan.</p>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. Pro Plan"
        />
      </div>



      <div className="col-span-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Plan Type</label>
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${formData.type === 'recurring' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="planType"
                value="recurring"
                checked={formData.type === 'recurring'}
                onChange={() => setFormData({ ...formData, type: 'recurring' })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Recurring</span>
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${formData.type === 'one_time' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="planType"
                value="one_time"
                checked={formData.type === 'one_time'}
                onChange={() => setFormData({ ...formData, type: 'one_time' })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">One-Time</span>
            </label>
          </div>
        </div>

        {formData.type === 'recurring' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle(s)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'quarterly', label: 'Quarterly' },
                { id: 'half_yearly', label: 'Half Yearly' },
                { id: 'yearly', label: 'Annually' },
              ].map((cycle) => (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, interval: cycle.id })}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${formData.interval === cycle.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {cycle.label}
                </button>
              ))}
            </div>

            <div className="w-24">
              <select
                value={formData.intervalCount || 1}
                onChange={e => setFormData({ ...formData, intervalCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="Add a description for this plan..."
        />
      </div>



      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
        <select
          value={formData.currency}
          onChange={e => setFormData({ ...formData, currency: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (Days)</label>
        <input
          type="number"
          min="0"
          value={formData.trialPeriod}
          onChange={e => setFormData({ ...formData, trialPeriod: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

    </div>
  </div>
);

// Dropdown Menu Component using Portal
const DropdownMenu = ({ buttonRef, isOpen, onClose, onEdit, onClone, onRemove }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 132;
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let top = buttonRect.bottom + window.scrollY;

      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        top = buttonRect.top + window.scrollY - menuHeight;
      }

      setPosition({
        top,
        left: buttonRect.right + window.scrollX - 160
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button onClick={() => { onEdit(); onClose(); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
        <Edit2 className="w-4 h-4" />
        Edit
      </button>
      <button onClick={() => { onClone(); onClose(); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
        <Copy className="w-4 h-4" />
        Clone
      </button>
      <button onClick={() => { onRemove(); onClose(); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>,
    document.body
  );
};

// Rate Cards Step Component
const RateCardsStep = ({ charges, onAddClick, onRemove, onClone, onEdit, getRateCardLabel, getRateCardIcon, showMenu, onMenuSelect }) => {
  const [openMenuIndex, setOpenMenuIndex] = React.useState(null);
  const buttonRefs = React.useRef([]);

  const getChargeTag = (charge) => {
    if (charge.properties?.invoiceAssociation) {
      return charge.properties.invoiceAssociation === 'arrears' ? 'In Arrears' : 'In Advance';
    }
    return '-';
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">RATE CARDS</h3>
          <p className="text-sm text-gray-500 mt-1">Add different types of charges to this plan.</p>
        </div>
        <div className="relative">
          <button
            onClick={onAddClick}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rate Card
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button onClick={() => onMenuSelect('fixed')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Fixed Fee
              </button>
              <button onClick={() => onMenuSelect('usage')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                <Activity className="w-4 h-4 text-gray-400" />
                Usage Based Fee
              </button>
              <button onClick={() => onMenuSelect('credit')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                <Gift className="w-4 h-4 text-gray-400" />
                Credit Grant Fee
              </button>
              <button onClick={() => onMenuSelect('license')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-400" />
                License Fee
              </button>
              <button onClick={() => onMenuSelect('entitlement')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-400" />
                Entitlement Fee
              </button>
            </div>
          )}
        </div>
      </div>

      {charges.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No rate cards added yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Rate Card" to get started</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Tag</div>
            <div className="col-span-3 text-right">Price</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Rows */}
          {charges.map((charge, idx) => {
            const Icon = getRateCardIcon(charge.type);
            const typeColors = {
              fixed: 'bg-blue-50 text-blue-700 border-blue-200',
              usage: 'bg-purple-50 text-purple-700 border-purple-200',
              license: 'bg-orange-50 text-orange-700 border-orange-200',
              credit: 'bg-green-50 text-green-700 border-green-200',
              entitlement: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            };

            return (
              <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors items-center">
                {/* Name Column */}
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-900">{charge.name || getRateCardLabel(charge)}</p>
                  {getChargeSubtext(charge) && (
                    <p className="text-xs text-gray-500 mt-0.5">{getChargeSubtext(charge)}</p>
                  )}
                </div>

                {/* Type Column */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[charge.type] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {charge.type === 'fixed' ? 'Fixed Fee' : charge.type === 'usage' ? 'Usage Based' : charge.type === 'license' ? 'Licensed' : charge.type === 'credit' ? 'Credit' : 'Entitlement'}
                  </span>
                </div>

                {/* Tag Column */}
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">{getChargeTag(charge)}</span>
                </div>

                {/* Price Column */}
                <div className="col-span-3 text-right">
                  <p className="text-sm font-medium text-gray-900">{getChargePrice(charge)}</p>
                  {getChargeSubtext(charge) && charge.type === 'usage' && (
                    <p className="text-xs text-gray-500 mt-0.5">{getChargeSubtext(charge)}</p>
                  )}
                </div>

                {/* Actions Column */}
                <div className="col-span-1 flex justify-end">
                  <button
                    ref={el => buttonRefs.current[idx] = el}
                    onClick={() => setOpenMenuIndex(openMenuIndex === idx ? null : idx)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-100 transition-colors"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <DropdownMenu
                    buttonRef={{ current: buttonRefs.current[idx] }}
                    isOpen={openMenuIndex === idx}
                    onClose={() => setOpenMenuIndex(null)}
                    onEdit={() => onEdit(idx)}
                    onClone={() => onClone(idx)}
                    onRemove={() => onRemove(idx)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Reusable Standard Modal Component (Single Screen)
const StandardModal = ({ title, children, onClose, onSave, saveLabel = "Submit" }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  </div>
);

// Reusable Wizard Modal Component
const WizardModal = ({ title, children, onClose, onSave, currentStep, totalSteps, onNext, onBack }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-2 text-sm ${currentStep === 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</span>
              Configure Rate Card
            </div>
            <div className="w-8 h-px bg-gray-200" />
            <div className={`flex items-center gap-2 text-sm ${currentStep === 2 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</span>
              Add Price
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        {currentStep > 1 && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
        )}
        {currentStep < totalSteps ? (
          <button
            onClick={onNext}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Proceed
          </button>
        ) : (
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Add Rate Card
          </button>
        )}
      </div>
    </div>
  </div>
);

// Fixed Fee Modal
const FixedFeeModal = ({ onClose, onSave, addOns, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [addonId, setAddonId] = useState(initialData?.properties?.addonId || '');
  const [addonName, setAddonName] = useState(initialData?.properties?.addonName || '');
  const [amountCents, setAmountCents] = useState(initialData?.amountCents || 0);
  const [type, setType] = useState((initialData?.recurring ? 'recurring' : 'one_time'));
  const [invoiceAssociation, setInvoiceAssociation] = useState(initialData?.properties?.invoiceAssociation || 'arrears');
  const [proration, setProration] = useState(initialData?.properties?.proration || false);
  const [recurrenceInterval, setRecurrenceInterval] = useState(initialData?.properties?.recurrenceInterval || 1);
  const [recurrenceOffset, setRecurrenceOffset] = useState(initialData?.properties?.recurrenceOffset || 0);
  const [groupBy, setGroupBy] = useState(initialData?.properties?.groupBy || '');
  const [availableDimensions, setAvailableDimensions] = useState([]);

  // Fetch all schemas and extract dimensions on mount
  React.useEffect(() => {
    const fetchDimensions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/schemas');
        const schemas = await response.json();

        const allDimensions = new Set();
        schemas.forEach((schema) => {
          if (schema.dimensions) {
            const parsedDimensions = typeof schema.dimensions === 'string'
              ? JSON.parse(schema.dimensions)
              : schema.dimensions;

            const dimensionNames = parsedDimensions.dimensions?.filter((d) => d) || [];
            dimensionNames.forEach((dim) => allDimensions.add(dim));
          }
        });

        setAvailableDimensions(Array.from(allDimensions));
      } catch (error) {
        console.error('Error fetching schema dimensions:', error);
        setAvailableDimensions([]);
      }
    };

    fetchDimensions();
  }, []);

  const handleSave = () => {
    onSave({
      id: initialData?.id || generateId('chg_'),
      type: 'fixed',
      name,
      amountCents,
      recurring: type === 'recurring',
      properties: {
        addonId,
        addonName,
        invoiceAssociation,
        proration,
        recurrenceInterval,
        recurrenceOffset,
        groupBy
      },
      invoiceable: true,
    });
  };

  return (
    <StandardModal
      title={initialData ? "Edit Fixed Fee Rate Card" : "Add Fixed Fee Rate Card"}
      onClose={onClose}
      onSave={handleSave}
      saveLabel="Submit"
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate Card Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Subscription Fee"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Addon</label>
          <select
            value={addonId}
            onChange={e => {
              setAddonId(e.target.value);
              const selectedAddon = addOns.find(a => a.id === e.target.value);
              if (selectedAddon) {
                setAddonName(selectedAddon.name);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Addon...</option>
            {addOns.map(addon => (
              <option key={addon.id} value={addon.id}>{addon.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Association</label>
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${invoiceAssociation === 'arrears' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="fixedInvoiceAssociation"
                value="arrears"
                checked={invoiceAssociation === 'arrears'}
                onChange={() => setInvoiceAssociation('arrears')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">In Arrears</span>
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${invoiceAssociation === 'advance' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="fixedInvoiceAssociation"
                value="advance"
                checked={invoiceAssociation === 'advance'}
                onChange={() => setInvoiceAssociation('advance')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">In Advance</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">Fixed Fee will be applied to the {invoiceAssociation === 'arrears' ? 'previous' : 'current'} invoice.</p>
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700">Proration of Fixed Fee</label>
            <p className="text-xs text-gray-500 mt-0.5">Users will have to pay only for number of days they are on the plan rather than entire pricing cycle.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={proration} onChange={e => setProration(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Fee Type</label>
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${type === 'one_time' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="fixedFeeType"
                value="one_time"
                checked={type === 'one_time'}
                onChange={() => setType('one_time')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">One Time</span>
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${type === 'recurring' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="fixedFeeType"
                value="recurring"
                checked={type === 'recurring'}
                onChange={() => setType('recurring')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Recurring</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Interval</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={recurrenceInterval}
                onChange={e => setRecurrenceInterval(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                disabled={type !== 'recurring'}
              />
              <div className="flex gap-1">
                <button disabled={type !== 'recurring'} onClick={() => setRecurrenceInterval(prev => Math.max(1, prev - 1))} className="p-2 text-gray-400 hover:text-gray-600 border rounded hover:bg-gray-50 disabled:opacity-50">
                  -
                </button>
                <button disabled={type !== 'recurring'} onClick={() => setRecurrenceInterval(prev => prev + 1)} className="p-2 text-gray-400 hover:text-gray-600 border rounded hover:bg-gray-50 disabled:opacity-50">
                  +
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Offset</label>
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <input
                  type="text"
                  value={`Recurrence ${recurrenceOffset}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  disabled={type !== 'recurring'}
                />
              </div>
              <div className="flex gap-1">
                <button disabled={type !== 'recurring'} onClick={() => setRecurrenceOffset(prev => Math.max(0, prev - 1))} className="p-2 text-gray-400 hover:text-gray-600 border rounded hover:bg-gray-50 disabled:opacity-50">
                  -
                </button>
                <button disabled={type !== 'recurring'} onClick={() => setRecurrenceOffset(prev => prev + 1)} className="p-2 text-gray-400 hover:text-gray-600 border rounded hover:bg-gray-50 disabled:opacity-50">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">USD price</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={amountCents}
              onChange={e => setAmountCents(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex gap-1">
              <button onClick={() => setAmountCents(prev => Math.max(0, prev - 1))} className="p-2 text-gray-400 hover:text-gray-600 border rounded hover:bg-gray-50">
                -
              </button>
              <button onClick={() => setAmountCents(prev => prev + 1)} className="p-2 text-gray-400 hover:text-gray-600 border rounded hover:bg-gray-50">
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            disabled={availableDimensions.length === 0}
          >
            <option value="">Group By</option>
            {availableDimensions.map(dim => (
              <option key={dim} value={dim}>{dim}</option>
            ))}
          </select>
          {availableDimensions.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              No dimensions available from schemas.
            </p>
          )}
        </div>
      </div>
    </StandardModal>
  );
};

// Usage Fee Modal
const UsageFeeModal = ({ onClose, onSave, metrics, initialData }) => {
  const { state } = useApp();
  const [step, setStep] = useState(1);
  const [metricId, setMetricId] = useState(initialData?.billableMetricId || '');
  const [metricName, setMetricName] = useState(initialData?.properties?.metricName || '');
  const [pricingModel, setPricingModel] = useState(initialData?.chargeModel || 'standard');
  const [name, setName] = useState(initialData?.name || '');
  const [tiers, setTiers] = useState(initialData?.tiers || [{ firstUnit: 0, lastUnit: null, unitAmountCents: 0, type: 'flat' }]);
  const [groupBy, setGroupBy] = useState(initialData?.properties?.groupBy || '');
  const [availableDimensions, setAvailableDimensions] = useState([]);

  const handleSave = () => {
    onSave({
      id: initialData?.id || generateId('chg_'),
      type: 'usage',
      name,
      billableMetricId: metricId,
      chargeModel: pricingModel,
      tiers: tiers.map(t => ({
        firstUnit: Number(t.firstUnit),
        lastUnit: t.lastUnit ? Number(t.lastUnit) : null,
        unitAmountCents: Number(t.unitAmountCents),
        flatFeeCents: 0,
        type: t.type,
        packageSize: t.packageSize ? Number(t.packageSize) : undefined
      })),
      properties: { groupBy, metricName },
      invoiceable: true,
    });
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    setTiers([...tiers, { firstUnit: Number(lastTier.lastUnit || 0) + 1, lastUnit: null, unitAmountCents: 0, type: 'flat' }]);
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };

    // If lastUnit changed and there is a next tier, update its firstUnit
    if (field === 'lastUnit' && index < newTiers.length - 1) {
      newTiers[index + 1] = {
        ...newTiers[index + 1],
        firstUnit: value === null ? null : (Number(value) + 1)
      };
    }

    setTiers(newTiers);
  };

  const removeTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleMetricChange = async (selectedMetricId) => {
    setMetricId(selectedMetricId);
    setGroupBy(''); // Reset group by when metric changes

    const selectedMetric = metrics.find(m => m.id === selectedMetricId);
    if (selectedMetric) {
      setMetricName(selectedMetric.name);

      // Fetch the meter from backend to get eventSchemaId
      try {
        const response = await fetch(`http://localhost:3000/api/meters`);
        const meters = await response.json();
        const meter = meters.find((m) => m.id === selectedMetricId);

        if (meter && meter.eventSchemaId) {
          // Fetch the schema to get dimensions
          const schemaResponse = await fetch(`http://localhost:3000/api/schemas`);
          const schemas = await schemaResponse.json();
          const schema = schemas.find((s) => s.id === meter.eventSchemaId);

          if (schema && schema.dimensions) {
            const parsedDimensions = typeof schema.dimensions === 'string'
              ? JSON.parse(schema.dimensions)
              : schema.dimensions;

            // Extract dimension names from the dimensions array
            const dimensionNames = parsedDimensions.dimensions?.filter((d) => d) || [];
            setAvailableDimensions(dimensionNames);
          }
        }
      } catch (error) {
        console.error('Error fetching schema dimensions:', error);
        setAvailableDimensions([]);
      }
    }
  };

  return (
    <WizardModal
      title={initialData ? "Edit Usage Based Fee Rate Card" : "Add Usage Based Fee Rate Card"}
      onClose={onClose}
      onSave={handleSave}
      currentStep={step}
      totalSteps={2}
      onNext={() => setStep(2)}
      onBack={() => setStep(1)}
    >
      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate Card Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Rate Card Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Meter</label>
            <select
              value={metricId}
              onChange={e => handleMetricChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select usage meter...</option>
              {metrics.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {metrics.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No usage meters available. Please create a billable metric first.
              </p>
            )}
          </div>

          <div>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!metricId || availableDimensions.length === 0}
            >
              <option value="">Group By</option>
              {availableDimensions.map(dim => (
                <option key={dim} value={dim}>{dim}</option>
              ))}
            </select>
            {metricId && availableDimensions.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No dimensions available for this meter.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Pricing Model</label>
            <div className="flex gap-3 mb-4">
              {['standard', 'tiered', 'volume'].map((model) => (
                <label key={model} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${pricingModel === model ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="pricingModel"
                    value={model}
                    checked={pricingModel === model}
                    onChange={() => setPricingModel(model)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="capitalize font-medium">{model}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <span className="mt-0.5">ⓘ</span>
              <span>The amount to charge varies incrementally increases, different units may be at different prices depending on the tier they fall into. We also support defining distinct pricing types for each slab.</span>
            </p>

            <div className="mt-6 space-y-3">
              {tiers.map((tier, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="pt-6">
                    <span className="text-lg font-bold text-gray-400">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">First Unit</label>
                      <input
                        type="number"
                        value={tier.firstUnit}
                        onChange={e => updateTier(idx, 'firstUnit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                        placeholder="0"
                        readOnly={idx > 0}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Last Unit</label>
                      <input
                        type="text"
                        value={tier.lastUnit === null ? '∞' : tier.lastUnit}
                        onChange={e => updateTier(idx, 'lastUnit', e.target.value === '∞' ? null : e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="∞"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Pricing type</label>
                      <select
                        value={tier.type || 'flat'}
                        onChange={e => updateTier(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="flat">Flat</option>
                        <option value="per_unit">Per Unit</option>
                        <option value="package">Package</option>
                      </select>
                    </div>

                    {tier.type === 'package' ? (
                      <>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Package Size</label>
                          <input
                            type="number"
                            value={tier.packageSize || ''}
                            onChange={e => updateTier(idx, 'packageSize', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Size"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">USD Price</label>
                          <input
                            type="number"
                            value={tier.unitAmountCents}
                            onChange={e => updateTier(idx, 'unitAmountCents', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Price"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-500 mb-1">USD Price</label>
                        <input
                          type="number"
                          value={tier.unitAmountCents}
                          onChange={e => updateTier(idx, 'unitAmountCents', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Price"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    {idx > 0 && (
                      <button onClick={() => removeTier(idx)} className="text-gray-400 hover:text-red-500 p-2">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {(pricingModel === 'tiered' || pricingModel === 'volume') && (
                <button onClick={addTier} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 mt-2">
                  <Plus className="w-4 h-4" /> Add another slab
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </WizardModal>
  );
};

// License Fee Modal
const LicenseFeeModal = ({ onClose, onSave, addOns, initialData }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialData?.name || '');
  const [addonId, setAddonId] = useState(initialData?.properties?.addonId || '');
  const [maxLicenseQuantity, setMaxLicenseQuantity] = useState(initialData?.properties?.maxLicenseQuantity || '');
  const [invoiceAssociation, setInvoiceAssociation] = useState(initialData?.properties?.invoiceAssociation || 'arrears');
  const [proration, setProration] = useState(initialData?.properties?.proration || false);
  const [pricingModel, setPricingModel] = useState(initialData?.chargeModel || 'standard');
  const [tiers, setTiers] = useState(initialData?.tiers || [{ firstUnit: 0, lastUnit: null, unitAmountCents: 0, type: 'per_unit' }]);
  const [groupBy, setGroupBy] = useState(initialData?.properties?.groupBy || '');
  const [availableDimensions, setAvailableDimensions] = useState([]);

  // Fetch all schemas and extract dimensions on mount
  React.useEffect(() => {
    const fetchDimensions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/schemas');
        const schemas = await response.json();

        const allDimensions = new Set();
        schemas.forEach((schema) => {
          if (schema.dimensions) {
            const parsedDimensions = typeof schema.dimensions === 'string'
              ? JSON.parse(schema.dimensions)
              : schema.dimensions;

            const dimensionNames = parsedDimensions.dimensions?.filter((d) => d) || [];
            dimensionNames.forEach((dim) => allDimensions.add(dim));
          }
        });

        setAvailableDimensions(Array.from(allDimensions));
      } catch (error) {
        console.error('Error fetching schema dimensions:', error);
        setAvailableDimensions([]);
      }
    };

    fetchDimensions();
  }, []);

  const handleSave = () => {
    const selectedAddon = addOns.find(a => a.id === addonId);
    onSave({
      id: initialData?.id || generateId('chg_'),
      type: 'license',
      name,
      chargeModel: pricingModel,
      tiers: tiers.map(t => ({
        firstUnit: Number(t.firstUnit),
        lastUnit: t.lastUnit ? Number(t.lastUnit) : null,
        unitAmountCents: Number(t.unitAmountCents),
        type: t.type,
        packageSize: t.packageSize ? Number(t.packageSize) : undefined
      })),
      properties: {
        addonId,
        addonName: selectedAddon?.name,
        maxLicenseQuantity: maxLicenseQuantity === '' ? null : maxLicenseQuantity,
        invoiceAssociation,
        proration,
        groupBy
      },
      invoiceable: true,
    });
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    setTiers([...tiers, { firstUnit: Number(lastTier.lastUnit || 0) + 1, lastUnit: null, unitAmountCents: 0, type: 'per_unit' }]);
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };

    // If lastUnit changed and there is a next tier, update its firstUnit
    if (field === 'lastUnit' && index < newTiers.length - 1) {
      newTiers[index + 1] = {
        ...newTiers[index + 1],
        firstUnit: value === null ? null : (Number(value) + 1)
      };
    }

    setTiers(newTiers);
  };

  const removeTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const incrementQuantity = () => {
    setMaxLicenseQuantity(prev => prev === '' ? 1 : (prev) + 1);
  };

  const decrementQuantity = () => {
    setMaxLicenseQuantity(prev => {
      if (prev === '' || prev <= 0) return '';
      return (prev) - 1;
    });
  };

  return (
    <WizardModal
      title={initialData ? "Edit License Fee Rate Card" : "Add License Fee Rate Card"}
      onClose={onClose}
      onSave={handleSave}
      currentStep={step}
      totalSteps={2}
      onNext={() => setStep(2)}
      onBack={() => setStep(1)}
    >
      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate Card Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Rate Card Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Addon name</label>
            <select
              value={addonId}
              onChange={e => setAddonId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select addon...</option>
              {addOns.filter(addon => addon.type === 'license').map(addon => (
                <option key={addon.id} value={addon.id}>{addon.name}</option>
              ))}
            </select>
            {addOns.filter(addon => addon.type === 'license').length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No license addons available. Please create a license addon first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum License Quantity</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={maxLicenseQuantity}
                onChange={e => setMaxLicenseQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Maximum License Quantity"
              />
              <button
                type="button"
                onClick={decrementQuantity}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                −
              </button>
              <button
                type="button"
                onClick={incrementQuantity}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                +
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
              <span className="text-gray-400">ⓘ</span>
              <span>Maximum number of licenses that can be purchased in the priceplan. If left blank, there will be no limit.</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Association</label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${invoiceAssociation === 'arrears' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="invoiceAssociation"
                  value="arrears"
                  checked={invoiceAssociation === 'arrears'}
                  onChange={() => setInvoiceAssociation('arrears')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium">In Arrears</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${invoiceAssociation === 'advance' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="invoiceAssociation"
                  value="advance"
                  checked={invoiceAssociation === 'advance'}
                  onChange={() => setInvoiceAssociation('advance')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium">In Advance</span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
              <span className="text-gray-400">ⓘ</span>
              <span>License fee will be billed in the current invoice.</span>
            </p>
          </div>

          <div className="flex items-center justify-between py-3 px-4 border border-gray-300 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Proration of License Fee</label>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={proration}
                onChange={e => setProration(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Pricing Model</label>
            <div className="flex gap-3 mb-4">
              {['standard', 'tiered', 'volume'].map((model) => (
                <label key={model} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${pricingModel === model ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="licensePricingModel"
                    value={model}
                    checked={pricingModel === model}
                    onChange={() => setPricingModel(model)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="capitalize font-medium">{model}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <span className="mt-0.5">ⓘ</span>
              <span>The amount to charge varies incrementally increases, different units may be at different prices depending on the tier they fall into. We also support defining distinct pricing types for each slab.</span>
            </p>

            <div className="mt-6 space-y-3">
              {tiers.map((tier, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="pt-6">
                    <span className="text-lg font-bold text-gray-400">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">First Unit</label>
                      <input
                        type="number"
                        value={tier.firstUnit}
                        onChange={e => updateTier(idx, 'firstUnit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                        placeholder="0"
                        readOnly={idx > 0}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Last Unit</label>
                      <input
                        type="text"
                        value={tier.lastUnit === null ? '∞' : tier.lastUnit}
                        onChange={e => updateTier(idx, 'lastUnit', e.target.value === '∞' ? null : e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="∞"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Pricing type</label>
                      <select
                        value={tier.type || 'per_unit'}
                        onChange={e => updateTier(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="flat">Flat</option>
                        <option value="per_unit">Per Unit</option>
                        <option value="package">Package</option>
                      </select>
                    </div>

                    {tier.type === 'package' ? (
                      <>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Package Size</label>
                          <input
                            type="number"
                            value={tier.packageSize || ''}
                            onChange={e => updateTier(idx, 'packageSize', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Size"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">USD Price</label>
                          <input
                            type="number"
                            value={tier.unitAmountCents}
                            onChange={e => updateTier(idx, 'unitAmountCents', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Price"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-500 mb-1">USD Price</label>
                        <input
                          type="number"
                          value={tier.unitAmountCents}
                          onChange={e => updateTier(idx, 'unitAmountCents', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Price"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    {idx > 0 && (
                      <button onClick={() => removeTier(idx)} className="text-gray-400 hover:text-red-500 p-2">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {(pricingModel === 'tiered' || pricingModel === 'volume') && (
                <button onClick={addTier} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 mt-2">
                  <Plus className="w-4 h-4" /> Add another slab
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={availableDimensions.length === 0}
            >
              <option value="">Select attribute...</option>
              {availableDimensions.map(dim => (
                <option key={dim} value={dim}>{dim}</option>
              ))}
            </select>
            {availableDimensions.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No dimensions available from schemas.
              </p>
            )}
          </div>
        </div>
      )}
    </WizardModal>
  );
};

// Credit Modal
const CreditModal = ({ onClose, onSave, initialData }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialData?.name || '');
  const [creditAmountCents, setCreditAmountCents] = useState(initialData?.creditAmountCents || 0);
  const [expiryDays, setExpiryDays] = useState(initialData?.creditExpiry?.value || 30);
  const [price, setPrice] = useState(initialData?.amountCents || 0);

  const handleSave = () => {
    onSave({
      id: initialData?.id || generateId('chg_'),
      type: 'credit',
      name,
      creditAmountCents,
      creditExpiry: { type: 'days', value: expiryDays },
      amountCents: price,
      invoiceable: true,
    });
  };

  return (
    <WizardModal
      title={initialData ? "Edit Credit Grant Fee Rate Card" : "Add Credit Grant Fee Rate Card"}
      onClose={onClose}
      onSave={handleSave}
      currentStep={step}
      totalSteps={2}
      onNext={() => setStep(2)}
      onBack={() => setStep(1)}
    >
      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate Card Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. Welcome Credits"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Amount (cents)</label>
            <input
              type="number"
              min="0"
              value={creditAmountCents}
              onChange={e => setCreditAmountCents(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (Days)</label>
            <input
              type="number"
              min="0"
              value={expiryDays}
              onChange={e => setExpiryDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (cents)</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Cost of this credit grant"
            />
          </div>
        </div>
      )}
    </WizardModal>
  );
};





// Entitlement Modal
const EntitlementModal = ({ onClose, onSave, features, initialData }) => {
  const [step, setStep] = useState(1);
  const [featureId, setFeatureId] = useState(initialData?.featureId || '');
  const [featureName, setFeatureName] = useState(initialData?.properties?.featureName || '');
  const [limit, setLimit] = useState(initialData?.entitlementLimit || '');
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.amountCents || 0);
  const [invoiceAssociation, setInvoiceAssociation] = useState(initialData?.properties?.invoiceAssociation || 'arrears');
  const [recurrenceInterval, setRecurrenceInterval] = useState(initialData?.properties?.recurrenceInterval || 1);
  const [recurrenceOffset, setRecurrenceOffset] = useState(initialData?.properties?.recurrenceOffset || 0);
  const [groupBy, setGroupBy] = useState(initialData?.properties?.groupBy || '');
  const [expiryValue, setExpiryValue] = useState(initialData?.properties?.expiryValue || '');
  const [expiryUnit, setExpiryUnit] = useState(initialData?.properties?.expiryUnit || 'days');
  const [availableDimensions, setAvailableDimensions] = useState([]);
  const [availableFeatures, setAvailableFeatures] = useState([]);

  // Fetch features on mount
  React.useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/features');
        const featuresData = await response.json();
        console.log('Fetched features:', featuresData);
        setAvailableFeatures(featuresData);
      } catch (error) {
        console.error('Error fetching features:', error);
        setAvailableFeatures([]);
      }
    };

    fetchFeatures();
  }, []);

  // Fetch all schemas and extract dimensions on mount
  React.useEffect(() => {
    const fetchDimensions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/schemas');
        const schemas = await response.json();

        const allDimensions = new Set();
        schemas.forEach((schema) => {
          if (schema.dimensions) {
            const parsedDimensions = typeof schema.dimensions === 'string'
              ? JSON.parse(schema.dimensions)
              : schema.dimensions;

            const dimensionNames = parsedDimensions.dimensions?.filter((d) => d) || [];
            dimensionNames.forEach((dim) => allDimensions.add(dim));
          }
        });

        setAvailableDimensions(Array.from(allDimensions));
      } catch (error) {
        console.error('Error fetching schema dimensions:', error);
        setAvailableDimensions([]);
      }
    };

    fetchDimensions();
  }, []);

  const handleSave = () => {
    onSave({
      id: initialData?.id || generateId('chg_'),
      type: 'entitlement',
      name,
      featureId,
      entitlementLimit: limit === '' ? 0 : limit,
      amountCents: price,
      properties: {
        invoiceAssociation,
        recurrenceInterval,
        recurrenceOffset,
        groupBy,
        expiryValue,
        expiryUnit,
        featureName
      },
      invoiceable: false,
    });
  };

  const incrementCredits = () => {
    setLimit(prev => prev === '' ? 1 : (prev) + 1);
  };

  const decrementCredits = () => {
    setLimit(prev => {
      if (prev === '' || prev <= 0) return '';
      return (prev) - 1;
    });
  };

  const incrementExpiry = () => {
    setExpiryValue(prev => prev === '' ? 1 : (prev) + 1);
  };

  const decrementExpiry = () => {
    setExpiryValue(prev => {
      if (prev === '' || prev <= 0) return '';
      return (prev) - 1;
    });
  };

  return (
    <WizardModal
      title={initialData ? "Edit Entitlement Fee Rate Card" : "Add Entitlement Fee Rate Card"}
      onClose={onClose}
      onSave={handleSave}
      currentStep={step}
      totalSteps={2}
      onNext={() => setStep(2)}
      onBack={() => setStep(1)}
    >
      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate Card Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Rate Card Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feature</label>
            <select
              value={featureId}
              onChange={e => {
                setFeatureId(e.target.value);
                const selectedFeature = availableFeatures.find(f => f.id === e.target.value);
                if (selectedFeature) {
                  setFeatureName(selectedFeature.name);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select feature...</option>
              {availableFeatures.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {availableFeatures.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No features available. Please create a feature first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credits to be Issued:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={limit}
                onChange={e => setLimit(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Credits to be Issued:"
              />
              <button
                type="button"
                onClick={decrementCredits}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                −
              </button>
              <button
                type="button"
                onClick={incrementCredits}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  min="0"
                  value={expiryValue}
                  onChange={e => setExpiryValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Expiry"
                />
                <button
                  type="button"
                  onClick={decrementExpiry}
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={incrementExpiry}
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  +
                </button>
              </div>
              <select
                value={expiryUnit}
                onChange={e => setExpiryUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="days">Days</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Association</label>
            <div className="flex gap-4">
              <label className={`flex items - center gap - 2 px - 4 py - 2 rounded - lg border cursor - pointer transition - colors ${invoiceAssociation === 'arrears' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} `}>
                <input
                  type="radio"
                  name="invoiceAssociation"
                  value="arrears"
                  checked={invoiceAssociation === 'arrears'}
                  onChange={() => setInvoiceAssociation('arrears')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium">In Arrears</span>
              </label>
              <label className={`flex items - center gap - 2 px - 4 py - 2 rounded - lg border cursor - pointer transition - colors ${invoiceAssociation === 'advance' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} `}>
                <input
                  type="radio"
                  name="invoiceAssociation"
                  value="advance"
                  checked={invoiceAssociation === 'advance'}
                  onChange={() => setInvoiceAssociation('advance')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium">In Advance</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Feature will be billed in the current invoice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Interval</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={recurrenceInterval}
                  onChange={e => setRecurrenceInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Offset</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`Recurrence ${recurrenceOffset} `}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">USD Price</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button className="p-2 text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={availableDimensions.length === 0}
            >
              <option value="">Select attribute...</option>
              {availableDimensions.map(dim => (
                <option key={dim} value={dim}>{dim}</option>
              ))}
            </select>
            {availableDimensions.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No dimensions available from schemas.
              </p>
            )}
          </div>
        </div>
      )}
    </WizardModal>
  );
};

