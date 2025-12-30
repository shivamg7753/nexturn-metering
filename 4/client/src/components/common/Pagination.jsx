import { Box, Typography, Button } from '@mui/material'

function Pagination({
    totalItems,
    currentPage = 1,
    onPrevious,
    onNext,
    itemLabel = 'items',
    themeMode = 'dark'
}) {
    const isDark = themeMode === 'dark'
    const textMuted = isDark ? '#64748b' : '#64748b'

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Typography sx={{ fontSize: 13, color: textMuted }}>
                Showing {totalItems} {itemLabel}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={onPrevious}
                    sx={{
                        fontSize: 12,
                        color: textMuted,
                        '&.Mui-disabled': { color: isDark ? '#374151' : '#9ca3af' }
                    }}
                >
                    Previous
                </Button>
                <Box sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#a78bfa' }}>
                        {currentPage}
                    </Typography>
                </Box>
                <Button
                    size="small"
                    onClick={onNext}
                    sx={{ fontSize: 12, color: '#94a3b8' }}
                >
                    Next
                </Button>
            </Box>
        </Box>
    )
}

export default Pagination
