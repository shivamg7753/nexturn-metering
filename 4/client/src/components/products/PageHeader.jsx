import { Box, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import BarChartIcon from '@mui/icons-material/BarChart'

function PageHeader({ colors, onCreateProduct, onAnalyse }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={{
                fontSize: 24,
                fontWeight: 700,
                color: colors.text,
            }}>
                Product catalogue
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                    variant="outlined"
                    startIcon={<BarChartIcon sx={{ fontSize: 18 }} />}
                    onClick={onAnalyse}
                    sx={{
                        px: 2,
                        py: 0.75,
                        borderColor: colors.border,
                        color: colors.textSecondary,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: 14,
                        '&:hover': {
                            borderColor: colors.textMuted,
                            bgcolor: 'transparent',
                        },
                    }}
                >
                    Analyse
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreateProduct}
                    sx={{
                        px: 2,
                        py: 0.75,
                        bgcolor: '#7c3aed',
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 14,
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: '#6d28d9',
                            boxShadow: 'none',
                        },
                    }}
                >
                    Create product
                    <Box component="span" sx={{
                        ml: 1,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        px: 0.75,
                        py: 0.25,
                        fontSize: 12,
                    }}>
                        N
                    </Box>
                </Button>
            </Box>
        </Box>
    )
}

export default PageHeader
