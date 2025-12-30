import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material'

function PricingTypeToggle({ pricingType, onPricingTypeChange, colors }) {
    return (
        <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
                value={pricingType}
                exclusive
                onChange={(e, value) => value && onPricingTypeChange(value)}
                sx={{
                    width: '100%',
                    bgcolor: colors.inputBg,
                    borderRadius: 2,
                    border: `1px solid ${colors.border}`,
                    p: 0.5,
                    '& .MuiToggleButton-root': {
                        flex: 1,
                        border: 'none',
                        borderRadius: 1.5,
                        py: 1.5,
                        textTransform: 'none',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        px: 2,
                        '&.Mui-selected': {
                            bgcolor: '#fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '2px solid #7c3aed',
                            '&:hover': {
                                bgcolor: '#fff',
                            }
                        },
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.02)',
                        }
                    }
                }}
            >
                <ToggleButton value="recurring">
                    <Typography sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.text,
                        textAlign: 'left',
                    }}>
                        Recurring
                    </Typography>
                    <Typography sx={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        textAlign: 'left',
                        mt: 0.25,
                    }}>
                        Charge an ongoing fee
                    </Typography>
                </ToggleButton>
                <ToggleButton value="one-off">
                    <Typography sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.text,
                        textAlign: 'left',
                    }}>
                        One-off
                    </Typography>
                    <Typography sx={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        textAlign: 'left',
                        mt: 0.25,
                    }}>
                        Charge a one-off fee
                    </Typography>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    )
}

export default PricingTypeToggle
