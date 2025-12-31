import { useState } from 'react'
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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

function ProductsTable({ products, colors, isDark, onProductAction, onEditProduct, onDeleteProduct }) {
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)

    const handleMenuOpen = (event, product) => {
        setAnchorEl(event.currentTarget)
        setSelectedProduct(product)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedProduct(null)
    }

    const handleEdit = () => {
        if (selectedProduct) {
            onEditProduct?.(selectedProduct)
        }
        handleMenuClose()
    }

    const handleDelete = () => {
        if (selectedProduct) {
            onDeleteProduct?.(selectedProduct)
        }
        handleMenuClose()
    }

    return (
        <>
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
                                        onClick={(e) => handleMenuOpen(e, product)}
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

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.border}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        minWidth: 160,
                        mt: 0.5,
                    }
                }}
            >
                <MenuItem
                    onClick={handleEdit}
                    sx={{
                        fontSize: 14,
                        color: colors.text,
                        py: 1,
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124, 58, 237, 0.05)',
                        }
                    }}
                >
                    <ListItemIcon>
                        <EditOutlinedIcon fontSize="small" sx={{ color: colors.text }} />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={handleDelete}
                    sx={{
                        fontSize: 14,
                        color: '#ef4444',
                        py: 1,
                        '&:hover': {
                            bgcolor: 'rgba(239, 68, 68, 0.05)',
                        }
                    }}
                >
                    <ListItemIcon>
                        <DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444' }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </>
    )
}

export default ProductsTable
