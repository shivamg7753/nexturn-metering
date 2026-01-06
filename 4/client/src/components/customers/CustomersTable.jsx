import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

function CustomersTable({ customers, colors, isDark, onEditCustomer, onDeleteCustomer }) {
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [selectedRows, setSelectedRows] = useState([])

    const handleMenuOpen = (event, customer) => {
        setAnchorEl(event.currentTarget)
        setSelectedCustomer(customer)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedCustomer(null)
    }

    const handleCreateInvoice = () => {
        console.log('Create invoice for:', selectedCustomer)
        handleMenuClose()
    }

    const handleCreateSubscription = () => {
        console.log('Create subscription for:', selectedCustomer)
        handleMenuClose()
    }

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedRows(customers.map(c => c.id))
        } else {
            setSelectedRows([])
        }
    }

    const handleSelectRow = (customerId) => {
        setSelectedRows(prev => {
            if (prev.includes(customerId)) {
                return prev.filter(id => id !== customerId)
            } else {
                return [...prev, customerId]
            }
        })
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, '0')
        const month = date.toLocaleString('en-US', { month: 'short' })
        const time = date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toLowerCase()
        return `${day}-${month}, ${time}`
    }

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" sx={{ width: 48 }}>
                                <Checkbox
                                    checked={selectedRows.length === customers.length && customers.length > 0}
                                    indeterminate={selectedRows.length > 0 && selectedRows.length < customers.length}
                                    onChange={handleSelectAll}
                                    sx={{
                                        color: colors.textTertiary,
                                        '&.Mui-checked': {
                                            color: colors.accent,
                                        },
                                        '&.MuiCheckbox-indeterminate': {
                                            color: colors.accent,
                                        },
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ color: colors.textTertiary, fontWeight: 600, fontSize: '0.75rem' }}>
                                Customer
                            </TableCell>
                            <TableCell sx={{ color: colors.textTertiary, fontWeight: 600, fontSize: '0.75rem' }}>
                                Email
                            </TableCell>
                            <TableCell sx={{ color: colors.textTertiary, fontWeight: 600, fontSize: '0.75rem' }}>
                                Primary payment method
                            </TableCell>
                            <TableCell sx={{ color: colors.textTertiary, fontWeight: 600, fontSize: '0.75rem' }}>
                                Created
                            </TableCell>
                            <TableCell sx={{ width: 48 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow
                                key={customer.id}
                                sx={{
                                    '&:hover': {
                                        bgcolor: colors.hover,
                                    },
                                    borderBottom: `1px solid ${colors.border}`,
                                }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedRows.includes(customer.id)}
                                        onChange={() => handleSelectRow(customer.id)}
                                        sx={{
                                            color: colors.textTertiary,
                                            '&.Mui-checked': {
                                                color: colors.accent,
                                            },
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            color: colors.text,
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {customer.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            color: colors.textSecondary,
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {customer.email}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            color: colors.textSecondary,
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {customer.paymentMethod || '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            color: colors.textSecondary,
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {formatDate(customer.createdAt)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, customer)}
                                        sx={{
                                            color: colors.textTertiary,
                                            '&:hover': {
                                                bgcolor: colors.hover,
                                            },
                                        }}
                                    >
                                        <MoreVertIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Footer with item count */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: `1px solid ${colors.border}`,
                }}
            >
                <Typography
                    sx={{
                        color: colors.textSecondary,
                        fontSize: '0.875rem',
                    }}
                >
                    {customers.length} item{customers.length !== 1 ? 's' : ''}
                </Typography>
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 2,
                        minWidth: 200,
                        boxShadow: isDark
                            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                            : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    onClick={handleCreateInvoice}
                    sx={{
                        color: colors.text,
                        fontSize: '0.875rem',
                        py: 1.5,
                        '&:hover': {
                            bgcolor: colors.hover,
                        },
                    }}
                >
                    Create invoice
                </MenuItem>
                <MenuItem
                    onClick={handleCreateSubscription}
                    sx={{
                        color: colors.text,
                        fontSize: '0.875rem',
                        py: 1.5,
                        '&:hover': {
                            bgcolor: colors.hover,
                        },
                    }}
                >
                    Create subscription
                </MenuItem>
            </Menu>
        </>
    )
}

export default CustomersTable
