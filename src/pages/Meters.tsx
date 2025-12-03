import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/store';
import { Plus, BarChart2, Filter, Trash2, ChevronLeft } from 'lucide-react';

interface FilterCondition {
  key: string;
  operator: string;
  value: string;
}

export const Meters = () => {
  const { dispatch } = useApp();
  const [meters, setMeters] = useState<any[]>([]);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventSchemaId, setEventSchemaId] = useState('');
  const [aggregation, setAggregation] = useState('count');
  const [field, setField] = useState('');
  const [window, setWindow] = useState('tumbling');
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metersData, schemasData] = await Promise.all([
        api.getMeters(),
        api.getSchemas(),
      ]);
      setMeters(metersData);
      setSchemas(schemasData);
      if (schemasData.length > 0) {
        setEventSchemaId(schemasData[0].id);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const handleAddFilter = () => {
    setFilters([...filters, { key: '', operator: 'equals', value: '' }]);
  };

  const handleUpdateFilter = (index: number, field: keyof FilterCondition, value: string) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMeter = await api.createMeter({
        name,
        description,
        eventSchemaId,
        aggregation,
        field,
        filter: filters, // Send array of filters
        window,
      });

      // Update Global Store for PlanForm visibility
      dispatch({
        type: 'ADD_METRIC',
        payload: {
          id: newMeter.id,
          name: newMeter.name,
          description: newMeter.description,
          aggregationType: newMeter.aggregation,
          field: newMeter.field,
          status: 'active'
        }
      });

      setIsCreating(false);
      loadData();
      resetForm();
    } catch (err) {
      alert('Failed to create meter. Check console for details.');
      console.error(err);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEventSchemaId(schemas[0]?.id || '');
    setAggregation('count');
    setField('');
    setFilters([]);
    setWindow('tumbling');
  };

  // Get current schema details for dropdowns
  const currentSchema = schemas.find(s => s.id === eventSchemaId);
  const schemaStructure = currentSchema ? (typeof currentSchema.dimensions === 'string' ? JSON.parse(currentSchema.dimensions) : currentSchema.dimensions) : {};
  const availableAttributes = [
    ...(schemaStructure.attributes || []).map((a: any) => a.name),
    ...(schemaStructure.dimensions || [])
  ];

  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsCreating(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create a new Usage Meter</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Define Usage Meter</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Meter Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Count of transactions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Meter Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Associate Event Schema</label>
                <select
                  value={eventSchemaId}
                  onChange={e => setEventSchemaId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {schemas.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attributes/Dimensions Preview */}
            <div className="bg-gray-50 rounded-lg p-4 flex gap-8">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attributes ({schemaStructure.attributes?.length || 0})</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(schemaStructure.attributes || []).map((a: any, i: number) => (
                    <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dimensions ({schemaStructure.dimensions?.length || 0})</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(schemaStructure.dimensions || []).map((d: string, i: number) => (
                    <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Set Filter Condition</h2>
                <p className="text-sm text-gray-500">Aggregate events only matching the filter conditions.</p>
              </div>
              <button
                type="button"
                onClick={handleAddFilter}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                + Add Filter
              </button>
            </div>

            <div className="space-y-4">
              {filters.map((filter, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter(idx)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filter Condition {idx + 1}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Attribute/Dimension</label>
                      <select
                        value={filter.key}
                        onChange={e => handleUpdateFilter(idx, 'key', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      >
                        <option value="">Select Field</option>
                        {availableAttributes.map(attr => (
                          <option key={attr} value={attr}>{attr}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Operator</label>
                      <select
                        value={filter.operator}
                        onChange={e => handleUpdateFilter(idx, 'operator', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      >
                        <option value="equals">equals (==)</option>
                        <option value="not_equals">not equals (!=)</option>
                        <option value="contains">contains</option>
                        <option value="gt">greater than (&gt;)</option>
                        <option value="lt">less than (&lt;)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={e => handleUpdateFilter(idx, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Value to match"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {filters.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  No filters applied. All events matching the schema will be aggregated.
                </p>
              )}
            </div>
          </div>

          {/* Aggregation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Set Aggregation Type</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation Type</label>
                <select
                  value={aggregation}
                  onChange={e => setAggregation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="count">Count</option>
                  <option value="sum">Sum</option>
                  <option value="max">Max</option>
                  <option value="unique_count">Unique Count</option>
                </select>
              </div>

              {aggregation !== 'count' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Field</label>
                  <select
                    value={field}
                    onChange={e => setField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Field</option>
                    {availableAttributes.map(attr => (
                      <option key={attr} value={attr}>{attr}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Create Meter
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage Meters</h1>
          <p className="text-gray-500 mt-1">Configure how events are aggregated into billable usage.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Meter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meters.map((meter) => {
          const filters = typeof meter.filter === 'string' ? JSON.parse(meter.filter) : meter.filter;
          const filterList = Array.isArray(filters) ? filters : Object.entries(filters).map(([k, v]) => ({ key: k, operator: 'equals', value: v }));

          return (
            <div key={meter.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-indigo-100 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <BarChart2 className="w-5 h-5" />
                </div>

              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{meter.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{meter.description || 'No description provided.'}</p>

              <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Schema:</span>
                  <span className="font-medium">{schemas.find(s => s.id === meter.eventSchemaId)?.name || meter.eventSchemaId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aggregation:</span>
                  <span className="font-medium capitalize">{meter.aggregation} {meter.field ? `(${meter.field})` : ''}</span>
                </div>

                {filterList.length > 0 && (
                  <div>
                    <span className="text-gray-400 block mb-1">Filters:</span>
                    <div className="flex flex-wrap gap-1">
                      {filterList.map((f: any, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {f.key} {f.operator === 'equals' ? '==' : f.operator} {f.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
