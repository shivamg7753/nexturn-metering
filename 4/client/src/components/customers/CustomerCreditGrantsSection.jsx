import { Box, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

function CustomerCreditGrantsSection({ customer, colors }) {
    return (
        <Box
            sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                overflow: 'hidden',
                mb: 3,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    borderBottom: `1px solid ${colors.border}`,
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                        Credit grants
                    </Typography>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                        Manage prepaid and promotional credits for usage-based billing that can apply to invoices pre-tax.{' '}
                        <Typography
                            component="span"
                            sx={{
                                color: colors.accent,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            View docs
                        </Typography>
                    </Typography>
                </Box>
                <Button
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    sx={{
                        color: colors.textSecondary,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        minWidth: 'auto',
                        '&:hover': { bgcolor: colors.hover },
                    }}
                >
                </Button>
            </Box>

            {/* Empty State */}
            <Box
                sx={{
                    p: 6,
                    textAlign: 'center',
                }}
            >
                <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    No credit grants
                </Typography>
            </Box>
        </Box>
    )
}

export default CustomerCreditGrantsSection
