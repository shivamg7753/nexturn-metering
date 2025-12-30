import { Box, Typography, Select, MenuItem, FormControl, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

const BILLING_PERIODS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'every-3-months', label: 'Every 3 months' },
    { value: 'every-6-months', label: 'Every 6 months' },
    { value: 'custom', label: 'Custom' },
]

function UsageMeterSection({ meter, billingPeriod, meters, onMeterChange, onBillingPeriodChange, onCreateMeter, colors }) {
    return (
        <Box sx={{ mb: 3 }}>
            {/* Section Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: colors.text,
                }}>
                    Usage
                </Typography>
                <IconButton size="small" sx={{ color: colors.textMuted }}>
                    <MoreHorizIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Meter Selector */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5
                }}>
                    Meter
                </Typography>
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mb: 1
                }}>
                    Link to a meter to price your customers usage.{' '}
                    <Box component="span" sx={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 500 }}>
                        View docs
                    </Box>
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                        <Select
                            value={meter}
                            onChange={(e) => onMeterChange(e.target.value)}
                            displayEmpty
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
                                    color: meter ? colors.text : colors.textSecondary,
                                    fontSize: 14,
                                },
                            }}
                        >
                            <MenuItem value="" disabled>
                                Choose a meter
                            </MenuItem>
                            {meters.map(m => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.displayName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Create Meter Button */}
                    <IconButton
                        onClick={onCreateMeter}
                        sx={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: 1.5,
                            color: colors.textSecondary,
                            '&:hover': {
                                borderColor: '#7c3aed',
                                color: '#7c3aed',
                            }
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>

                    {/* Keyboard Shortcut */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 1,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 1.5,
                        bgcolor: colors.inputBg,
                    }}>
                        <Typography sx={{
                            fontSize: 12,
                            color: colors.textMuted,
                            fontFamily: 'monospace',
                        }}>
                            N
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Billing Period */}
            <Box>
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
                        value={billingPeriod}
                        onChange={(e) => onBillingPeriodChange(e.target.value)}
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
                            <MenuItem key={period.value} value={period.value}>
                                {period.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    )
}

export default UsageMeterSection
