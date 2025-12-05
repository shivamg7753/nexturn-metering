import { useMemo } from 'react';

/**
 * Custom hook to calculate revenue data for charts
 */
export const useRevenueData = (invoices) => {
    return useMemo(() => {
        const data = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toLocaleString('default', { month: 'short' });

            const monthlyRevenue = invoices
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
    }, [invoices]);
};
