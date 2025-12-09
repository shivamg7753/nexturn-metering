import React from 'react';
import { Edit2, Play, Archive, BarChart2 } from 'lucide-react';

/**
 * MetersList Component
 * List layout for meter cards
 */
export const MetersList = ({ meters, schemas, onEdit, onToggleStatus, onSelect }) => {

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-50 border-green-200';
      case 'draft': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'archived': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schema</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aggregation</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {meters.map((meter) => {
            const isEditable = meter.status === 'draft';
            const isActive = meter.status === 'active';
            const isArchived = meter.status === 'archived';

            return (
              <tr
                key={meter.id}
                onClick={() => onSelect && onSelect(meter)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-50 rounded-lg text-indigo-600">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{meter.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{meter.description || 'No description'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(meter.status || 'draft')}`}>
                    {(meter.status || 'draft').charAt(0).toUpperCase() + (meter.status || 'draft').slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {schemas.find(s => s.id === meter.eventSchemaId)?.name || meter.eventSchemaId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {meter.aggregation} {meter.field ? `(${meter.field})` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(meter); }}
                      disabled={!isEditable}
                      title={isEditable ? "Edit Meter" : "Switch to Draft to edit"}
                      className={`p-1.5 rounded-md transition-colors ${isEditable
                        ? 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'
                        : 'text-gray-200 cursor-not-allowed'
                        }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!isArchived && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleStatus(meter); }}
                        title={isActive ? "Archive Meter" : "Publish Meter"}
                        className={`p-1.5 rounded-md transition-colors ${isActive
                          ? 'text-red-400 hover:text-red-700 hover:bg-red-50'
                          : 'text-green-400 hover:text-green-700 hover:bg-green-50'
                          }`}
                      >
                        {isActive ? <Archive className="w-4 h-4" /> : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play w-4 h-4" aria-hidden="true">
                            <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
