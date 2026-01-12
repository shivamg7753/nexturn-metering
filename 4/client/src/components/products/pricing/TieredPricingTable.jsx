import { Box, Typography, TextField, IconButton, Select, MenuItem, FormControl } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']

function TieredPricingTable({ tiers, currency, onTiersChange, onCurrencyChange, onAddTier, onRemoveTier, colors }) {
    const handleTierChange = (index, field, value) => {
        const newTiers = [...tiers]
        newTiers[index] = { ...newTiers[index], [field]: value }
        onTiersChange(newTiers)
    }

    const getCurrencySymbol = (curr) => {
        const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$' }
        return symbols[curr] || '$'
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
                >
                    {CURRENCIES.map(curr => (
                        <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Table Header */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 40px',
                gap: 1,
                mb: 1,
            }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>First unit</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Last unit</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Per unit</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Flat fee</Typography>
                <Box />
            </Box>

            {/* Tier Rows */}
            {tiers.map((tier, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 40px',
                        gap: 1,
                        mb: 1,
                        alignItems: 'center',
                    }}
                >
                    {/* First Unit */}
                    <TextField
                        size="small"
                        value={tier.firstUnit}
                        onChange={(e) => handleTierChange(index, 'firstUnit', e.target.value)}
                        disabled={index === 0}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: colors.inputBg,
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: colors.border },
                            },
                            '& .MuiInputBase-input': {
                                color: colors.text,
                                fontSize: 13,
                            },
                            '& .Mui-disabled': {
                                bgcolor: 'rgba(0,0,0,0.04)',
                            },
                        }}
                    />

                    {/* Last Unit */}
                    <TextField
                        size="small"
                        value={tier.lastUnit}
                        onChange={(e) => handleTierChange(index, 'lastUnit', e.target.value)}
                        placeholder={index === tiers.length - 1 ? '∞' : ''}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: colors.inputBg,
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: colors.border },
                            },
                            '& .MuiInputBase-input': {
                                color: colors.text,
                                fontSize: 13,
                            },
                        }}
                    />

                    {/* Per Unit */}
                    <TextField
                        size="small"
                        type="number"
                        value={tier.perUnit}
                        onChange={(e) => handleTierChange(index, 'perUnit', e.target.value)}
                        placeholder="0"
                        InputProps={{
                            startAdornment: (
                                <Typography sx={{ color: colors.textSecondary, mr: 0.5, fontSize: 13 }}>
                                    {getCurrencySymbol(currency)}
                                </Typography>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: colors.inputBg,
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: colors.border },
                            },
                            '& .MuiInputBase-input': {
                                color: colors.text,
                                fontSize: 13,
                            },
                        }}
                    />

                    {/* Flat Fee */}
                    <TextField
                        size="small"
                        type="number"
                        value={tier.flatFee}
                        onChange={(e) => handleTierChange(index, 'flatFee', e.target.value)}
                        placeholder="0"
                        InputProps={{
                            startAdornment: (
                                <Typography sx={{ color: colors.textSecondary, mr: 0.5, fontSize: 13 }}>
                                    {getCurrencySymbol(currency)}
                                </Typography>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: colors.inputBg,
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: colors.border },
                            },
                            '& .MuiInputBase-input': {
                                color: colors.text,
                                fontSize: 13,
                            },
                        }}
                    />

                    {/* Remove Button */}
                    {tiers.length > 1 && (
                        <IconButton
                            size="small"
                            onClick={() => onRemoveTier(index)}
                            sx={{ color: colors.textMuted }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            ))}

            {/* Add Another Tier */}
            <Box
                onClick={onAddTier}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    mt: 1,
                    '&:hover': {
                        '& .add-text': {
                            color: '#6d28d9',
                        }
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
                    Add another tier
                </Typography>
            </Box>
        </Box>
    )
}

export default TieredPricingTable
