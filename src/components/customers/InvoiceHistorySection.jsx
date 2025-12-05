import React from 'react';
import { Download } from 'lucide-react';
import { StatusBadge } from '../dashboard/StatusBadge';
import { formatCurrency } from '../../../lib/utils';

/**
 * InvoiceHistorySection Component
 * Displays customer invoice history table
 */
export const InvoiceHistorySection = ({ invoices }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Invoice History</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500">
                            <th className="pb-3 font-medium">Invoice</th>
                            <th className="pb-3 font-medium">Date</th>
                            <th className="pb-3 font-medium">Amount</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {invoices.map(invoice => (
                            <tr key={invoice.id}>
                                <td className="py-3 font-medium text-gray-900">{invoice.number}</td>
                                <td className="py-3 text-gray-500">{new Date(invoice.issuingDate).toLocaleDateString()}</td>
                                <td className="py-3 text-gray-900">{formatCurrency(invoice.totalAmountCents, invoice.currency)}</td>
                                <td className="py-3">
                                    <StatusBadge status={invoice.status} />
                                </td>
                                <td className="py-3 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-gray-500">
                                    No invoices generated yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
