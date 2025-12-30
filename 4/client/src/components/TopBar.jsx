import {
    Box,
    Typography,
    IconButton,
    Divider,
    Avatar,
    Tooltip,
} from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import SettingsIcon from '@mui/icons-material/Settings'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { gradientBg, getThemeColors } from '../theme/styles'

function TopBar({ activePage, themeMode, onThemeToggle }) {
    // Get page title from key
    const getPageTitle = (key) => {
        const titles = {
            'home': 'Home',
            'balances': 'Balances',
            'transactions': 'Transactions',
            'customers': 'Customers',
            'products': 'Product Catalogue',
            'revenue': 'Revenue Recovery',
            'usage-billing': 'Usage Billing',
            'billing-overview': 'Billing Overview',
            'invoices': 'Invoices',
            'subscriptions': 'Subscriptions',
            'payments': 'Payments',
            'billing': 'Billing',
            'reporting': 'Reporting',
        }
        return titles[key] || 'Dashboard'
    }

    const isDark = themeMode === 'dark'
    const colors = getThemeColors(themeMode)

    return (
        <Box sx={{
            borderBottom: colors.borderSubtle,
            px: 4,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(20px)',
            bgcolor: isDark ? 'rgba(10, 10, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s ease',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography sx={{
                    fontSize: 11,
                    color: isDark ? '#475569' : '#64748b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                }}>Dashboard</Typography>
                <Typography sx={{ color: isDark ? '#374151' : '#e2e8f0' }}>/</Typography>
                <Typography sx={{
                    fontSize: 11,
                    color: isDark ? '#94a3b8' : '#475569',
                    fontWeight: 600,
                }}>{getPageTitle(activePage)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Theme Toggle Button */}
                <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} arrow>
                    <IconButton
                        size="small"
                        onClick={onThemeToggle}
                        sx={{
                            color: isDark ? '#94a3b8' : '#64748b',
                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.05)',
                            '&:hover': {
                                color: '#8b5cf6',
                                bgcolor: 'rgba(139, 92, 246, 0.15)',
                                transform: 'rotate(180deg)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Apps" arrow>
                    <IconButton size="small" sx={{
                        color: isDark ? '#64748b' : '#64748b',
                        '&:hover': { color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' }
                    }}>
                        <AppsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Help" arrow>
                    <IconButton size="small" sx={{
                        color: isDark ? '#64748b' : '#64748b',
                        '&:hover': { color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' }
                    }}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Notifications" arrow>
                    <IconButton size="small" sx={{
                        color: isDark ? '#64748b' : '#64748b',
                        '&:hover': { color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' }
                    }}>
                        <NotificationsNoneIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Settings" arrow>
                    <IconButton size="small" sx={{
                        color: isDark ? '#64748b' : '#64748b',
                        '&:hover': { color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' }
                    }}>
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)' }} />
                <Avatar sx={{
                    width: 34,
                    height: 34,
                    ...gradientBg,
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                }}>N</Avatar>
            </Box>
        </Box>
    )
}

export default TopBar
