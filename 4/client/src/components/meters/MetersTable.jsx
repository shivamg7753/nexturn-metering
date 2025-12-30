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
    Chip,
    IconButton,
    LinearProgress
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { gradientBg } from '../../theme/styles'

function MetersTable({
    meters,
    loading,
    onMenuOpen,
    glassStyle,
    colors,
    themeMode = 'dark'
}) {
    const isDark = themeMode === 'dark'

    return (
        <>
            {loading && (
                <LinearProgress
                    sx={{
                        mb: 2,
                        borderRadius: 1,
                        bgcolor: 'rgba(139, 92, 246, 0.1)',
                        '& .MuiLinearProgress-bar': gradientBg
                    }}
                />
            )}

            <TableContainer component={Paper} elevation={0} sx={{
                ...glassStyle,
                borderRadius: 3,
                overflow: 'hidden',
            }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: colors.tableHeaderBg }}>
                            <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: 11, py: 2.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Display Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Status
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Event Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Aggregation
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Ingestion
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Created
                            </TableCell>
                            <TableCell sx={{ width: 50 }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {meters.map((meter, index) => (
                            <TableRow
                                key={meter.id}
                                sx={{
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: colors.activeBg,
                                    },
                                    animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                                }}
                            >
                                <TableCell sx={{ py: 2.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 2,
                                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(124, 58, 237, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <ReceiptIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
                                        </Box>
                                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                                            {meter.displayName}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={meter.status}
                                        size="small"
                                        sx={{
                                            bgcolor: meter.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                            color: meter.status === 'Active' ? '#22c55e' : '#f59e0b',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            height: 24,
                                            border: meter.status === 'Active' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                                            px: 1,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{
                                        fontSize: 12,
                                        color: colors.textSecondary,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 1,
                                        display: 'inline-block',
                                    }}>
                                        {meter.eventName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            ...gradientBg,
                                        }} />
                                        <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                                            {meter.aggregationMethod}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontSize: 13, color: colors.textSecondary }}>
                                    {meter.eventIngestion}
                                </TableCell>
                                <TableCell sx={{ fontSize: 13, color: colors.textMuted }}>
                                    {meter.created}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => onMenuOpen(e, meter)}
                                        sx={{
                                            color: colors.textSecondary,
                                            '&:hover': { color: '#8b5cf6', bgcolor: colors.activeBg }
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
        </>
    )
}

export default MetersTable
