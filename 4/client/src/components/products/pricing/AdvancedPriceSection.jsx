import { Box, Typography, TextField } from '@mui/material'

function AdvancedPriceSection({
    priceDescription,
    lookupKey,
    onPriceDescriptionChange,
    onLookupKeyChange,
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
                Advanced
            </Typography>

            {/* Price Description */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5
                }}>
                    Price description
                </Typography>
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mb: 1
                }}>
                    Use to organise your prices. Not shown to customers.
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter description"
                    value={priceDescription}
                    onChange={(e) => onPriceDescriptionChange(e.target.value)}
                    sx={{
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
            </Box>

            {/* Lookup Key */}
            <Box>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5
                }}>
                    Lookup key
                </Typography>
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mb: 1
                }}>
                    Lookup keys make it easier to migrate and make future pricing changes by using a...
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter lookup key"
                    value={lookupKey}
                    onChange={(e) => onLookupKeyChange(e.target.value)}
                    sx={{
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
                            fontFamily: 'monospace',
                        },
                    }}
                />
            </Box>
        </Box>
    )
}

export default AdvancedPriceSection
