import { useState } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useCustomers } from '../hooks/useCustomers'
import { CustomerEmptyState, CustomerFilterBar, AddCustomerDrawer, CustomersTable, getCustomerColors } from '../components/customers'

function CustomersPage({ themeMode }) {
    const { customers, loading, fetchCustomers } = useCustomers()
    const isDark = themeMode === 'dark'
    const colors = getCustomerColors(isDark)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const handleAddCustomer = () => {
        setDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setDrawerOpen(false)
    }

    const handleSubmitCustomer = async (customerData) => {
        try {
            const response = await fetch('http://localhost:3001/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData),
            })

            if (!response.ok) throw new Error('Failed to create customer')

            // Refresh the customers list
            fetchCustomers()
        } catch (error) {
            console.error('Error creating customer:', error)
            throw error
        }
    }

    return (
        <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
            {/* Page Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        color: colors.text,
                        fontWeight: 700,
                        fontSize: '1.5rem',
                    }}
                >
                    Customers
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<span style={{ fontSize: '1.2rem' }}>+</span>}
                    onClick={handleAddCustomer}
                    sx={{
                        background: colors.buttonBg,
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2.5,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                        },
                    }}
                >
                    Add customer
                </Button>
            </Box>

            {/* Filter Bar */}
            <CustomerFilterBar colors={colors} isDark={isDark} />

            {/* Content Area */}
            <Box
                sx={{
                    bgcolor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {loading ? (
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                        <Typography sx={{ color: colors.textSecondary }}>
                            Loading customers...
                        </Typography>
                    </Box>
                ) : customers.length === 0 ? (
                    <CustomerEmptyState colors={colors} onAddCustomer={handleAddCustomer} />
                ) : (
                    <CustomersTable
                        customers={customers}
                        colors={colors}
                        isDark={isDark}
                    />
                )}
            </Box>

            {/* Add Customer Drawer */}
            <AddCustomerDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                onSubmit={handleSubmitCustomer}
                themeMode={themeMode}
            />
        </Box>
    )
}

export default CustomersPage
