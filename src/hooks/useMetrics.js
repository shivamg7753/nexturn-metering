import { useMemo } from 'react';

/**
 * Custom hook to calculate dashboard metrics
 */
export const useMetrics = (state) => {
    return useMemo(() => {
        const totalRevenue = state.invoices
            .filter(i => i.status === 'paid')
            .reduce((acc, curr) => acc + curr.totalAmountCents, 0);

        const activeSubscriptions = state.subscriptions.filter(s => s.status === 'active').length;
        const totalCustomers = state.customers.length;
        const overdueInvoices = state.invoices.filter(i => i.status === 'overdue').length;

        return {
            totalRevenue,
            activeSubscriptions,
            totalCustomers,
            overdueInvoices,
        };
    }, [state.invoices, state.subscriptions, state.customers]);
};
