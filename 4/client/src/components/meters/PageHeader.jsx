import { Box, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { gradientBg } from '../../theme/styles'

function PageHeader({
    title,
    subtitle,
    onCreateClick,
    createButtonText = 'Create',
    showImportButton = false,
    colors
}) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
                <Typography sx={{
                    fontSize: 28,
                    fontWeight: 800,
                    mb: 0.5,
                    background: colors.headerGradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    {title}
                </Typography>
                <Typography sx={{ color: colors.textMuted, fontSize: 14 }}>
                    {subtitle}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {showImportButton && (
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            borderColor: colors.border,
                            color: colors.textSecondary,
                            px: 2.5,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: '#7c3aed',
                                bgcolor: 'rgba(124, 58, 237, 0.05)',
                            }
                        }}
                    >
                        Import Events
                    </Button>
                )}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreateClick}
                    sx={{
                        ...gradientBg,
                        px: 2.5,
                        py: 1,
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                        '&:hover': {
                            boxShadow: '0 6px 30px rgba(139, 92, 246, 0.5)',
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.25s ease',
                    }}
                >
                    {createButtonText}
                </Button>
            </Box>
        </Box>
    )
}

export default PageHeader
