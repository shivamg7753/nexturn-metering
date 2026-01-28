import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useState } from 'react'
import { formatPriceDisplay, getPricingDescription } from '../../utils/priceFormatters'

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
                        alignItems: 'flex-start',
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
                                mb: (price.pricingModel === 'tiered' || price.pricingModel === 'graduated' || price.pricingModel === 'volume') && price.tiers ? 1 : 0
                            }}>
                                {getPricingDescription(price)}
                            </Typography>
                        )}


                        {/* Display all tiers for tiered/graduated/volume or usage-based pricing */}
                        {(['tiered', 'graduated', 'volume'].includes(price.pricingModel) || (price.pricingModel === 'usage-based' && price.usageType === 'per-tier')) && price.tiers && price.tiers.length > 0 && (
                            <Box sx={{ mt: 1, pl: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {price.tiers.map((tier, tierIndex) => {
                                    const currencySymbol = price.currency === 'INR' ? '₹' : price.currency === 'USD' ? '$' : price.currency || 'INR'
                                    const tierPrice = tier.unitPrice || tier.flatFee || '0.00'

                                    // Calculate first unit: 1 for first tier, or previous tier's upTo + 1
                                    const firstUnit = tierIndex === 0 ? 1 : (price.tiers[tierIndex - 1]?.upTo ? price.tiers[tierIndex - 1].upTo + 1 : 1)
                                    // Last unit is upTo, or ∞ if null/undefined
                                    const lastUnit = tier.upTo === null || tier.upTo === undefined || tier.upTo === '' ? '∞' : tier.upTo

                                    return (
                                        <Typography key={tierIndex} sx={{
                                            fontSize: 11,
                                            color: colors.textSecondary,
                                            fontFamily: 'monospace',
                                        }}>
                                            {firstUnit}-{lastUnit} units: {currencySymbol}{tierPrice}/unit
                                        </Typography>
                                    )
                                })}
                            </Box>
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
