import { Box, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

function CustomerSubscriptionsSection({ customer, colors }) {
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
                <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
                    Subscriptions
                </Typography>
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
                    No subscriptions
                </Typography>
            </Box>
        </Box>
    )
}

export default CustomerSubscriptionsSection
