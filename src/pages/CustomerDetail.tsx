import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/store';
import { api } from '../api/client';
import { ArrowLeft, Mail, MapPin, CreditCard, Calendar, Clock, Download, TrendingUp, Activity, List } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { SubscriptionForm } from '../components/features/subscriptions/SubscriptionForm';
import { SubscriptionManager } from '../components/features/subscriptions/SubscriptionManager';
import { Subscription } from '../types';

const UsageBreakdown = ({ customerId }: { customerId: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/usage-by-endpoint/' + customerId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <div className="text-sm text-gray-500">Loading breakdown...</div>;
  if (data.length === 0) return <div className="text-sm text-gray-500">No data available</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="pb-2 font-medium">Endpoint</th>
            <th className="pb-2 font-medium text-right">Requests</th>
            <th className="pb-2 font-medium text-right">Bandwidth</th>
            <th className="pb-2 font-medium text-right">Est. Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={i}>
              <td className="py-2 font-mono text-xs text-gray-700">{row.endpoint}</td>
              <td className="py-2 text-right text-gray-900">{row.requestCount}</td>
              <td className="py-2 text-right text-gray-900">{(row.bandwidthBytes / 1024).toFixed(1)} KB</td>
              <td className="py-2 text-right font-medium text-indigo-600">
                {formatCurrency(row.costCents, 'USD')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RecentEvents = ({ customerId }: { customerId: string }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events/' + customerId)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <div className="text-sm text-gray-500">Loading events...</div>;
  if (events.length === 0) return <div className="text-sm text-gray-500">No recent events</div>;

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {events.map(event => (
        <div key={event.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{event.code}</span>
              <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-600 font-mono space-y-1">
              {Object.entries(event.properties).map(([k, v]) => (
                <div key={k} className="flex gap-1">
                  <span className="text-gray-400">{k}:</span>
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const [isSubFormOpen, setIsSubFormOpen] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  const customer = state.customers.find(c => c.id === id);

  // Fetch usage data
  useEffect(() => {
    if (!customer) return;

    const fetchUsage = async () => {
      try {
        setLoadingUsage(true);
        const usageData = await api.getUsage(customer.id);
        setUsage(usageData);
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchUsage();
    // Refresh usage every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, [customer]);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Customer not found</h2>
        <Link to="/customers" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Return to Customers
        </Link>
      </div>
    );
  }

  const customerInvoices = state.invoices.filter(i => i.customerId === customer.id);
  const customerSubscriptions = state.subscriptions.filter(s => s.customerId === customer.id);

  const totalSpent = customerInvoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmountCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link to="/customers" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Customers
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold mr-4">
              {customer.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex items-center text-gray-500 mt-1 space-x-4">
                <span className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-1.5" />
                  {customer.email}
                </span>
                <span className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-1.5" />
                  Joined {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Lifetime Value</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpent, customer.currency)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Subscriptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Subscriptions</h2>
              <button
                onClick={() => setIsSubFormOpen(true)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Add Subscription
              </button>
            </div>

            {isSubFormOpen && (
              <SubscriptionForm onClose={() => setIsSubFormOpen(false)} customerId={customer.id} />
            )}

            {managingSubscription && (
              <SubscriptionManager
                subscription={managingSubscription}
                onClose={() => setManagingSubscription(null)}
              />
            )}

            {customerSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {customerSubscriptions.map(sub => {
                  const plan = state.plans.find(p => p.id === sub.planId);
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{plan?.name || 'Unknown Plan'}</h3>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(plan?.amountCents || 0, plan?.currency || 'USD')} / {plan?.interval}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {sub.status}
                        </span>
                        <button
                          onClick={() => setManagingSubscription(sub)}
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No active subscriptions</p>
            )}
          </div>

          {/* Usage Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Current Usage</h2>
              <button
                onClick={() => {
                  const fetchUsage = async () => {
                    try {
                      setLoadingUsage(true);
                      const usageData = await api.getUsage(customer.id);
                      setUsage(usageData);
                    } catch (error) {
                      console.error('Failed to fetch usage:', error);
                    } finally {
                      setLoadingUsage(false);
                    }
                  };
                  fetchUsage();
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Refresh
              </button>
            </div>

            {loadingUsage ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-500 mt-2">Loading usage data...</p>
              </div>
            ) : usage && usage.usage && usage.usage.length > 0 ? (
              <div className="space-y-4">
                {usage.usage.map((metric: any) => (
                  <div key={metric.meterId} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{metric.meterName}</h3>
                        <p className="text-sm text-gray-500">{metric.meterCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">units</p>
                      {metric.costCents !== undefined && (
                        <p className="text-sm font-medium text-indigo-600 mt-1">
                          {formatCurrency(metric.costCents, metric.currency || 'USD')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No usage data available</p>
            )}
          </div>

          {/* Usage Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Usage Breakdown by Endpoint</h2>
            <UsageBreakdown customerId={customer.id} />
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <RecentEvents customerId={customer.id} />
          </div>

          {/* Invoices */}
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
                  {customerInvoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td className="py-3 font-medium text-gray-900">{invoice.number}</td>
                      <td className="py-3 text-gray-500">{new Date(invoice.issuingDate).toLocaleDateString()}</td>
                      <td className="py-3 text-gray-900">{formatCurrency(invoice.totalAmountCents, invoice.currency)}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                          ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customerInvoices.length === 0 && (
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
        </div>

        <div className="space-y-8">
          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-700">Edit</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Billing Address</p>
                <div className="flex items-start text-sm text-gray-900">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p>{customer.billingAddress.line1}</p>
                    <p>{customer.billingAddress.city}, {customer.billingAddress.country} {customer.billingAddress.zip}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Currency</p>
                <div className="flex items-center text-sm text-gray-900">
                  <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                  {customer.currency}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Timezone</p>
                <div className="flex items-center text-sm text-gray-900">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  {customer.timezone || 'UTC'}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">External ID</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {customer.externalId}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
