import { Box, Typography, TextField, Select, MenuItem, FormControl, ToggleButtonGroup, ToggleButton } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import AddIcon from '@mui/icons-material/Add'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']
const BILLING_PERIODS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'every-3-months', label: 'Every 3 months' },
    { value: 'every-6-months', label: 'Every 6 months' },
    { value: 'custom', label: 'Custom' },
]
const TAX_OPTIONS = [
    { value: 'auto', label: 'Auto' },
    { value: 'inclusive', label: 'Inclusive' },
    { value: 'exclusive', label: 'Exclusive' },
]

function PricingSection({ formData, errors, onFieldChange, showMoreOptions, onToggleMoreOptions, onMorePricingOptions, colors, isDark }) {
    return (
        <Box>
            {/* More Options Toggle */}
            <Box
                onClick={onToggleMoreOptions}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    mb: 2,
                    '&:hover': {
                        '& .toggle-text': {
                            color: '#6d28d9',
                        }
                    }
                }}
            >
                <Typography
                    className="toggle-text"
                    sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#7c3aed',
                        transition: 'color 0.2s',
                    }}
                >
                    More options
                </Typography>
                <KeyboardArrowDownIcon
                    sx={{
                        fontSize: 18,
                        color: '#7c3aed',
                        transform: showMoreOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                    }}
                />
            </Box>

            {showMoreOptions && (
                <Box sx={{ animation: 'fadeIn 0.2s ease' }}>
                    {/* Pricing Type Toggle */}
                    <Box sx={{ mb: 3 }}>
                        <ToggleButtonGroup
                            value={formData.pricingType}
                            exclusive
                            onChange={(e, value) => value && onFieldChange('pricingType', value)}
                            sx={{
                                bgcolor: colors.inputBg,
                                borderRadius: 2,
                                border: `1px solid ${colors.border}`,
                                '& .MuiToggleButton-root': {
                                    border: 'none',
                                    borderRadius: 1.5,
                                    px: 4,
                                    py: 1,
                                    textTransform: 'none',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: colors.textSecondary,
                                    flex: 1,
                                    '&.Mui-selected': {
                                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                        color: isDark ? '#f8fafc' : '#7c3aed',
                                        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                                        '&:hover': {
                                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff',
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="recurring">Recurring</ToggleButton>
                            <ToggleButton value="one-off">One-off</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Include tax in price */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: colors.text,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}>
                            Include tax in price
                            <Box
                                component="span"
                                sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    border: `1px solid ${colors.textSecondary}`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 10,
                                    color: colors.textSecondary,
                                    cursor: 'help',
                                }}
                            >
                                ?
                            </Box>
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={formData.includeTaxInPrice}
                                onChange={(e) => onFieldChange('includeTaxInPrice', e.target.value)}
                                sx={{
                                    bgcolor: colors.inputBg,
                                    borderRadius: 1.5,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.border,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#7c3aed',
                                    },
                                    '& .MuiSelect-select': {
                                        color: colors.text,
                                        fontSize: 14,
                                    },
                                }}
                            >
                                {TAX_OPTIONS.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Billing Period (only for recurring) */}
                    {formData.pricingType === 'recurring' && (
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: colors.text,
                                mb: 1
                            }}>
                                Billing period
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={formData.billingPeriod}
                                    onChange={(e) => onFieldChange('billingPeriod', e.target.value)}
                                    sx={{
                                        bgcolor: colors.inputBg,
                                        borderRadius: 1.5,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: colors.border,
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#7c3aed',
                                        },
                                        '& .MuiSelect-select': {
                                            color: colors.text,
                                            fontSize: 14,
                                        },
                                    }}
                                >
                                    {BILLING_PERIODS.map(period => (
                                        <MenuItem key={period.value} value={period.value}>{period.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    {/* More Pricing Options Link */}
                    <Box
                        onClick={onMorePricingOptions}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: 'pointer',
                            '&:hover': {
                                '& .link-text': {
                                    color: '#6d28d9',
                                }
                            }
                        }}
                    >
                        <AddIcon sx={{ fontSize: 16, color: '#7c3aed' }} />
                        <Typography
                            className="link-text"
                            sx={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#7c3aed',
                                transition: 'color 0.2s',
                            }}
                        >
                            More pricing options
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default PricingSection
