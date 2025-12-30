import { Box, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

function SelectedMeterDisplay({ meterName, onRemove, colors }) {
    if (!meterName) return null

    return (
        <Box sx={{ mb: 3 }}>
            <Typography sx={{
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                mb: 0.5
            }}>
                Meter
            </Typography>
            <Typography sx={{
                fontSize: 12,
                color: colors.textSecondary,
                mb: 1
            }}>
                Link to a meter to price your customers usage.{' '}
                <Box component="span" sx={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 500 }}>
                    View docs
                </Box>
            </Typography>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1,
            }}>
                <Typography sx={{
                    fontSize: 14,
                    color: colors.text,
                    fontFamily: 'monospace',
                }}>
                    {meterName}
                </Typography>
                <Box
                    onClick={onRemove}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        color: '#ef4444',
                        '&:hover': {
                            color: '#dc2626',
                        }
                    }}
                >
                    <CloseIcon sx={{ fontSize: 14 }} />
                    <Typography sx={{
                        fontSize: 13,
                        fontWeight: 500,
                    }}>
                        Remove
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default SelectedMeterDisplay
