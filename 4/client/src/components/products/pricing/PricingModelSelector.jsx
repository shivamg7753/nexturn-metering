import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

const PRICING_MODELS = [
    {
        value: 'flat-rate',
        label: 'Flat rate',
        description: 'Offer a fixed price for a single unit or package.',
        docLink: true,
    },
    {
        value: 'package',
        label: 'Package pricing',
        description: 'Price by package, bundle, or group of units.',
    },
    {
        value: 'tiered',
        label: 'Tiered pricing',
        description: 'Offer different price points based on unit quantity.',
    },
    {
        value: 'usage-based',
        label: 'Usage-based',
        description: 'Pay-as-you-go billing based on metered usage.',
    },
]

function PricingModelSelector({ pricingModel, onPricingModelChange, colors }) {
    const selectedModel = PRICING_MODELS.find(m => m.value === pricingModel)

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

            {/* Description with doc link */}
            {selectedModel && (
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
        </Box>
    )
}

export default PricingModelSelector
export { PRICING_MODELS }
