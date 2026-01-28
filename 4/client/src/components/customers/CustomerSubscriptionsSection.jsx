import { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AddSubscriptionDrawer from './AddSubscriptionDrawer'
import { fetchSubscriptions as fetchSubscriptionsApi } from '../../api/subscriptionApi'
import { formatPriceDisplay, getPricingDescription } from '../../utils/priceFormatters'

function CustomerSubscriptionsSection({ customer, colors, themeMode, onNavigateToSubscription }) {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [subscriptions, setSubscriptions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (customer?.id) {
            fetchSubscriptions()
        }
    }, [customer])

    const fetchSubscriptions = async () => {
        try {
            setLoading(true)
            const data = await fetchSubscriptionsApi(customer.id)
            setSubscriptions(data)
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDrawer = () => {
        setDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setDrawerOpen(false)
    }


    const handleSuccess = () => {
        fetchSubscriptions()
    }

    // Helper function to calculate next invoice date
    const calculateNextInvoiceDate = (subscription) => {
        const billingStart = new Date(subscription.billingStartDate)
        const now = new Date()
        const trialDays = subscription.trialDays || 0

        // Add trial days to billing start date
        const firstBillingDate = new Date(billingStart)
        firstBillingDate.setDate(firstBillingDate.getDate() + trialDays)

        // If first billing date is in the future, that's the next invoice date
        if (firstBillingDate > now) {
            return firstBillingDate
        }

        // Otherwise, calculate next invoice based on billing period
        const billingPeriod = subscription.products[0]?.priceDetails?.billingPeriod || subscription.products[0]?.billingPeriod || 'monthly'
        let nextInvoice = new Date(firstBillingDate)

        // Keep adding billing periods until we get a future date
        while (nextInvoice <= now) {
            switch (billingPeriod) {
                case 'daily':
                    nextInvoice.setDate(nextInvoice.getDate() + 1)
                    break
                case 'weekly':
                    nextInvoice.setDate(nextInvoice.getDate() + 7)
                    break
                case 'monthly':
                    nextInvoice.setMonth(nextInvoice.getMonth() + 1)
                    break
                case 'yearly':
                    nextInvoice.setFullYear(nextInvoice.getFullYear() + 1)
                    break
                case 'every-3-months':
                    nextInvoice.setMonth(nextInvoice.getMonth() + 3)
                    break
                case 'every-6-months':
                    nextInvoice.setMonth(nextInvoice.getMonth() + 6)
                    break
                default:
                    nextInvoice.setMonth(nextInvoice.getMonth() + 1)
            }
        }

        return nextInvoice
    }

    // Helper function to format date
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date))
    }

    // Helper function to get billing frequency display
    const getBillingFrequency = (subscription) => {
        const billingPeriod = subscription.products[0]?.priceDetails?.billingPeriod || subscription.products[0]?.billingPeriod || 'monthly'
        const frequencyMap = {
            'daily': 'Daily',
            'weekly': 'Weekly',
            'monthly': 'Monthly',
            'yearly': 'Yearly',
            'every-3-months': 'Every 3 months',
            'every-6-months': 'Every 6 months'
        }
        return frequencyMap[billingPeriod] || 'Monthly'
    }


    return (
        <>
            <Box
                sx={{
                    bgcolor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2.5,
                        borderBottom: `1px solid ${colors.border}`,
                    }}
                >
                    <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
                        Subscriptions
                    </Typography>
                    <Button
                        size="small"
                        onClick={handleOpenDrawer}
                        sx={{
                            color: colors.textSecondary,
                            minWidth: 'auto',
                            p: 0.5,
                            '&:hover': { bgcolor: colors.hover },
                        }}
                    >
                        <AddIcon sx={{ fontSize: 20 }} />
                    </Button>
                </Box>

                {/* Content */}
                {loading ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                            Loading subscriptions...
                        </Typography>
                    </Box>
                ) : subscriptions.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                            No subscriptions
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ p: 2.5 }}>
                        {subscriptions.map((subscription) => (
                            <Box
                                key={subscription._id}
                                onClick={() => onNavigateToSubscription && onNavigateToSubscription(subscription._id)}
                                sx={{
                                    p: 2,
                                    mb: 1,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: colors.hover }
                                }}
                            >
                                {/* Display each product */}
                                {subscription.products.map((product, index) => (
                                    <Box key={index} sx={{ mb: index < subscription.products.length - 1 ? 1 : 0.5 }}>
                                        <Typography sx={{ color: colors.text, fontSize: '0.875rem', fontWeight: 500 }}>
                                            {product.productName || 'Unnamed Product'}
                                            {product.priceDetails?.priceName && (
                                                <Box component="span" sx={{ color: colors.textSecondary, fontWeight: 400, ml: 1 }}>
                                                    ({product.priceDetails.priceName})
                                                </Box>
                                            )}
                                        </Typography>
                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                                            {product.priceDetails ? (
                                                <>
                                                    {formatPriceDisplay(product.priceDetails)}
                                                    {' • '}
                                                    {getPricingDescription(product.priceDetails)}
                                                </>
                                            ) : (
                                                `${new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: product.currency || 'USD',
                                                    minimumFractionDigits: 2
                                                }).format(product.price || 0)} / ${product.billingPeriod || 'month'}`
                                            )}
                                        </Typography>
                                    </Box>
                                ))}

                                {/* Subscription metadata */}
                                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${colors.border}` }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                                            Status:
                                        </Typography>
                                        <Typography sx={{ color: colors.text, fontSize: '0.8125rem', fontWeight: 500 }}>
                                            {subscription.status}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                                            Frequency:
                                        </Typography>
                                        <Typography sx={{ color: colors.text, fontSize: '0.8125rem', fontWeight: 500 }}>
                                            {getBillingFrequency(subscription)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                                            Next invoice:
                                        </Typography>
                                        <Typography sx={{ color: colors.text, fontSize: '0.8125rem', fontWeight: 500 }}>
                                            {formatDate(calculateNextInvoiceDate(subscription))}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Drawer */}
            <AddSubscriptionDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                customer={customer}
                themeMode={themeMode}
                onSuccess={handleSuccess}
            />
        </>
    )
}

export default CustomerSubscriptionsSection
