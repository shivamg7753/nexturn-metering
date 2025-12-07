import React from 'react';
import { ChevronLeft, Edit2, AlertCircle, CheckCircle, Tag, Activity } from 'lucide-react';

/**
 * MeterDetail Component
 * Detailed view of a single usage meter
 */
export const MeterDetail = ({ meter, schema, onBack, onEdit }) => {
  const filters = typeof meter.filter === 'string' ? JSON.parse(meter.filter) : meter.filter;
  const filterList = Array.isArray(filters)
    ? filters
    : Object.entries(filters).map(([k, v]) => ({ key: k, operator: 'equals', value: v }));

  const schemaStructure = schema
    ? (typeof schema.dimensions === 'string' ? JSON.parse(schema.dimensions) : schema.dimensions)
    : {};

  const attributeCount = (schemaStructure.attributes || []).length;
  const dimensionCount = (schemaStructure.dimensions || []).length;

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Usage Meters
          </button>
        </div>
        {meter.status === 'draft' && (
          <button
            onClick={() => onEdit(meter)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit2 className="w-4 h-4" />
            Edit Usage Meter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Conditions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">FILTER CONDITIONS</h3>

            {filterList.length > 0 ? (
              <div className="space-y-3">
                {filterList.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="font-medium text-indigo-600">{f.key}</span>
                    <span className="text-gray-400">{f.operator === 'equals' ? '==' : f.operator}</span>
                    <span>{f.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 bg-indigo-50 rounded-full mb-3 text-indigo-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">No Filters Found</h4>
                <p className="text-xs text-gray-500 mt-1">This meter aggregates all events matching the schema.</p>
              </div>
            )}
          </div>

          {/* Unit Calculation Function */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">UNIT CALCULATION FUNCTION</h3>

            {meter.eventLevelCalculation ? (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-xs text-gray-500 mb-1">Attribute</label>
                <div className="text-base font-mono text-gray-900">{meter.eventLevelCalculation}</div>
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-400 font-mono">
                  attributes['{meter.eventLevelCalculation}']
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No Per Unit Calculation configured. (Default: 1 unit per event)
              </div>
            )}
          </div>

          {/* Associated Price Plans */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Associated Price Plans (0)</h3>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-gray-50 rounded-full mb-3 text-gray-400">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-medium text-gray-900">No Price Plans associated</h4>
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Attached Event Schema</h3>
                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                  {schema?.name || 'Unknown Schema'}
                  <ChevronLeft className="w-3 h-3 rotate-180" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Usage MTD</h3>
              <div className="text-3xl font-bold text-gray-900">0</div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Created At</span>
                <span className="font-medium text-gray-900">{formatDate(meter.createdAt)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium text-gray-900">{formatDate(meter.updatedAt)}</span>
              </div>
              <div className="flex justify-between text-xs pt-2">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${meter.status === 'active' ? 'bg-green-100 text-green-700' :
                    meter.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                  }`}>
                  {meter.status || 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Schema Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">ITEMS IN ATTACHED SCHEMA</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Attributes ({attributeCount})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {schemaStructure.attributes?.slice(0, 5).map(attr => (
                    <span key={attr.name} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                      {attr.name}
                    </span>
                  ))}
                  {attributeCount > 5 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded border border-gray-100">+{attributeCount - 5} more</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Dimensions ({dimensionCount})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {schemaStructure.dimensions?.slice(0, 5).map(dim => (
                    <span key={dim} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                      {dim}
                    </span>
                  ))}
                  {dimensionCount > 5 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded border border-gray-100">+{dimensionCount - 5} more</span>
                  )}
                  {dimensionCount === 0 && <span className="text-xs text-gray-400 italic">No dimensions</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
