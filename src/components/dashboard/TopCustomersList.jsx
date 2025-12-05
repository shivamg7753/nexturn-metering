import React from 'react';

/**
 * TopCustomersList Component
 * Displays a list of top customers with their LTV
 */
export const TopCustomersList = ({ customers }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
        <div className="space-y-4">
            {customers.slice(0, 5).map(customer => (
                <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                            {(typeof customer.name === 'string' ? customer.name.substring(0, 2) : 'NA').toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">$1,240.00</p>
                        <p className="text-xs text-gray-500">LTV</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
