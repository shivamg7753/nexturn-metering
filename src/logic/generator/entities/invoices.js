import { generateId } from '../../../lib/utils';
import { addDays, subMonths, format } from 'date-fns';
import { randomInt } from '../helpers';

/**
 * Invoice generation
 */

/**
 * Generate historical invoices for subscriptions
 * @param {Array<Object>} subscriptions - Subscription objects
 * @param {Array<Object>} plans - Plan objects
 * @returns {Array<Object>} Array of invoice objects sorted by issuing date
 */
export const generateHistoricalInvoices = (subscriptions, plans) => {
    const invoices = [];
    const now = new Date();

    subscriptions.forEach(sub => {
        const plan = plans.find(p => p.id === sub.planId);
        if (!plan) return;

        // Generate 1-3 past invoices
        const invoiceCount = randomInt(1, 3);
        for (let i = 1; i <= invoiceCount; i++) {
            const date = subMonths(now, i);
            const amount = plan.amountCents + randomInt(0, 5000); // Base + random usage

            invoices.push({
                id: generateId('inv_'),
                number: `INV-${format(date, 'yyyyMM')}-${randomInt(1000, 9999)}`,
                customerId: sub.customerId,
                subscriptionIds: [sub.id],
                issuingDate: date.toISOString(),
                dueDate: addDays(date, 14).toISOString(),
                status: 'paid',
                paymentStatus: 'succeeded',
                currency: plan.currency,
                fees: [],
                subscriptionAmountCents: plan.amountCents,
                chargesAmountCents: amount - plan.amountCents,
                couponsAmountCents: 0,
                creditsAmountCents: 0,
                taxesAmountCents: 0,
                totalAmountCents: amount,
                prepaidCreditAmountCents: 0,
                createdAt: date.toISOString(),
            });
        }
    });

    return invoices.sort((a, b) => new Date(b.issuingDate).getTime() - new Date(a.issuingDate).getTime());
};
