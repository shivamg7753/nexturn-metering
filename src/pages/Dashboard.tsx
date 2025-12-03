import React, { useMemo } from 'react';
import { useApp } from '../context/store';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, FileText, Activity } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const Dashboard = () => {
  const { state } = useApp();

  // Calculate some basic metrics
  const totalRevenue = state.invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, curr) => acc + curr.totalAmountCents, 0);

  const activeSubscriptions = state.subscriptions.filter(s => s.status === 'active').length;
  const totalCustomers = state.customers.length;
  const overdueInvoices = state.invoices.filter(i => i.status === 'overdue').length;

  // Calculate revenue per month for the last 12 months
  const revenueData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short' });

      const monthlyRevenue = state.invoices
        .filter(inv => {
          const invDate = new Date(inv.issuingDate);
          return invDate.getMonth() === date.getMonth() &&
            invDate.getFullYear() === date.getFullYear() &&
            inv.status === 'paid';
        })
        .reduce((sum, inv) => sum + inv.totalAmountCents, 0);

      data.push({
        name: monthKey,
        revenue: monthlyRevenue / 100, // Convert to dollars
      });
    }
    return data;
  }, [state.invoices]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your billing and revenue metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change="+12.5%"
          trend="up"
          icon={CreditCard}
        />
        <MetricCard
          title="Active Subscriptions"
          value={activeSubscriptions.toString()}
          change="+4.2%"
          trend="up"
          icon={Activity}
        />
        <MetricCard
          title="Total Customers"
          value={totalCustomers.toString()}
          change="+2.1%"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Overdue Invoices"
          value={overdueInvoices.toString()}
          change="-1.5%"
          trend="down"
          icon={FileText}
          trendGood={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
          <div className="space-y-4">
            {state.customers.slice(0, 5).map(customer => (
              <div key={customer.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                    {customer.name.substring(0, 2).toUpperCase()}
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
      </div>

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
              {state.invoices.slice(0, 5).map(invoice => {
                const customer = state.customers.find(c => c.id === invoice.customerId);
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
    </div>
  );
};

const MetricCard = ({ title, value, change, trend, icon: Icon, trendGood = trend === 'up' }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-indigo-50 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div className={`flex items-center text-xs font-medium ${trendGood ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {change}
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    paid: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    overdue: 'bg-red-100 text-red-800',
    voided: 'bg-gray-100 text-gray-500',
    finalized: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};
