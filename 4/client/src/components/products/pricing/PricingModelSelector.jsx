import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

const PRICING_MODELS = [
    {
        value: 'flat-rate',
        label: 'Flat rate',
        description: 'Offer a fixed price for a single unit, package, or seat.',
        docLink: false,
    },
    {
        value: 'package',
        label: 'Package pricing',
        description: 'Price by package, bundle, or group of units.',
        docLink: false,
    },
    {
        value: 'tiered',
        label: 'Tiered pricing',
        description: 'Offer different price points base on unit quantity.',
        docLink: false,
    },
    {
        value: 'usage-based',
        label: 'Usage-based',
        description: 'Pay-as-you-go billing based on metered usage.',
        docLink: false,
    },
]

const TIERED_TYPES = [
    {
        value: 'volume',
        label: 'Volume',
        description: 'All units price based on final tier reached.',
    },
    {
        value: 'graduated',
        label: 'Graduated',
        description: 'Tiers apply progressively as quantity increase.',
    },
]

const USAGE_TYPES = [
    {
        value: 'per-unit',
        label: 'Per unit',
        description: 'Charge a fixed price for each unit of usage. Perfect for metered billing based on API calls, active users, storage consumed, or any measurable metric.',
    },
    {
        value: 'per-package',
        label: 'Per package',
        description: 'Price by package, bundle, or group of units. Customers pay per bundle regardless of actual usage within that package.',
    },
    {
        value: 'per-tier',
        label: 'Per tier',
        description: 'Price based on quantity tiers. Use volume pricing (all units at tier rate) or graduated pricing (each tier priced separately).',
    },
]

