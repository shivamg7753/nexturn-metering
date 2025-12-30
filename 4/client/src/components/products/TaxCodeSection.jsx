import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material'

const TAX_CODES = [
    { value: 'general-electronic', label: 'General - Electronically Supplied Services' },
    { value: 'general-tangible', label: 'General - Tangible Goods' },
    { value: 'preset-none', label: 'Preset: None' },
    { value: 'preset-general', label: 'Preset: General' },
]

function TaxCodeSection({ taxCode, onTaxCodeChange, colors }) {
    const selectedTax = TAX_CODES.find(t => t.value === taxCode)

    return (
        <Box sx={{ mb: 3 }}>
            <Typography sx={{
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                mb: 0.5
            }}>
                Product tax code
            </Typography>
            <Typography sx={{
                fontSize: 12,
                color: colors.textSecondary,
                mb: 1
            }}>
                This will be used for calculating automatic tax. Defaults to the preset product tax code from your{' '}
                <Box component="span" sx={{ color: '#7c3aed', cursor: 'pointer' }}>tax settings</Box>.{' '}
                <Box component="span" sx={{ color: '#7c3aed', cursor: 'pointer' }}>View docs</Box>
            </Typography>

            <FormControl fullWidth size="small">
                <Select
                    value={taxCode}
                    onChange={(e) => onTaxCodeChange(e.target.value)}
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
                    {TAX_CODES.map(code => (
                        <MenuItem key={code.value} value={code.value}>
                            {code.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Tax Description */}
            <Typography sx={{
                fontSize: 12,
                color: colors.textSecondary,
                mt: 1,
                lineHeight: 1.5,
            }}>
                A digital service provided mainly through the internet with minimal human involvement, relying on information technology.
                {' '}
                <Box component="span" sx={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 500 }}>
                    Show more
                </Box>
            </Typography>
        </Box>
    )
}

export default TaxCodeSection
