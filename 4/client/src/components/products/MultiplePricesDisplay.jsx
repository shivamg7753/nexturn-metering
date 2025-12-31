import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useState } from 'react'

function MultiplePricesDisplay({ prices = [], onEditPrice, onDeletePrice, colors, isDark }) {
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedPriceIndex, setSelectedPriceIndex] = useState(null)

    const handleMenuOpen = (event, index) => {
        setAnchorEl(event.currentTarget)
        setSelectedPriceIndex(index)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedPriceIndex(null)
    }

    const handleEdit = () => {
        if (selectedPriceIndex !== null) {
            onEditPrice?.(selectedPriceIndex)
        }
        handleMenuClose()
    }

    const handleDelete = () => {
        if (selectedPriceIndex !== null) {
            onDeletePrice?.(selectedPriceIndex)
        }
        handleMenuClose()
    }

    const formatPriceDisplay = (price) => {
        const amount = price.amount || '0.00'
        const currency = price.currency || 'INR'
        const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency

        let displayText = `Starts at ${currencySymbol}${amount}`

        if (price.pricingType === 'recurring' && price.billingPeriod) {
            const periodMap = {
                'daily': 'day',
                'weekly': 'week',
                'monthly': 'month',
                'yearly': 'year',
                'every-3-months': '3 months',
                'every-6-months': '6 months',
            }
            const period = periodMap[price.billingPeriod] || price.billingPeriod
            displayText += ` Per ${period}`
        }

        return displayText
    }

    if (!prices || prices.length === 0) {
        return null
    }

    return (
        <Box sx={{ mb: 3 }}>
            <Typography sx={{
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                mb: 2
            }}>
                Pricing
            </Typography>

            {prices.map((price, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${colors.border}`,
                        bgcolor: colors.inputBg,
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: '#7c3aed',
                            boxShadow: isDark
                                ? '0 2px 8px rgba(124, 58, 237, 0.2)'
                                : '0 2px 8px rgba(124, 58, 237, 0.1)',
                        }
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography sx={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: colors.text,
                            }}>
                                {formatPriceDisplay(price)}
                            </Typography>
                            {index === 0 && (
                                <Box sx={{
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#ede9fe',
                                    border: `1px solid ${isDark ? '#7c3aed' : '#c4b5fd'}`,
                                }}>
                                    <Typography sx={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: '#7c3aed',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                    }}>
                                        Default
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        {price.pricingModel && price.pricingModel !== 'flat-rate' && (
                            <Typography sx={{
                                fontSize: 12,
                                color: colors.textSecondary,
                            }}>
                                {price.pricingModel.replace('-', ' ')} • {price.pricingType}
                            </Typography>
                        )}
                    </Box>

                    <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, index)}
                        sx={{
                            color: colors.textSecondary,
                            '&:hover': {
                                color: colors.text,
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            }
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>
            ))}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        bgcolor: isDark ? '#2a2a3e' : '#ffffff',
                        border: `1px solid ${colors.border}`,
                        boxShadow: isDark
                            ? '0 4px 20px rgba(0,0,0,0.5)'
                            : '0 4px 20px rgba(0,0,0,0.1)',
                        minWidth: 140,
                    }
                }}
            >
                <MenuItem
                    onClick={handleEdit}
                    sx={{
                        fontSize: 14,
                        color: colors.text,
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        }
                    }}
                >
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={handleDelete}
                    disabled={prices.length === 1}
                    sx={{
                        fontSize: 14,
                        color: prices.length === 1 ? colors.textSecondary : '#ef4444',
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                        },
                        '&.Mui-disabled': {
                            opacity: 0.5,
                        }
                    }}
                >
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    )
}

export default MultiplePricesDisplay
