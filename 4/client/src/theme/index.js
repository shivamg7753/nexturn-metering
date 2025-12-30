import { createTheme } from '@mui/material/styles'

// Dark Theme
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
        },
        secondary: {
            main: '#6366f1',
        },
        background: {
            default: '#0a0a0f',
            paper: '#12121a',
        },
        success: {
            main: '#22c55e',
        },
        warning: {
            main: '#f59e0b',
        },
        error: {
            main: '#ef4444',
        },
        text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
        },
    },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 10,
                },
            },
        },
    },
})

// Light Theme
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#7c3aed',
            light: '#8b5cf6',
            dark: '#6d28d9',
        },
        secondary: {
            main: '#4f46e5',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        success: {
            main: '#16a34a',
        },
        warning: {
            main: '#d97706',
        },
        error: {
            main: '#dc2626',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 10,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: 'transparent',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'currentColor',
                        opacity: 0.1,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        opacity: 0.2,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        opacity: 0.5,
                        borderWidth: 1,
                    },
                },
                input: {
                    fontSize: 14,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    border: 'none',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    borderRadius: 12,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.06)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
})

export default darkTheme
