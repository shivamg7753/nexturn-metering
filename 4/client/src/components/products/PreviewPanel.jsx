import { Box, Typography, TextField, Select, MenuItem, FormControl, Divider } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const COUNTRIES = [
    { value: 'us', label: 'United States', flag: '🇺🇸' },
    { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'ca', label: 'Canada', flag: '🇨🇦' },
    { value: 'au', label: 'Australia', flag: '🇦🇺' },
    { value: 'de', label: 'Germany', flag: '🇩🇪' },
]

const US_STATES = [
    { value: '', label: 'Choose...' },
    { value: 'ca', label: 'California' },
    { value: 'ny', label: 'New York' },
    { value: 'tx', label: 'Texas' },
    { value: 'fl', label: 'Florida' },
]

function PreviewPanel({ previewData, onPreviewChange, totals, billingPeriod, colors }) {
    return (
        <Box sx={{
            bgcolor: colors.previewBg,
            borderRadius: 2,
            p: 3,
            height: 'fit-content',
        }}>
            <Typography sx={{
                fontSize: 16,
                fontWeight: 700,
                color: colors.text,
                mb: 0.5,
            }}>
                Preview
            </Typography>
            <Typography sx={{
                fontSize: 12,
                color: colors.textSecondary,
                mb: 3,
            }}>
                Estimate totals based on pricing model, unit quantity, and tax.
            </Typography>

            {/* Unit Quantity */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5,
                }}>
                    Unit quantity
                </Typography>
                <TextField
                    size="small"
                    type="number"
                    value={previewData.unitQuantity}
                    onChange={(e) => onPreviewChange('unitQuantity', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                    sx={{
                        width: 80,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& fieldset': {
                                borderColor: colors.border,
                            },
                            '&:hover fieldset': {
                                borderColor: '#7c3aed',
                            },
                        },
                        '& .MuiInputBase-input': {
                            color: colors.text,
                            fontSize: 14,
                        },
                    }}
                />
            </Box>

            {/* Location */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5,
                }}>
                    Location
                </Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={previewData.location}
                        onChange={(e) => onPreviewChange('location', e.target.value)}
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            },
                        }}
                    >
                        {COUNTRIES.map(country => (
                            <MenuItem key={country.value} value={country.label}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>{country.flag}</span>
                                    <span>{country.label}</span>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* State (for US) */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5,
                }}>
                    State
                </Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={previewData.state}
                        onChange={(e) => onPreviewChange('state', e.target.value)}
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
                                color: previewData.state ? colors.text : colors.textSecondary,
                                fontSize: 14,
                            },
                        }}
                    >
                        {US_STATES.map(state => (
                            <MenuItem key={state.value} value={state.value}>
                                {state.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Divider sx={{ borderColor: colors.border, my: 2 }} />

            {/* Price Calculation */}
            <Typography sx={{
                fontSize: 13,
                color: colors.textSecondary,
                mb: 2,
            }}>
                {totals.priceDisplay}
            </Typography>

            {/* Totals */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Subtotal</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.text, fontWeight: 500 }}>{totals.subtotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Tax</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.text, fontWeight: 500 }}>{totals.tax}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Total per {billingPeriod}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{totals.total}</Typography>
                </Box>
                <Typography sx={{ fontSize: 11, color: colors.textMuted }}>
                    Billed at the start of the period
                </Typography>
            </Box>
        </Box>
    )
}

export default PreviewPanel
