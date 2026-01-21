import { Box, Typography, IconButton } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'

function CustomerDetailsPanel({ customer, colors, isDark }) {
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        const date = new Date(dateString)
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return monthDay
    }

    return (
        <Box
            sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                p: 3,
                position: 'sticky',
                top: 24,
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1.125rem' }}>
                    Details
                </Typography>
                <IconButton
                    size="small"
                    sx={{
                        color: colors.textSecondary,
                        '&:hover': { bgcolor: colors.hover },
                    }}
                >
                    <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            {/* Details List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Customer ID */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Customer ID
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: colors.accent, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            {customer?.customerId || '—'}
                        </Typography>
                        {customer?.customerId && (
                            <IconButton
                                size="small"
                                onClick={() => handleCopy(customer.customerId)}
                                sx={{
                                    color: colors.textTertiary,
                                    p: 0.5,
                                    '&:hover': { bgcolor: colors.hover },
                                }}
                            >
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* Customer since */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Customer since
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                            ⏱
                        </Typography>
                        <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                            {formatDate(customer?.createdAt)}
                        </Typography>
                    </Box>
                </Box>

                {/* Billing emails */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Billing emails
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: colors.accent, fontSize: '0.875rem' }}>
                            {customer?.email || '—'}
                        </Typography>
                        {customer?.email && (
                            <IconButton
                                size="small"
                                onClick={() => handleCopy(customer.email)}
                                sx={{
                                    color: colors.textTertiary,
                                    p: 0.5,
                                    '&:hover': { bgcolor: colors.hover },
                                }}
                            >
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* Business name */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Business name
                    </Typography>
                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                        {customer?.businessName || '—'}
                    </Typography>
                </Box>

                {/* Individual name */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Individual name
                    </Typography>
                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                        {customer?.individualName || '—'}
                    </Typography>
                </Box>

                {/* Billing details */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Billing details
                    </Typography>
                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                        {customer?.billingDetails || '—'}
                    </Typography>
                </Box>

                {/* Language */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Language
                    </Typography>
                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                        {customer?.language || 'English (United States)'}
                    </Typography>
                </Box>

                {/* Next invoice number */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Next invoice number
                    </Typography>
                    <Typography sx={{ color: colors.text, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                        {customer?.nextInvoiceNumber || '—'}
                    </Typography>
                </Box>

                {/* Tax location status */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Tax location status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ color: '#f59e0b', fontSize: '0.875rem' }}>
                            ⚠
                        </Typography>
                        <Typography sx={{ color: '#f59e0b', fontSize: '0.875rem' }}>
                            {customer?.taxLocationStatus || 'Unknown location'}
                        </Typography>
                    </Box>
                </Box>

                {/* Tax status and IDs */}
                <Box>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                        Tax status and IDs
                    </Typography>
                    <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>
                        {customer?.taxStatus || 'Taxable'}
                    </Typography>
                    <Typography
                        sx={{
                            color: colors.accent,
                            fontSize: '0.875rem',
                            mt: 0.5,
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        Show less
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default CustomerDetailsPanel