function PricingModelSelector({
    pricingModel,
    onPricingModelChange,
    tieredType,
    onTieredTypeChange,
    usageType,
    onUsageTypeChange,
    colors
}) {
    const selectedModel = PRICING_MODELS.find(m => m.value === pricingModel)
    const selectedTieredType = TIERED_TYPES.find(t => t.value === tieredType)
    const selectedUsageType = USAGE_TYPES.find(u => u.value === usageType)

    return (
        <Box sx={{ mb: 3 }}>
            <Typography sx={{
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                mb: 1
            }}>
                Choose your pricing model
            </Typography>

            <FormControl fullWidth size="small">
                <Select
                    value={pricingModel}
                    onChange={(e) => onPricingModelChange(e.target.value)}
                    renderValue={(value) => {
                        const model = PRICING_MODELS.find(m => m.value === value)
                        return model?.label || value
                    }}
                    sx={{
                        bgcolor: colors.inputBg,
                        borderRadius: 1.5,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7c3aed',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7c3aed',
                        },
                        '& .MuiSelect-select': {
                            color: colors.text,
                            fontSize: 14,
                        },
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: colors.cardBg,
                                border: `1px solid ${colors.border}`,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                '& .MuiMenuItem-root': {
                                    py: 1.5,
                                    px: 2,
                                }
                            }
                        }
                    }}
                >
                    {PRICING_MODELS.map(model => (
                        <MenuItem
                            key={model.value}
                            value={model.value}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: colors.text,
                                }}>
                                    {model.label}
                                </Typography>
                                <Typography sx={{
                                    fontSize: 12,
                                    color: colors.textSecondary,
                                    mt: 0.25,
                                }}>
                                    {model.description}
                                </Typography>
                            </Box>
                            {pricingModel === model.value && (
                                <CheckIcon sx={{ color: '#7c3aed', fontSize: 20, ml: 1 }} />
                            )}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Tiered Type Selector - Only show when tiered pricing is selected */}
            {pricingModel === 'tiered' && (
                <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                    <Select
                        value={tieredType || 'graduated'}
                        onChange={(e) => onTieredTypeChange && onTieredTypeChange(e.target.value)}
                        renderValue={(value) => {
                            const type = TIERED_TYPES.find(t => t.value === value)
                            return type?.label || value
                        }}
                        sx={{
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.border,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#7c3aed',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#7c3aed',
                            },
                            '& .MuiSelect-select': {
                                color: colors.text,
                                fontSize: 14,
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: colors.cardBg,
                                    border: `1px solid ${colors.border}`,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    '& .MuiMenuItem-root': {
                                        py: 1.5,
                                        px: 2,
                                    }
                                }
                            }
                        }}
                    >
                        {TIERED_TYPES.map(type => (
                            <MenuItem
                                key={type.value}
                                value={type.value}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: colors.text,
                                    }}>
                                        {type.label}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: 12,
                                        color: colors.textSecondary,
                                        mt: 0.25,
                                    }}>
                                        {type.description}
                                    </Typography>
                                </Box>
                                {(tieredType || 'graduated') === type.value && (
                                    <CheckIcon sx={{ color: '#7c3aed', fontSize: 20, ml: 1 }} />
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Description with doc link - only for non-tiered, non-usage-based */}
            {selectedModel && pricingModel !== 'tiered' && pricingModel !== 'usage-based' && (
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mt: 1,
                }}>
                    {selectedModel.description}
                    {selectedModel.docLink && (
                        <Box component="span" sx={{
                            color: '#7c3aed',
                            cursor: 'pointer',
                            fontWeight: 500,
                            ml: 0.5,
                        }}>
                            View docs
                        </Box>
                    )}
                </Typography>
            )}

            {/* Tiered type description with doc link */}
            {pricingModel === 'tiered' && selectedTieredType && (
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mt: 1,
                }}>
                    {selectedTieredType.description}
                    <Box component="span" sx={{
                        color: '#7c3aed',
                        cursor: 'pointer',
                        fontWeight: 500,
                        ml: 0.5,
                    }}>
                        View docs
                    </Box>
                </Typography>
            )}

            {/* Usage-based Type Selector - Only show when usage-based is selected */}
            {pricingModel === 'usage-based' && (
                <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                    <Select
                        value={usageType || 'per-unit'}
                        onChange={(e) => onUsageTypeChange && onUsageTypeChange(e.target.value)}
                        renderValue={(value) => {
                            const type = USAGE_TYPES.find(u => u.value === value)
                            return type?.label || value
                        }}
                        sx={{
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.border,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#7c3aed',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#7c3aed',
                            },
                            '& .MuiSelect-select': {
                                color: colors.text,
                                fontSize: 14,
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: colors.cardBg,
                                    border: `1px solid ${colors.border}`,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    '& .MuiMenuItem-root': {
                                        py: 1.5,
                                        px: 2,
                                    }
                                }
                            }
                        }}
                    >
                        {USAGE_TYPES.map(type => (
                            <MenuItem
                                key={type.value}
                                value={type.value}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: colors.text,
                                    }}>
                                        {type.label}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: 12,
                                        color: colors.textSecondary,
                                        mt: 0.25,
                                    }}>
                                        {type.description}
                                    </Typography>
                                </Box>
                                {(usageType || 'per-unit') === type.value && (
                                    <CheckIcon sx={{ color: '#7c3aed', fontSize: 20, ml: 1 }} />
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Volume/Graduated Selector - Show when usage-based + per-tier is selected */}
            {pricingModel === 'usage-based' && usageType === 'per-tier' && (
                <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                    <Select
                        value={tieredType || 'volume'}
                        onChange={(e) => onTieredTypeChange && onTieredTypeChange(e.target.value)}
                        renderValue={(value) => {
                            const type = TIERED_TYPES.find(t => t.value === value)
                            return type?.label || value
                        }}
                        sx={{
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.border,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#7c3aed',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#7c3aed',
                            },
                            '& .MuiSelect-select': {
                                color: colors.text,
                                fontSize: 14,
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: colors.cardBg,
                                    border: `1px solid ${colors.border}`,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    '& .MuiMenuItem-root': {
                                        py: 1.5,
                                        px: 2,
                                    }
                                }
                            }
                        }}
                    >
                        {TIERED_TYPES.map(type => (
                            <MenuItem
                                key={type.value}
                                value={type.value}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: colors.text,
                                    }}>
                                        {type.label}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: 12,
                                        color: colors.textSecondary,
                                        mt: 0.25,
                                    }}>
                                        {type.description}
                                    </Typography>
                                </Box>
                                {(tieredType || 'volume') === type.value && (
                                    <CheckIcon sx={{ color: '#7c3aed', fontSize: 20, ml: 1 }} />
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Usage-based description with doc link - when NOT per-tier */}
            {pricingModel === 'usage-based' && usageType !== 'per-tier' && selectedUsageType && (
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mt: 1,
                }}>
                    {selectedUsageType.description}
                    <Box component="span" sx={{
                        color: '#7c3aed',
                        cursor: 'pointer',
                        fontWeight: 500,
                        ml: 0.5,
                    }}>
                        View docs
                    </Box>
                </Typography>
            )}

            {/* Usage-based per-tier description with doc link */}
            {pricingModel === 'usage-based' && usageType === 'per-tier' && selectedTieredType && (
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mt: 1,
                }}>
                    {selectedTieredType.description}
                    <Box component="span" sx={{
                        color: '#7c3aed',
                        cursor: 'pointer',
                        fontWeight: 500,
                        ml: 0.5,
                    }}>
                        View docs
                    </Box>
                </Typography>
            )}
        </Box>
    )
}

export default PricingModelSelector
export { PRICING_MODELS, TIERED_TYPES, USAGE_TYPES }
