import React, { useState } from 'react';
import { Meters } from './Meters';
import { AddOns } from './AddOns';
import { Features } from './Features';

export function BillableItems() {
  const [activeTab, setActiveTab] = useState('meters');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billable Items</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your usage meters, add-ons, and feature entitlements.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('meters')}
              className={`${activeTab === 'meters'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Usage Meters
            </button>
            <button
              onClick={() => setActiveTab('addons')}
              className={`${activeTab === 'addons'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Add-Ons
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`${activeTab === 'features'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Features
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'meters' && <Meters />}
          {activeTab === 'addons' && <AddOns />}
          {activeTab === 'features' && <Features />}
        </div>
      </div>
    </div>
  );
}

