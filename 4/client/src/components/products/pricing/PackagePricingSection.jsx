import { Box, Typography, TextField, Select, MenuItem, FormControl } from '@mui/material'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']
const TAX_OPTIONS = [
    { value: 'auto', label: 'Auto' },
    { value: 'inclusive', label: 'Inclusive' },
    { value: 'exclusive', label: 'Exclusive' },
]

function PackagePricingSection({
    amount,
    currency,
    packageQuantity = '',
    includeTaxInPrice,
    onAmountChange,
    onCurrencyChange,
    onPackageQuantityChange,
    onTaxChange,
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
                Price
            </Typography>

            {/* Amount Field */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 1
                }}>
                    Amount <Box component="span" sx={{ color: '#7c3aed' }}>(required)</Box>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        size="small"
                        placeholder="0.00"
                        type="number"
                        value={amount}
                        onChange={(e) => onAmountChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <Typography sx={{ color: colors.textSecondary, mr: 0.5, fontSize: 14 }}>
                                    $
                                </Typography>
                            ),
                        }}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: colors.inputBg,
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: colors.border },
                                '&:hover fieldset': { borderColor: '#7c3aed' },
                                '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
                            },
                            '& .MuiInputBase-input': {
                                color: colors.text,
                                fontSize: 14,
                            },
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                            value={currency}
                            onChange={(e) => onCurrencyChange(e.target.value)}
                            sx={{
                                bgcolor: colors.inputBg,
                                borderRadius: 1.5,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
                                '& .MuiSelect-select': { color: colors.text, fontSize: 14 },
                            }}
                        >
                            {CURRENCIES.map(curr => (
                                <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Package Quantity Field - inline below amount */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1.5 }}>
                    <Typography sx={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: colors.textSecondary,
                    }}>
                        per
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="10"
                        type="number"
                        value={packageQuantity}
                        onChange={(e) => onPackageQuantityChange(e.target.value)}
                        sx={{
                            width: 120,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: colors.inputBg,
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: colors.border },
                                '&:hover fieldset': { borderColor: '#7c3aed' },
                                '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
                            },
                            '& .MuiInputBase-input': {
                                color: colors.text,
                                fontSize: 14,
                            },
                        }}
                    />
                    <Typography sx={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: colors.textSecondary,
                    }}>
                        units
                    </Typography>
                </Box>
            </Box>

            {/* Include Tax in Price */}
            <Box sx={{ mb: 2 }}>
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
                        value={includeTaxInPrice}
                        onChange={(e) => onTaxChange(e.target.value)}
                        sx={{
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                            '& .MuiSelect-select': { color: colors.text, fontSize: 14 },
                        }}
                    >
                        {TAX_OPTIONS.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    )
}

export default PackagePricingSection
