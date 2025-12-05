import React from 'react';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../../lib/utils';

/**
 * RecentInvoicesTable Component
 * Displays a table of recent invoices
 */
export const RecentInvoicesTable = ({ invoices, customers }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                        <th className="pb-3 font-medium">Invoice</th>
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {invoices.slice(0, 5).map(invoice => {
                        const customer = customers.find(c => c.id === invoice.customerId);
                        return (
                            <tr key={invoice.id}>
                                <td className="py-3 font-medium text-gray-900">{invoice.number}</td>
                                <td className="py-3 text-gray-600">{customer?.name || 'Unknown'}</td>
                                <td className="py-3 text-gray-500">{new Date(invoice.issuingDate).toLocaleDateString()}</td>
                                <td className="py-3 text-gray-900">{formatCurrency(invoice.totalAmountCents, invoice.currency)}</td>
                                <td className="py-3">
                                    <StatusBadge status={invoice.status} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
);
