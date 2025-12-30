import { Box, Typography, Button } from '@mui/material'

function Pagination({ totalCount, page, totalPages, onPageChange, colors }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 1 }}>
            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                {totalCount} results
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                    size="small"
                    disabled={page === 1}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    sx={{
                        fontSize: 13,
                        color: page === 1 ? colors.textMuted : colors.textSecondary,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&.Mui-disabled': { color: colors.textMuted }
                    }}
                >
                    Previous
                </Button>
                <Button
                    size="small"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    sx={{
                        fontSize: 13,
                        color: page >= totalPages ? colors.textMuted : colors.textSecondary,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&.Mui-disabled': { color: colors.textMuted }
                    }}
                >
                    Next
                </Button>
            </Box>
        </Box>
    )
}

export default Pagination
