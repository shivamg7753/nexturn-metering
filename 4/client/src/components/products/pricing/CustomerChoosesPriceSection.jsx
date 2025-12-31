import { Box, Typography, TextField, Select, MenuItem, FormControl } from '@mui/material'

const CURRENCIES = [
    { value: 'INR', label: '₹ INR', symbol: '₹' },
    { value: 'USD', label: '$ USD', symbol: '$' },
    { value: 'EUR', label: '€ EUR', symbol: '€' },
    { value: 'GBP', label: '£ GBP', symbol: '£' },
]

function CustomerChoosesPriceSection({
    minimumAmount,
    maximumAmount,
    suggestedAmount,
    currency,
    onMinimumChange,
    onMaximumChange,
    onSuggestedChange,
    onCurrencyChange,
    colors
}) {
    const getCurrencySymbol = (curr) => CURRENCIES.find(c => c.value === curr)?.symbol || curr

    return (
        <Box sx={{ mb: 3 }}>
            <Typography sx={{
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                mb: 1
            }}>
                Customer chooses price
            </Typography>

            <Typography sx={{ fontSize: 12, color: colors.textSecondary, mb: 2 }}>
                Let customers decide how much to pay. Perfect for donations, tips, or pay-what-you-want pricing.
            </Typography>

            {/* Currency Selector */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text, mb: 1 }}>
                    Currency
                </Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={currency}
                        onChange={(e) => onCurrencyChange(e.target.value)}
                        sx={{
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                            '& .MuiSelect-select': { color: colors.text, fontSize: 14 },
                        }}
                    >
                        {CURRENCIES.map(curr => (
                            <MenuItem key={curr.value} value={curr.value}>{curr.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Minimum Amount */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text, mb: 1 }}>
                    Minimum amount (optional)
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0.00"
                    value={minimumAmount || ''}
                    onChange={(e) => onMinimumChange(e.target.value)}
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5, color: colors.textSecondary }}>{getCurrencySymbol(currency)}</Typography>
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& fieldset': { borderColor: colors.border },
                            '&:hover fieldset': { borderColor: '#7c3aed' },
                            '& input': { color: colors.text, fontSize: 14 },
                        },
                    }}
                />
            </Box>

            {/* Maximum Amount */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text, mb: 1 }}>
                    Maximum amount (optional)
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0.00"
                    value={maximumAmount || ''}
                    onChange={(e) => onMaximumChange(e.target.value)}
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5, color: colors.textSecondary }}>{getCurrencySymbol(currency)}</Typography>
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& fieldset': { borderColor: colors.border },
                            '&:hover fieldset': { borderColor: '#7c3aed' },
                            '& input': { color: colors.text, fontSize: 14 },
                        },
                    }}
                />
            </Box>

            {/* Suggested Amount */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text, mb: 1 }}>
                    Suggested amount (optional)
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0.00"
                    value={suggestedAmount || ''}
                    onChange={(e) => onSuggestedChange(e.target.value)}
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5, color: colors.textSecondary }}>{getCurrencySymbol(currency)}</Typography>
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& fieldset': { borderColor: colors.border },
                            '&:hover fieldset': { borderColor: '#7c3aed' },
                            '& input': { color: colors.text, fontSize: 14 },
                        },
                    }}
                />
                <Typography sx={{ fontSize: 11, color: colors.textSecondary, mt: 0.5 }}>
                    This amount will be pre-filled for customers
                </Typography>
            </Box>
        </Box>
    )
}

export default CustomerChoosesPriceSection
