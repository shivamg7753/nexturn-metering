import React from 'react';
import { useApp } from '../context/store';
import { Users, CreditCard, FileText, Activity } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useMetrics, useRevenueData } from '../hooks';
import {
  MetricCard,
  RevenueChart,
  TopCustomersList,
  RecentInvoicesTable,
} from '../components/dashboard';

export const Dashboard = () => {
  const { state } = useApp();

  // Use custom hooks for calculations
  const metrics = useMetrics(state);
  const revenueData = useRevenueData(state.invoices);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your billing and revenue metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change="+12.5%"
          trend="up"
          icon={CreditCard}
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions.toString()}
          change="+4.2%"
          trend="up"
          icon={Activity}
        />
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers.toString()}
          change="+2.1%"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Overdue Invoices"
          value={metrics.overdueInvoices.toString()}
          change="-1.5%"
          trend="down"
          icon={FileText}
          trendGood={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <TopCustomersList customers={state.customers} />
      </div>

      <RecentInvoicesTable
        invoices={state.invoices}
        customers={state.customers}
      />
    </div>
  );
};

