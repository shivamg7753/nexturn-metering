import React, { useState } from 'react';
import { useApp } from '../context/store';
import { generateInvoice } from '../logic/billingEngine';
import { api } from '../api/client';
import { Play, RefreshCw, Trash2, CheckCircle } from 'lucide-react';

export const Settings = () => {
  const { state, dispatch } = useApp();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const runBillingCycle = async () => {
    setProcessing(true);
    setMessage('Starting billing cycle...');

    try {
      let invoicesGenerated = 0;
      const periodEnd = new Date();
      const periodStart = new Date(new Date().setDate(periodEnd.getDate() - 30)); // Last 30 days

      for (const sub of state.subscriptions) {
        if (sub.status !== 'active') continue;

        const plan = state.plans.find(p => p.id === sub.planId);
        if (!plan) continue;

        // Get Billable Metrics for this plan
        const planMetricIds = plan.charges.map(c => c.billableMetricId);
        const planMetrics = state.metrics.filter((m: { id: string; }) => planMetricIds.includes(m.id));

        // Fetch Real Usage from Backend
        // Note: In a real app, we'd optimize this to not fetch one by one if possible, or batch it.
        const usageResponse = await api.getUsage(sub.customerId, periodStart, periodEnd);
        const usageData = usageResponse.usage;

        // Generate Invoice
        const invoice = generateInvoice(
          sub,
          plan,
          planMetrics,
          usageData,
          periodStart,
          periodEnd
        );

        if (invoice.totalAmountCents > 0) {
          dispatch({ type: 'ADD_INVOICE', payload: invoice });
          invoicesGenerated++;
        }
      }

      setMessage(`Billing cycle complete. Generated ${invoicesGenerated} invoices based on REAL backend usage.`);
    } catch (err) {
      console.error(err);
      setMessage('Failed to run billing cycle. Check console.');
    } finally {
      setProcessing(false);
    }
  };

  const simulateEvents = async () => {
    setProcessing(true);
    setMessage('Generating events...');

    try {
      // 1. Get Schemas from API to know what to generate
      const schemas = await api.getSchemas();
      if (schemas.length === 0) {
        setMessage('No schemas defined. Please create an Event Schema first.');
        setProcessing(false);
        return;
      }

      // 2. Generate random events based on schemas
      const eventsToIngest = [];
      const customers = state.customers; // Use existing customers from context for now

      for (let i = 0; i < 50; i++) {
        const schema = schemas[Math.floor(Math.random() * schemas.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];

        eventsToIngest.push({
          transactionId: `evt_${Math.random().toString(36).substr(2, 9)}`,
          code: schema.code,
          timestamp: new Date().toISOString(),
          customerId: customer.id,
          properties: {
            // Generate random properties based on schema dimensions
            ...Object.keys(schema.dimensions).reduce((acc, key) => ({
              ...acc,
              [key]: Math.floor(Math.random() * 100) // Simple number generation for now
            }), {})
          }
        });
      }

      // 3. Send to API
      let successCount = 0;
      for (const event of eventsToIngest) {
        await api.ingestEvent(event);
        successCount++;
      }

      setMessage(`Successfully ingested ${successCount} events via API.`);
    } catch (err) {
      console.error(err);
      setMessage('Failed to ingest events. Check console.');
    } finally {
      setProcessing(false);
    }
  };

  const clearData = () => {
    if (confirm('Are you sure? This will clear all generated data (Invoices, Events).')) {
      // In a real app we'd have a proper action for this, here we might need to reload or add a CLEAR action
      // For now, let's just reload the page to reset to seed data if we don't have a clear action
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings & Simulation</h1>
        <p className="text-gray-500 mt-1">Manage application settings and run simulations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-600" />
            Billing Simulation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manually trigger billing cycles and event generation for testing purposes.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors">
              <h3 className="font-medium text-gray-900 mb-2">Generate Traffic</h3>
              <p className="text-sm text-gray-500 mb-4">
                Simulate 50 random usage events for existing customers and metrics.
              </p>
              <button
                onClick={simulateEvents}
                disabled={processing}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                Generate Events
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors">
              <h3 className="font-medium text-gray-900 mb-2">Run Billing Cycle</h3>
              <p className="text-sm text-gray-500 mb-4">
                Calculate usage and generate invoices for all active subscriptions (last 30 days).
              </p>
              <button
                onClick={runBillingCycle}
                disabled={processing}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Billing Cycle
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <button
            onClick={clearData}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
