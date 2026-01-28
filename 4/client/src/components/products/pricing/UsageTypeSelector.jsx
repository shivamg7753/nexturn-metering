import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

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

const TIER_MODES = [
    { value: 'volume', label: 'Volume', description: 'All units price based on final tier reached.' },
    { value: 'graduated', label: 'Graduated', description: 'Units in each tier priced at that tier\'s rate.' },
]

function UsageTypeSelector({ usageType, tierMode, onUsageTypeChange, onTierModeChange, colors }) {
    return (
        <Box sx={{ mb: 3 }}>
            {/* Usage Type Dropdown */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <Select
                    value={usageType}
                    onChange={(e) => onUsageTypeChange(e.target.value)}
                    renderValue={(value) => {
                        const type = USAGE_TYPES.find(t => t.value === value)
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
                                py: 1.5,
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
                                    {type.label}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: colors.textSecondary, mt: 0.25 }}>
                                    {type.description}
                                </Typography>
                            </Box>
                            {usageType === type.value && (
                                <CheckIcon sx={{ color: '#7c3aed', fontSize: 20, ml: 1 }} />
                            )}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Tier Mode Dropdown (only for per-tier) */}
            {usageType === 'per-tier' && (
                <Box>
                    <FormControl fullWidth size="small">
                        <Select
                            value={tierMode}
                            onChange={(e) => onTierModeChange(e.target.value)}
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
                            {TIER_MODES.map(mode => (
                                <MenuItem key={mode.value} value={mode.value}>
                                    {mode.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Tier Mode Description */}
                    <Typography sx={{ fontSize: 12, color: colors.textSecondary, mt: 1 }}>
                        {TIER_MODES.find(m => m.value === tierMode)?.description}
                        {' Needs a record for Stripe to track customer service usage. '}
                        <Box component="span" sx={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 500 }}>
                            View docs
                        </Box>
                    </Typography>
                </Box>
            )}
        </Box>
    )
}

export default UsageTypeSelector
export { USAGE_TYPES, TIER_MODES }
