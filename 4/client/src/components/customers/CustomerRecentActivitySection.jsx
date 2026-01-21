import { Box, Typography, Button } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'

function CustomerRecentActivitySection({ customer, colors }) {
    const formatActivityDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const year = date.getFullYear()
        const time = date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        return `${monthDay}, ${year}, ${time}`
    }

    return (
        <Box
            sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                overflow: 'hidden',
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
                    Recent activity
                </Typography>
                <Button
                    size="small"
                    startIcon={<span style={{ fontSize: '1rem' }}>+</span>}
                    sx={{
                        color: colors.textSecondary,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': { bgcolor: colors.hover },
                    }}
                >
                    Add note
                </Button>
            </Box>

            {/* Activity Timeline */}
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Timeline Icon */}
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: colors.accent + '20',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <PersonIcon sx={{ fontSize: 16, color: colors.accent }} />
                    </Box>

                    {/* Activity Content */}
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: colors.text, fontSize: '0.875rem', mb: 0.5 }}>
                            Customer was created
                        </Typography>
                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                            {formatActivityDate(customer?.createdAt)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default CustomerRecentActivitySection
