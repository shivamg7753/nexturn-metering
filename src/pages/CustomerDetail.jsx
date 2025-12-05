import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/store';
import { ArrowLeft } from 'lucide-react';
import { useCustomerUsage } from '../hooks';
import {
  CustomerHeader,
  CustomerDetailsCard,
  SubscriptionsSection,
  UsageMetricsSection,
  UsageBreakdown,
  RecentEvents,
  InvoiceHistorySection,
} from '../components/customers';

export const CustomerDetail = () => {
  const { id } = useParams();
  const { state } = useApp();
  const [isSubFormOpen, setIsSubFormOpen] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(null);

  const customer = state.customers.find(c => c.id === id);
  const { usage, loading: loadingUsage, refresh: refreshUsage } = useCustomerUsage(customer?.id);

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
        <CustomerHeader customer={customer} totalSpent={totalSpent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Subscriptions */}
          <SubscriptionsSection
            subscriptions={customerSubscriptions}
            plans={state.plans}
            customerId={customer.id}
            isFormOpen={isSubFormOpen}
            onOpenForm={() => setIsSubFormOpen(true)}
            onCloseForm={() => setIsSubFormOpen(false)}
            managingSubscription={managingSubscription}
            onManageSubscription={setManagingSubscription}
            onCloseManager={() => setManagingSubscription(null)}
          />

          {/* Usage Metrics */}
          <UsageMetricsSection
            usage={usage}
            loading={loadingUsage}
            onRefresh={refreshUsage}
          />

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
          <InvoiceHistorySection invoices={customerInvoices} />
        </div>

        <div className="space-y-8">
          {/* Details Card */}
          <CustomerDetailsCard customer={customer} />
        </div>
      </div>
    </div>
  );
};

