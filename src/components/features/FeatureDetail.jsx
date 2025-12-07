import React from 'react';
import { ArrowLeft, Edit2 } from 'lucide-react';

export function FeatureDetail({ feature, onBack, onEdit }) {
  if (!feature) return null;

  const associations = feature.associations ? (typeof feature.associations === 'string' ? JSON.parse(feature.associations) : feature.associations) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to All Features
        </button>
        <button
          onClick={() => onEdit(feature)}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Feature
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Feature Details</h2>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{feature.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{feature.description || 'No description provided'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Associated Attributes ({associations.length})</h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Schema</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribute</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {associations.length > 0 ? (
                    associations.map((assoc, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assoc.eventSchemaId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assoc.attribute}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">No associated attributes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Feature Name</label>
              <div className="mt-1 text-sm font-medium text-gray-900">{feature.name}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Feature ID</label>
              <div className="mt-1 text-sm font-mono text-gray-500 flex items-center">
                {feature.id}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Event Schemas</label>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {new Set(associations.map(a => a.eventSchemaId)).size}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Created</span>
                <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
