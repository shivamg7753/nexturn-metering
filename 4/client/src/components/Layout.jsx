import { Box, Drawer, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { darkTheme, lightTheme } from '../theme';
import { drawerWidth, getThemeColors } from '../theme/styles';

/**
 * Layout Component
 * Main layout wrapper with sidebar and top bar
 * Uses React Router's Outlet for nested routes
 */
function Layout({ themeMode, onThemeToggle }) {
    const theme = themeMode === 'dark' ? darkTheme : lightTheme;
    const isDark = themeMode === 'dark';
    const colors = getThemeColors(themeMode);
    const location = useLocation();

    // Extract active page from current route
    const activePage = location.pathname.split('/')[1] || 'usage-billing';

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{
                display: 'flex',
                minHeight: '100vh',
                bgcolor: isDark ? '#0a0a0f' : '#f8fafc',
                position: 'relative',
                transition: 'background-color 0.3s ease',
            }}>
                <CssBaseline />

                {/* Background Pattern */}
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isDark
                        ? `
              radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 40%)
            `
                        : `
              radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.03) 0%, transparent 40%)
            `,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'background 0.3s ease',
                }} />

                {/* Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            borderRight: 'none',
                            bgcolor: 'transparent',
                            zIndex: 1,
                        }
                    }}
                >
                    <Sidebar activePage={activePage} themeMode={themeMode} />
                </Drawer>

                {/* Main Content */}
                <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
                    <TopBar activePage={activePage} themeMode={themeMode} onThemeToggle={onThemeToggle} />

                    {/* Page Content - React Router Outlet */}
                    <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default Layout;
