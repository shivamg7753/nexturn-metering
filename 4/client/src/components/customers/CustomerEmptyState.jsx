import { Box, Typography, Button } from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

function CustomerEmptyState({ colors, onAddCustomer }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                py: 8,
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: colors.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                <PersonOutlineIcon
                    sx={{
                        fontSize: 32,
                        color: colors.accent,
                    }}
                />
            </Box>

            {/* Heading */}
            <Typography
                variant="h5"
                sx={{
                    color: colors.text,
                    fontWeight: 600,
                    mb: 1,
                    fontSize: '1.25rem',
                }}
            >
                Add your first test customer
            </Typography>

            {/* Description */}
            <Typography
                sx={{
                    color: colors.textSecondary,
                    mb: 0.5,
                    fontSize: '0.875rem',
                }}
            >
                Bill customers with one-off or recurring invoices, or subscriptions.
            </Typography>

            {/* Learn more link */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    component="a"
                    href="#"
                    sx={{
                        color: colors.accent,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        '&:hover': {
                            textDecoration: 'underline',
                        },
                    }}
                >
                    Learn more →
                </Typography>
            </Box>

            {/* Add customer button */}
            <Button
                variant="contained"
                startIcon={<span style={{ fontSize: '1.2rem' }}>+</span>}
                onClick={onAddCustomer}
                sx={{
                    background: colors.buttonBg,
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                    },
                }}
            >
                Add a test customer
            </Button>
        </Box>
    )
}

export default CustomerEmptyState
