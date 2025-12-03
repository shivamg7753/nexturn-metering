import { Subscription, Plan, Invoice, Event, BillableMetric } from '../types';
import { calculateUsage } from './aggregationEngine';
import { generateId } from '../lib/utils';

export const generateInvoice = (
  subscription: Subscription,
  plan: Plan,
  metrics: BillableMetric[],
  usageData: any[], // Usage data from API
  periodStart: Date,
  periodEnd: Date
): Invoice => {
  const fees: any[] = [];
  let totalAmountCents = 0;

  // 1. Subscription Fee (Flat Fee) - Skipped for simulation simplicity (focus on usage)

  // 2. Usage Charges
  plan.charges.forEach(charge => {
    const metric = metrics.find(m => m.id === charge.billableMetricId);
    if (!metric) return;

    // Find usage for this metric (assuming metric.code matches meter.code)
    const usageRecord = usageData.find(u => u.meterCode === metric.code);
    const usageQty = usageRecord ? usageRecord.value : 0;

    if (usageQty > 0) {
      let amountCents = 0;

      if (charge.chargeModel === 'standard') {
        amountCents = usageQty * (charge.properties?.amountCents || 0);
      } else if (charge.chargeModel === 'package') {
        const units = charge.properties?.packageSize || 1;
        const packages = Math.ceil(usageQty / units);
        amountCents = packages * (charge.properties?.amountCents || 0);
      } else if (charge.chargeModel === 'volume') {
        // Simplified volume pricing
        amountCents = usageQty * (charge.properties?.amountCents || 0);
      }

      if (amountCents > 0) {
        fees.push({
          id: generateId('fee_'),
          invoiceId: '', // Set later
          type: 'charge',
          description: `${metric.name} (${usageQty} units)`,
          units: usageQty,
          unitAmountCents: charge.properties?.amountCents || 0, // Approximate for display
          amountCents: amountCents,
          taxesAmountCents: 0,
          totalAmountCents: amountCents,
        });
        totalAmountCents += amountCents;
      }
    }
  });

  const invoice: Invoice = {
    id: generateId('inv_'),
    number: `INV-${generateId('num_').substring(0, 6).toUpperCase()}`,
    customerId: subscription.customerId,
    subscriptionIds: [subscription.id],
    issuingDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
    status: 'draft',
    paymentStatus: 'pending',
    currency: plan.currency,
    fees: fees,
    subscriptionAmountCents: 0,
    chargesAmountCents: totalAmountCents,
    couponsAmountCents: 0,
    creditsAmountCents: 0,
    taxesAmountCents: 0,
    totalAmountCents: totalAmountCents,
    prepaidCreditAmountCents: 0,
    createdAt: new Date().toISOString(),
  };

  // Fix circular ref
  invoice.fees.forEach(f => f.invoiceId = invoice.id);

  return invoice;
};
