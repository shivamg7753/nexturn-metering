import React, { useState } from 'react';
import { useApp } from '../../../context/store';
import { BillableMetric } from '../../../types';
import { generateId } from '../../../lib/utils';
import { X } from 'lucide-react';

interface MetricFormProps {
  onClose: () => void;
  initialData?: BillableMetric;
}

export const MetricForm = ({ onClose, initialData }: MetricFormProps) => {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState<Partial<BillableMetric>>(initialData || {
    name: '',
    code: '',
    description: '',
    aggregationType: 'count',
    recurring: false,
    fieldName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const metric: BillableMetric = {
      id: initialData?.id || generateId('bm_'),
      name: formData.name!,
      code: formData.code!,
      description: formData.description,
      aggregationType: formData.aggregationType as any,
      recurring: formData.recurring!,
      fieldName: formData.fieldName,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData) {
      dispatch({ type: 'UPDATE_METRIC', payload: metric });
    } else {
      dispatch({ type: 'ADD_METRIC', payload: metric });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Edit Metric' : 'Create Metric'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. API Calls"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="e.g. api_calls"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation Type</label>
              <select
                value={formData.aggregationType}
                onChange={e => setFormData({ ...formData, aggregationType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="count">Count</option>
                <option value="count_unique">Count Unique</option>
                <option value="sum">Sum</option>
                <option value="max">Max</option>
                <option value="latest">Latest</option>
                <option value="weighted_sum">Weighted Sum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
              <input
                type="text"
                value={formData.fieldName}
                onChange={e => setFormData({ ...formData, fieldName: e.target.value })}
                disabled={formData.aggregationType === 'count'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder={formData.aggregationType === 'count' ? 'N/A' : 'property_name'}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.recurring}
              onChange={e => setFormData({ ...formData, recurring: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
              Recurring Metric (resets each period)
            </label>
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
              {initialData ? 'Save Changes' : 'Create Metric'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
