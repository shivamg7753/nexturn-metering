import { Box, Typography, TextField, IconButton, Select, MenuItem, FormControl } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

const CURRENCIES = [
    { value: 'INR', label: '₹ INR', symbol: '₹' },
    { value: 'USD', label: '$ USD', symbol: '$' },
    { value: 'EUR', label: '€ EUR', symbol: '€' },
    { value: 'GBP', label: '£ GBP', symbol: '£' },
]

function GraduatedPricingTable({ tiers, currency, onTiersChange, onCurrencyChange, onAddTier, onRemoveTier, colors }) {
    const getCurrencySymbol = (curr) => CURRENCIES.find(c => c.value === curr)?.symbol || curr

    const handleTierChange = (index, field, value) => {
        const newTiers = [...tiers]
        newTiers[index] = { ...newTiers[index], [field]: value }
        onTiersChange(newTiers)
    }

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

            {/* Currency Selector */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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
                        <MenuItem key={curr.value} value={curr.value}>{curr.label}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Typography sx={{ fontSize: 12, color: colors.textSecondary, mb: 2 }}>
                Charge different prices for different quantity ranges. Each unit is priced at the tier it falls into.
            </Typography>

            {/* Table Header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>
                    First unit
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>
                    Last unit
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>
                    Per unit
                </Typography>
                <Box />
            </Box>

            {/* Tier Rows */}
            {tiers.map((tier, index) => (
                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: 1, mb: 1 }}>
                    <TextField
                        size="small"
                        value={index === 0 ? '1' : (tiers[index - 1]?.upTo || 0) + 1}
                        disabled
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: colors.inputBg,
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: colors.border },
                                '& input': { color: colors.textSecondary, fontSize: 14 },
                            },
                        }}
                    />
                    <TextField
                        size="small"
                        placeholder="∞"
                        type="number"
                        value={tier.upTo || ''}
                        onChange={(e) => handleTierChange(index, 'upTo', e.target.value ? parseInt(e.target.value) : null)}
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
                    <TextField
                        size="small"
                        type="number"
                        placeholder="0.00"
                        value={tier.unitPrice || ''}
                        onChange={(e) => handleTierChange(index, 'unitPrice', e.target.value)}
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
                    <IconButton
                        size="small"
                        onClick={() => onRemoveTier(index)}
                        disabled={tiers.length === 1}
                        sx={{ color: colors.textSecondary, '&:hover': { color: '#ef4444' } }}
                    >
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                </Box>
            ))}

            {/* Add Tier Button */}
            <Box
                onClick={onAddTier}
                sx={{
                    mt: 2,
                    p: 1.5,
                    border: `1px dashed ${colors.border}`,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': {
                        borderColor: '#7c3aed',
                        bgcolor: 'rgba(124, 58, 237, 0.05)',
                    },
                }}
            >
                <AddIcon sx={{ fontSize: 18, color: '#7c3aed' }} />
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#7c3aed' }}>
                    Add tier
                </Typography>
            </Box>
        </Box>
    )
}

export default GraduatedPricingTable
