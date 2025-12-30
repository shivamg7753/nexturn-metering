import { Box, Typography, IconButton } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import AddIcon from '@mui/icons-material/Add'

function PricingSummaryCard({
    prices = [],
    onAddPrice,
    onEditPrice,
    onSetDefault,
    colors
}) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography sx={{
                fontSize: 16,
                fontWeight: 700,
                color: colors.text,
                mb: 2
            }}>
                Pricing
            </Typography>

            {/* Price Cards */}
            {prices.map((price, index) => (
                <Box
                    key={price.id || index}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        border: `1px solid ${colors.border}`,
                        bgcolor: colors.inputBg,
                    }}
                >
                    <Box>
                        <Typography sx={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#7c3aed',
                        }}>
                            Starts at {price.displayPrice || '₹0.00'}
                        </Typography>
                        <Typography sx={{
                            fontSize: 12,
                            color: colors.textSecondary,
                        }}>
                            {price.billingPeriod === 'monthly' ? 'Per month' :
                                price.billingPeriod === 'yearly' ? 'Per year' :
                                    price.billingPeriod === 'weekly' ? 'Per week' :
                                        price.billingPeriod === 'daily' ? 'Per day' :
                                            `Per ${price.billingPeriod}`}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {price.isDefault && (
                            <Typography sx={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#7c3aed',
                            }}>
                                Default
                            </Typography>
                        )}
                        <IconButton
                            size="small"
                            onClick={() => onEditPrice?.(price)}
                            sx={{ color: colors.textMuted }}
                        >
                            <MoreHorizIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            ))}

            {/* Empty State */}
            {prices.length === 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        border: `1px solid ${colors.border}`,
                        bgcolor: colors.inputBg,
                    }}
                >
                    <Box>
                        <Typography sx={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#7c3aed',
                        }}>
                            Starts at ₹0.00
                        </Typography>
                        <Typography sx={{
                            fontSize: 12,
                            color: colors.textSecondary,
                        }}>
                            Per month
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#7c3aed',
                        }}>
                            Default
                        </Typography>
                        <IconButton size="small" sx={{ color: colors.textMuted }}>
                            <MoreHorizIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            )}

            {/* Add Another Price */}
            <Box
                onClick={onAddPrice}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    p: 2,
                    borderRadius: 2,
                    border: `1px dashed ${colors.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: '#7c3aed',
                        bgcolor: 'rgba(124, 58, 237, 0.04)',
                    }
                }}
            >
                <AddIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                <Typography sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: colors.textSecondary,
                }}>
                    Add another price
                </Typography>
            </Box>
        </Box>
    )
}

export default PricingSummaryCard
