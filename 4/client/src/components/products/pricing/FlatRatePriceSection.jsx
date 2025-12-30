import { Box, Typography, TextField, Select, MenuItem, FormControl, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']
const TAX_OPTIONS = [
    { value: 'auto', label: 'Auto' },
    { value: 'inclusive', label: 'Inclusive' },
    { value: 'exclusive', label: 'Exclusive' },
]

function FlatRatePriceSection({ amount, currency, includeTaxInPrice, onAmountChange, onCurrencyChange, onTaxChange, colors }) {
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
            <Box sx={{ mb: 2 }}>
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
                        placeholder="0"
                        type="number"
                        value={amount}
                        onChange={(e) => onAmountChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <Typography sx={{ color: colors.textSecondary, mr: 0.5, fontSize: 14 }}>
                                    ₹
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
                    <FormControl size="small" sx={{ minWidth: 90 }}>
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
                                <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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

            {/* Add Price by Currency */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    '&:hover': {
                        '& .add-text': { color: '#6d28d9' }
                    }
                }}
            >
                <AddIcon sx={{ fontSize: 16, color: '#7c3aed' }} />
                <Typography
                    className="add-text"
                    sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#7c3aed',
                        transition: 'color 0.2s',
                    }}
                >
                    Add a price by currency
                </Typography>
            </Box>
        </Box>
    )
}

export default FlatRatePriceSection
