import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import BarChartIcon from '@mui/icons-material/BarChart'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import { fetchSubscriptions } from '../api/subscriptionApi'
import { formatPriceDisplay, getPricingDescription, formatCurrency } from '../utils/priceFormatters'

function SubscriptionsPage({ themeMode }) {
    const isDark = themeMode === 'dark'
    const navigate = useNavigate()

    const colors = {
        bg: isDark ? '#0a0a0a' : '#f8f9fa',
        cardBg: isDark ? '#1a1a1a' : '#ffffff',
        border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        text: isDark ? '#ffffff' : '#1a1a1a',
        textSecondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        textTertiary: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        accent: '#8b5cf6',
        hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        activeTab: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
    }

    const [subscriptions, setSubscriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadSubscriptions()
    }, [])

    const loadSubscriptions = async () => {
        try {
            setLoading(true)
            const data = await fetchSubscriptions()
            setSubscriptions(data)
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

    const filterSubscriptions = () => {
        let filtered = subscriptions

        // Filter by status based on active tab
        if (activeTab === 0) {
            filtered = filtered.filter(sub => sub.status === 'active')
        } else if (activeTab === 1) {
            filtered = filtered.filter(sub => sub.status === 'scheduled')
        } else if (activeTab === 2) {
            filtered = filtered.filter(sub => sub.status === 'canceled')
        } else if (activeTab === 3) {
            filtered = filtered.filter(sub => sub.status === 'simulated')
        }
        // activeTab === 4 means "All", no filtering

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(sub => {
                const customerEmail = typeof sub.customerId === 'object' ? sub.customerId?.email : sub.customerId
                const customerName = typeof sub.customerId === 'object' ? sub.customerId?.name : ''

                return (
                    customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sub.products.some(p => p.productName?.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            })
        }

        return filtered
    }

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(new Date(date))
    }

    const calculateMonthlyTotal = (subscription) => {
        return subscription.products.reduce((sum, product) => {
            const price = product.price || 0
            const quantity = product.quantity || 1
            return sum + (price * quantity)
        }, 0)
    }

    const calculateYearlyTotal = (subscription) => {
        return calculateMonthlyTotal(subscription) * 12
    }

    const filteredSubscriptions = filterSubscriptions()

    return (
        <Box sx={{ p: 3, bgcolor: colors.bg, minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: colors.text, fontSize: '1.75rem', fontWeight: 600 }}>
                    Subscriptions
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                        '&:hover': {
                            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                        },
                    }}
                >
                    Create test subscription
                </Button>
            </Box>

            {/* Tabs */}
            <Box sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        borderBottom: `1px solid ${colors.border}`,
                        '& .MuiTab-root': {
                            color: colors.textSecondary,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            minHeight: 48,
                            '&.Mui-selected': {
                                color: colors.accent,
                            },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: colors.accent,
                        },
                    }}
                >
                    <Tab label="Active" />
                    <Tab label="Scheduled" />
                    <Tab label="Canceled" />
                    <Tab label="Simulated" />
                    <Tab label="All" />
                </Tabs>
            </Box>

            {/* Filters and Actions */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search subscriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: colors.textSecondary, fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        width: 300,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: colors.cardBg,
                            borderRadius: 2,
                            '& fieldset': { borderColor: colors.border },
                            '&:hover fieldset': { borderColor: colors.border },
                            '&.Mui-focused fieldset': { borderColor: colors.accent },
                        },
                        '& .MuiOutlinedInput-input': {
                            color: colors.text,
                            fontSize: '0.875rem',
                        },
                    }}
                />
                <Box sx={{ flex: 1 }} />
                <Button
                    startIcon={<FileDownloadIcon />}
                    sx={{
                        color: colors.textSecondary,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': { bgcolor: colors.hover },
                    }}
                >
                    Export
                </Button>
                <Button
                    startIcon={<BarChartIcon />}
                    sx={{
                        color: colors.textSecondary,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': { bgcolor: colors.hover },
                    }}
                >
                    Analyze
                </Button>
                <Button
                    startIcon={<ViewColumnIcon />}
                    sx={{
                        color: colors.textSecondary,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': { bgcolor: colors.hover },
                    }}
                >
                    Edit columns
                </Button>
            </Box>

            {/* Table */}
            <TableContainer sx={{ bgcolor: colors.cardBg, borderRadius: 2, border: `1px solid ${colors.border}` }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Customer</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Status</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Customer name</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Customer description</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Billing</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Tax calculation</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Product</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Created</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Average monthly total</TableCell>
                            <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>Average yearly total</TableCell>
                            <TableCell sx={{ borderBottom: `1px solid ${colors.border}` }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={11} sx={{ textAlign: 'center', py: 6, color: colors.textSecondary, borderBottom: 'none' }}>
                                    Loading subscriptions...
                                </TableCell>
                            </TableRow>
                        ) : filteredSubscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} sx={{ textAlign: 'center', py: 6, color: colors.textSecondary, borderBottom: 'none' }}>
                                    No subscriptions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSubscriptions.map((subscription) => (
                                <TableRow
                                    key={subscription._id}
                                    onClick={() => navigate(`/subscriptions/${subscription._id}`)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: colors.hover },
                                        borderBottom: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <TableCell sx={{ color: colors.text, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        {typeof subscription.customerId === 'object'
                                            ? subscription.customerId?.email || subscription.customerId?._id || '-'
                                            : subscription.customerId || '-'}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: 'none' }}>
                                        <Chip
                                            label={subscription.status}
                                            size="small"
                                            sx={{
                                                bgcolor: subscription.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : colors.hover,
                                                color: subscription.status === 'active' ? '#22c55e' : colors.textSecondary,
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                height: 24,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        {typeof subscription.customerId === 'object'
                                            ? subscription.customerId?.name || '-'
                                            : '-'}
                                    </TableCell>
                                    <TableCell sx={{ color: colors.textSecondary, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        -
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        Auto
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        {subscription.collectTaxAutomatically ? 'Auto' : 'None'}
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        {subscription.products.map(p => p.productName).join(', ') || '-'}
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        {formatDate(subscription.createdAt)}
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        {subscription.products.length > 0 && subscription.products[0].priceDetails
                                            ? `${formatCurrency(calculateMonthlyTotal(subscription), subscription.products[0].currency || 'USD')} / month`
                                            : 'Varies with usage'}
                                    </TableCell>
                                    <TableCell sx={{ color: colors.text, fontSize: '0.875rem', borderBottom: 'none' }}>
                                        {subscription.products.length > 0 && subscription.products[0].priceDetails
                                            ? `${formatCurrency(calculateYearlyTotal(subscription), subscription.products[0].currency || 'USD')} / year`
                                            : 'Varies with usage'}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: 'none' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // Handle menu open
                                            }}
                                            sx={{ color: colors.textSecondary }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Footer */}
            {!loading && filteredSubscriptions.length > 0 && (
                <Box sx={{ mt: 2, px: 2 }}>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                        {filteredSubscriptions.length} item{filteredSubscriptions.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>
            )}
        </Box>
    )
}

export default SubscriptionsPage
