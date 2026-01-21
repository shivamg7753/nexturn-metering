import { useEffect, useState } from 'react'
import { Box, Typography, Breadcrumbs, Link } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { getCustomerColors } from '../components/customers/themeUtils'
import CustomerDetailsPanel from '../components/customers/CustomerDetailsPanel'
import CustomerSubscriptionsSection from '../components/customers/CustomerSubscriptionsSection'
import CustomerInvoicesSection from '../components/customers/CustomerInvoicesSection'
import CustomerCreditGrantsSection from '../components/customers/CustomerCreditGrantsSection'
import CustomerRecentActivitySection from '../components/customers/CustomerRecentActivitySection'

function CustomerDetailPage({ themeMode, customerId, onNavigateBack }) {
    const isDark = themeMode === 'dark'
    const colors = getCustomerColors(isDark)
    const [customer, setCustomer] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                setLoading(true)
                const response = await fetch(`http://localhost:3001/api/customers/${customerId}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch customer')
                }

                const data = await response.json()
                setCustomer(data)
            } catch (error) {
                console.error('Error fetching customer:', error)
            } finally {
                setLoading(false)
            }
        }

        if (customerId) {
            fetchCustomer()
        }
    }, [customerId])

    if (loading) {
        return (
            <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
                <Typography sx={{ color: colors.textSecondary }}>Loading customer...</Typography>
            </Box>
        )
    }

    if (!customer) {
        return (
            <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
                <Typography sx={{ color: colors.textSecondary }}>Customer not found</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
            {/* Breadcrumb Navigation */}
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
                    Customers
                </Link>
                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    {customer.name}
                </Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h4"
                    sx={{
                        color: colors.text,
                        fontWeight: 700,
                        fontSize: '1.75rem',
                        mb: 0.5,
                    }}
                >
                    {customer.name}
                </Typography>
                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    {customer.email}
                </Typography>
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
                    <CustomerSubscriptionsSection customer={customer} colors={colors} themeMode={themeMode} />
                    <CustomerInvoicesSection customer={customer} colors={colors} />
                    <CustomerCreditGrantsSection customer={customer} colors={colors} />
                    <CustomerRecentActivitySection customer={customer} colors={colors} />
                </Box>

                {/* Right Column - Details Panel */}
                <Box>
                    <CustomerDetailsPanel customer={customer} colors={colors} isDark={isDark} />
                </Box>
            </Box>
        </Box>
    )
}

export default CustomerDetailPage
