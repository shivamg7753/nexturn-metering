import { useEffect, useState } from 'react'
import { Box, Typography, Breadcrumbs, Link, Chip, IconButton, Button } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { getCustomerColors } from '../components/customers/themeUtils'

function SubscriptionDetailPage({ themeMode, subscriptionId, onNavigateBack }) {
    const isDark = themeMode === 'dark'
    const colors = getCustomerColors(isDark)
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                setLoading(true)
                const response = await fetch(`http://localhost:3001/api/subscriptions/${subscriptionId}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch subscription')
                }

                const data = await response.json()
                setSubscription(data)
            } catch (error) {
                console.error('Error fetching subscription:', error)
            } finally {
                setLoading(false)
            }
        }

        if (subscriptionId) {
            fetchSubscription()
        }
    }, [subscriptionId])

    if (loading) {
        return (
            <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
                <Typography sx={{ color: colors.textSecondary }}>Loading subscription...</Typography>
            </Box>
        )
    }

    if (!subscription) {
        return (
            <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
                <Typography sx={{ color: colors.textSecondary }}>Subscription not found</Typography>
            </Box>
        )
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return '—'
        const date = new Date(dateString)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        return `${dateStr}, ${timeStr}`
    }

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount || 0)
    }

    const calculateSubtotal = () => {
        if (!subscription || !subscription.products) return 0
        return subscription.products.reduce((sum, product) => {
            return sum + ((product.price || 0) * (product.quantity || 1))
        }, 0)
    }

    const getPriceCurrency = () => {
        if (!subscription || !subscription.products || subscription.products.length === 0) return 'USD'
        const firstProduct = subscription.products[0]
        return firstProduct.priceDetails?.currency || 'USD'
    }

    const getBillingPeriod = (priceDetails) => {
        if (!priceDetails) return 'month'
        const period = priceDetails.billingPeriod || 'monthly'
        return period.replace('ly', '').replace('every-', 'every ')
    }

    return (
        <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
            {/* Breadcrumb */}
            <Breadcrumbs
                separator={<ChevronRightIcon sx={{ fontSize: 16, color: colors.textTertiary }} />}
                sx={{ mb: 2 }}
            >
                <Link
                    component="button"
                    onClick={onNavigateBack}
                    sx={{
                        color: colors.accent,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                >
                    Subscriptions
                </Link>
                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    {subscription.customerId?.name || 'Subscription'}
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700, fontSize: '1.75rem' }}>
                        {subscription.customerId?.name}
                    </Typography>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '1rem' }}>
                        on product {subscription.products.length}
                    </Typography>
                    <Chip
                        label={subscription.status || 'Active'}
                        size="small"
                        sx={{
                            bgcolor: '#10b981',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            textTransform: 'capitalize'
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        sx={{
                            background: colors.buttonBg,
                            color: '#fff',
                            textTransform: 'none',
                            px: 2,
                            '&:hover': { opacity: 0.9 }
                        }}
                    >
                        Update subscription
                    </Button>
                    <IconButton sx={{ color: colors.textSecondary }}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Info Row */}
            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Started
                    </Typography>
                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                        {formatDate(subscription.createdAt)}
                    </Typography>
                </Box>
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Next invoice
                    </Typography>
                    <Typography sx={{ color: colors.accent, fontSize: '0.875rem' }}>
                        {formatCurrency(calculateSubtotal(), getPriceCurrency())} on {formatDate(subscription.billingStartDate)}
                    </Typography>
                </Box>
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Test auto-cancellation
                    </Typography>
                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                        {subscription.duration?.endDate ? formatDate(subscription.duration.endDate) : '—'}
                    </Typography>
                </Box>
            </Box>

            {/* Main Content Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
                    gap: 3,
                    alignItems: 'start',
                }}
            >
                {/* Left Column - Main Content */}
                <Box>
                    {/* Pricing Section */}
                    <Box sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
                            <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
                                Pricing
                            </Typography>
                        </Box>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                                <Box component="thead">
                                    <Box component="tr" sx={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>PRODUCT</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>PRICE</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>QUANTITY</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>TOTAL</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>SUBSCRIPTION ITEM ID</Box>
                                        <Box component="th" sx={{ p: 2 }}></Box>
                                    </Box>
                                </Box>
                                <Box component="tbody">
                                    {subscription.products.map((product, idx) => (
                                        <Box key={idx} component="tr" sx={{ borderBottom: `1px solid ${colors.border}` }}>
                                            <Box component="td" sx={{ p: 2 }}>
                                                <Typography sx={{ color: colors.accent, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                                    {product.productName}
                                                </Typography>
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                                                    {formatCurrency(product.price, product.priceDetails?.currency)} / {getBillingPeriod(product.priceDetails)}
                                                </Typography>
                                            </Box>
                                            <Box component="td" sx={{ p: 2, color: colors.text, fontSize: '0.875rem' }}>
                                                {formatCurrency(product.price, product.priceDetails?.currency)} / {getBillingPeriod(product.priceDetails)}
                                            </Box>
                                            <Box component="td" sx={{ p: 2, color: colors.text, fontSize: '0.875rem' }}>
                                                {product.quantity}
                                            </Box>
                                            <Box component="td" sx={{ p: 2, color: colors.text, fontSize: '0.875rem' }}>
                                                {formatCurrency(product.price * product.quantity, product.priceDetails?.currency)} / {getBillingPeriod(product.priceDetails)}
                                            </Box>
                                            <Box component="td" sx={{ p: 2 }}>
                                                <Typography sx={{ color: colors.accent, fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                                                    si_{product.productId?.toString().slice(-12) || 'unknown'}
                                                </Typography>
                                            </Box>
                                            <Box component="td" sx={{ p: 2 }}>
                                                <IconButton size="small" sx={{ color: colors.textSecondary }}>
                                                    <MoreVertIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Upcoming Invoice Section */}
                    <Box sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
                            <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem', mb: 1 }}>
                                Upcoming invoice
                            </Typography>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                This is a preview of the invoice that will be billed on <Typography component="span" sx={{ color: colors.accent }}>Feb 21</Typography>. It may change if the subscription is updated.
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 2, mb: 1, pb: 1, borderBottom: `1px solid ${colors.border}` }}>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>DESCRIPTION</Typography>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>QTY</Typography>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, textAlign: 'right' }}>UNIT PRICE</Typography>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, textAlign: 'right' }}>AMOUNT</Typography>
                                </Box>
                                {subscription.products.map((product, idx) => (
                                    <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 2, py: 1.5 }}>
                                        <Box>
                                            <Typography sx={{ color: colors.text, fontSize: '0.875rem', mb: 0.5 }}>
                                                {product.productName}
                                            </Typography>
                                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                                                {formatDate(subscription.billingStartDate)} – {formatDate(new Date(new Date(subscription.billingStartDate).setMonth(new Date(subscription.billingStartDate).getMonth() + 1)))}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>{product.quantity}</Typography>
                                        <Typography sx={{ color: colors.text, fontSize: '0.875rem', textAlign: 'right' }}>
                                            {formatCurrency(product.price, product.priceDetails?.currency)}
                                        </Typography>
                                        <Typography sx={{ color: colors.text, fontSize: '0.875rem', textAlign: 'right' }}>
                                            {formatCurrency(product.price * product.quantity, product.priceDetails?.currency)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ borderTop: `1px solid ${colors.border}`, pt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Subtotal</Typography>
                                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                        {formatCurrency(calculateSubtotal(), getPriceCurrency())}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Total excluding tax</Typography>
                                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                        {formatCurrency(calculateSubtotal(), getPriceCurrency())}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Tax</Typography>
                                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>-</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>Total</Typography>
                                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                        {formatCurrency(calculateSubtotal(), getPriceCurrency())}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Link sx={{ color: colors.accent, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                    View full invoice for {formatCurrency(calculateSubtotal(), getPriceCurrency())} on {formatDate(subscription.billingStartDate)}
                                </Link>
                            </Box>
                        </Box>
                    </Box>

                    {/* Invoices Section */}
                    <Box sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
                            <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
                                Invoices
                            </Typography>
                        </Box>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                                <Box component="thead">
                                    <Box component="tr" sx={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>TOTAL</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>FREQUENCY</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>INVOICE NUMBER</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>CUSTOMER EMAIL</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>DUE</Box>
                                        <Box component="th" sx={{ p: 2, textAlign: 'left', color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>CREATED</Box>
                                        <Box component="th" sx={{ p: 2 }}></Box>
                                    </Box>
                                </Box>
                                <Box component="tbody">
                                    <Box component="tr" sx={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <Box component="td" sx={{ p: 2 }}>
                                            <Typography sx={{ color: colors.text, fontSize: '0.875rem', mb: 0.5 }}>
                                                $100.00 USD
                                            </Typography>
                                            <Chip label="Paid" size="small" sx={{ bgcolor: '#10b981', color: '#fff', height: 20, fontSize: '0.75rem' }} />
                                        </Box>
                                        <Box component="td" sx={{ p: 2, color: colors.text, fontSize: '0.875rem' }}>
                                            📅 Monthly
                                        </Box>
                                        <Box component="td" sx={{ p: 2, color: colors.accent, fontSize: '0.875rem' }}>
                                            DHVDEGB-0001
                                        </Box>
                                        <Box component="td" sx={{ p: 2, color: colors.text, fontSize: '0.875rem' }}>
                                            {subscription.customerId?.email || 'demo@demo.com'}
                                        </Box>
                                        <Box component="td" sx={{ p: 2, color: colors.text, fontSize: '0.875rem' }}>
                                            —
                                        </Box>
                                        <Box component="td" sx={{ p: 2, color: colors.text, fontSize: '0.875rem' }}>
                                            {formatDateTime(subscription.createdAt)}
                                        </Box>
                                        <Box component="td" sx={{ p: 2 }}>
                                            <IconButton size="small" sx={{ color: colors.textSecondary }}>
                                                <MoreVertIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Metadata Section */}
                    <Box sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
                                Metadata
                            </Typography>
                            <IconButton size="small" sx={{ color: colors.textSecondary }}>
                                <span style={{ fontSize: '1rem' }}>✏️</span>
                            </IconButton>
                        </Box>
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                No metadata
                            </Typography>
                        </Box>
                    </Box>

                    {/* Logs Section */}
                    <Box sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
                            <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
                                Logs
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography sx={{ color: colors.text, fontSize: '0.875rem', fontWeight: 600 }}>
                                        POST
                                    </Typography>
                                    <Typography sx={{ color: colors.accent, fontSize: '0.875rem' }}>
                                        /v1/subscriptions
                                    </Typography>
                                    <Chip label="200 OK" size="small" sx={{ bgcolor: colors.hover, color: colors.text, height: 20, fontSize: '0.75rem' }} />
                                </Box>
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                                    1/21/26, 1:01:15 PM
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Events Section */}
                    <Box sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
                            <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
                                Events
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                    Customer cus_TjvX5y9Q9tpIDs subscribed to price_1Soi7sK9cQEzslyM13fGQOiP
                                </Typography>
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem', whiteSpace: 'nowrap', ml: 2 }}>
                                    1/21/26, 1:01:18 PM
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Right Column - Details Panel */}
                <Box sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 3, p: 3, position: 'sticky', top: 24 }}>
                    <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1.125rem', mb: 3 }}>
                        Details
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                                Customer
                            </Typography>
                            <Link sx={{ color: colors.accent, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                {subscription.customerId?.name || 'nikhil kumar'}
                            </Link>
                        </Box>

                        <Box>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                                Created
                            </Typography>
                            <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                {formatDateTime(subscription.createdAt)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                                Current period
                            </Typography>
                            <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                {formatDate(subscription.duration?.startDate)} to {formatDate(subscription.duration?.endDate) || 'Forever'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                                ID
                            </Typography>
                            <Typography sx={{ color: colors.accent, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                sub_15volkBcQEzakyMV2fO3jMT
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                                Billing mode
                            </Typography>
                            <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                Flexible
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                                Discounts
                            </Typography>
                            <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                No coupon applied
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                                Billing method
                            </Typography>
                            <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                Charge specific payment method
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                                Payment method
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ bgcolor: '#1434CB', color: '#fff', px: 0.5, py: 0.25, borderRadius: 0.5, fontSize: '0.65rem', fontWeight: 600 }}>
                                    VISA
                                </Box>
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                                    •••• 4242
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default SubscriptionDetailPage
