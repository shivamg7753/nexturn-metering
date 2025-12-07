import React from 'react';
import { MoreVertical, Edit2 } from 'lucide-react';

export function FeaturesList({ features, onEdit, onSelect }) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Name</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Code</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Associations</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Created At</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {features.map((feature) => {
            const associations = feature.associations ? (typeof feature.associations === 'string' ? JSON.parse(feature.associations) : feature.associations) : [];

            return (
              <tr
                key={feature.id}
                onClick={() => onSelect(feature)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{feature.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {feature.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{associations.length} attributes</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{formatTimeAgo(feature.createdAt)}</span>
                </td>
                <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(feature); }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Feature"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen w-4 h-4 text-gray-600" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
