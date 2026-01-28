import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    InputBase,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { mainMenuItems, shortcutItems, productMenuItems } from '../constants/menuItems.jsx';
import { gradientBg, getThemeColors } from '../theme/styles';

function Sidebar({ activePage, themeMode }) {
    const navigate = useNavigate();
    const isActive = (key) => activePage === key
    const isDark = themeMode === 'dark'
    const colors = getThemeColors(themeMode)

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: isDark
                ? 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
            transition: 'background 0.3s ease, border-color 0.3s ease',
            overflowY: 'auto',
            // Hide scrollbar
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            // Firefox
            scrollbarWidth: 'none',
            // IE and Edge
            msOverflowStyle: 'none',
        }}>
            {/* Logo Section */}
            <Box sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: colors.borderSubtle,
            }}>
                <Box sx={{
                    width: 40,
                    height: 40,
                    ...gradientBg,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
                }}>
                    <BoltIcon sx={{ color: '#fff', fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                        fontWeight: 700,
                        fontSize: 15,
                        lineHeight: 1.2,
                        background: isDark
                            ? 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)'
                            : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>RateCard Pro</Typography>
                    <Typography sx={{ color: isDark ? '#64748b' : '#64748b', fontSize: 12, fontWeight: 500 }}>Enterprise</Typography>
                </Box>
                <IconButton size="small" sx={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            {/* Search */}
            <Box sx={{ px: 2, py: 2 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderRadius: 2.5,
                    px: 2,
                    py: 1.2,
                    border: `1px solid ${colors.borderSubtle}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    },
                    '&:focus-within': {
                        borderColor: '#8b5cf6',
                        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                    }
                }}>
                    <SearchIcon sx={{ color: isDark ? '#64748b' : '#64748b', fontSize: 18 }} />
                    <InputBase
                        placeholder="Search..."
                        sx={{
                            fontSize: 13,
                            flex: 1,
                            color: isDark ? '#f8fafc' : '#0f172a',
                            '& input::placeholder': { color: isDark ? '#64748b' : '#94a3b8', opacity: 1 }
                        }}
                    />
                    <Typography sx={{
                        fontSize: 10,
                        color: isDark ? '#475569' : '#64748b',
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                    }}>⌘K</Typography>
                </Box>
            </Box>

            {/* Main Menu */}
            <List sx={{ px: 1.5, py: 0.5 }}>
                {mainMenuItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => navigate(`/${item.key}`)}
                            sx={{
                                py: 1.2,
                                px: 2,
                                borderRadius: 2.5,
                                bgcolor: isActive(item.key) ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                border: isActive(item.key) ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    bgcolor: isActive(item.key) ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                    transform: 'translateX(4px)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: 36,
                                color: isActive(item.key) ? '#8b5cf6' : (isDark ? '#64748b' : '#64748b'),
                                transition: 'color 0.25s ease',
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontSize: 13,
                                    fontWeight: isActive(item.key) ? 600 : 500,
                                    color: isActive(item.key) ? (isDark ? '#f8fafc' : '#0f172a') : (isDark ? '#94a3b8' : '#475569'),
                                }}
                            />
                            {isActive(item.key) && (
                                <Box sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    ...gradientBg,
                                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)',
                                }} />
                            )}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Shortcuts */}
            <Typography sx={{
                px: 3,
                pt: 3,
                pb: 1.5,
                fontSize: 10,
                fontWeight: 700,
                color: isDark ? '#475569' : '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
            }}>Shortcuts</Typography>
            <List sx={{ px: 1.5 }}>
                {shortcutItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.3 }}>
                        <ListItemButton
                            onClick={() => navigate(`/${item.key}`)}
                            sx={{
                                py: 1,
                                px: 2,
                                borderRadius: 2,
                                bgcolor: isActive(item.key) ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                border: isActive(item.key) ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    bgcolor: isActive(item.key) ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                    transform: 'translateX(4px)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: 32,
                                color: isActive(item.key) ? '#a78bfa' : (isDark ? '#64748b' : '#94a3b8'),
                                '& svg': { fontSize: 18 }
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontSize: 12.5,
                                    fontWeight: isActive(item.key) ? 600 : 500,
                                    color: isActive(item.key) ? (isDark ? '#f8fafc' : '#1e293b') : (isDark ? '#94a3b8' : '#64748b'),
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Products */}
            <Typography sx={{
                px: 3,
                pt: 3,
                pb: 1.5,
                fontSize: 10,
                fontWeight: 700,
                color: isDark ? '#475569' : '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
            }}>Products</Typography>
            <List sx={{ px: 1.5 }}>
                {productMenuItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.3 }}>
                        <ListItemButton
                            onClick={() => navigate(`/${item.key}`)}
                            sx={{
                                py: 1,
                                px: 2,
                                borderRadius: 2,
                                bgcolor: isActive(item.key) ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                border: isActive(item.key) ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    transform: 'translateX(4px)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: 32,
                                color: isDark ? '#64748b' : '#94a3b8',
                                '& svg': { fontSize: 18 }
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                    color: isDark ? '#94a3b8' : '#64748b',
                                }}
                            />
                            <KeyboardArrowDownIcon sx={{ fontSize: 16, color: isDark ? '#475569' : '#94a3b8' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Bottom Section */}
            <Box sx={{ mt: 'auto', p: 2, borderTop: colors.borderSubtle }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                }}>
                    <AutoAwesomeIcon sx={{ color: '#a78bfa', fontSize: 18 }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: isDark ? '#f8fafc' : '#1e293b' }}>Upgrade to Pro</Typography>
                        <Typography sx={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b' }}>Unlock all features</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Sidebar
