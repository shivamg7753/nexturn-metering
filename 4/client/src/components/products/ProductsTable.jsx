import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Checkbox,
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RefreshIcon from '@mui/icons-material/Refresh'

function ProductsTable({ products, colors, isDark, onProductAction }) {
    return (
        <TableContainer component={Paper} elevation={0} sx={{
            bgcolor: colors.cardBg,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
        }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: colors.headerBg }}>
                        <TableCell padding="checkbox" sx={{ borderColor: colors.border }}>
                            <Checkbox size="small" sx={{ color: colors.textMuted }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: colors.textSecondary, fontSize: 13, py: 2, borderColor: colors.border }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: colors.textSecondary, fontSize: 13, borderColor: colors.border }}>Pricing</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: colors.textSecondary, fontSize: 13, borderColor: colors.border }}>Tax category</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: colors.textSecondary, fontSize: 13, borderColor: colors.border }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: colors.textSecondary, fontSize: 13, borderColor: colors.border }}>Updated</TableCell>
                        <TableCell sx={{ width: 50, borderColor: colors.border }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableRow
                            key={product.id}
                            sx={{
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(124, 58, 237, 0.03)',
                                },
                                '& td': {
                                    borderColor: colors.border,
                                }
                            }}
                        >
                            <TableCell padding="checkbox">
                                <Checkbox size="small" sx={{ color: colors.textMuted }} />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1.5,
                                        bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#f0ebff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <RefreshIcon sx={{ color: '#7c3aed', fontSize: 16 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: colors.text }}>{product.name}</Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                                    {product.pricing}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography sx={{
                                    fontSize: 13,
                                    color: colors.textSecondary,
                                    maxWidth: 250,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {product.taxCategory}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: 13, color: colors.textSecondary }}>{product.created}</TableCell>
                            <TableCell sx={{ fontSize: 13, color: colors.textSecondary }}>{product.updated || product.created}</TableCell>
                            <TableCell>
                                <IconButton
                                    size="small"
                                    onClick={() => onProductAction?.(product)}
                                    sx={{
                                        color: colors.textMuted,
                                        '&:hover': { color: colors.text, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
                                    }}
                                >
                                    <MoreHorizIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default ProductsTable
