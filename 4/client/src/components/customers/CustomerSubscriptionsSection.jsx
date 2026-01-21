import { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AddSubscriptionDrawer from './AddSubscriptionDrawer'

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
            const response = await fetch(`http://localhost:3001/api/subscriptions?customerId=${customer.id}`)
            if (response.ok) {
                const data = await response.json()
                setSubscriptions(data)
            }
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
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
                                    {subscription.products.length} product{subscription.products.length !== 1 ? 's' : ''}
                                </Typography>
                                <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                                    Status: {subscription.status}
                                </Typography>
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
