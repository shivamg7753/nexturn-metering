import { useState } from 'react'
import {
    Drawer,
    Box,
    Typography,
    TextField,
    IconButton,
    Button,
    Select,
    MenuItem,
    FormControl,
    Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

function AddCustomerDrawer({ open, onClose, onSubmit, themeMode }) {
    const isDark = themeMode === 'dark'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        language: 'English (United States)',
    })

    const colors = {
        bg: isDark ? '#12121a' : '#ffffff',
        text: isDark ? '#f8fafc' : '#0f172a',
        textSecondary: isDark ? '#94a3b8' : '#475569',
        border: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.12)',
        inputBg: isDark ? '#1a1a24' : '#f8fafc',
        accent: '#8b5cf6',
    }

    const handleChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        })
    }

    const handleSubmit = async () => {
        try {
            await onSubmit(formData)
            // Reset form
            setFormData({
                name: '',
                email: '',
                language: 'English (United States)',
            })
            onClose()
        } catch (error) {
            console.error('Error creating customer:', error)
        }
    }

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 500,
                    bgcolor: colors.bg,
                    borderLeft: `1px solid ${colors.border}`,
                },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box
                    sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${colors.border}`,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            color: colors.text,
                            fontWeight: 600,
                            fontSize: '1.125rem',
                        }}
                    >
                        Create customer
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: colors.textSecondary,
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 3,
                    }}
                >
                    {/* Account Information Section */}
                    <Typography
                        sx={{
                            color: colors.text,
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            mb: 3,
                        }}
                    >
                        Account information
                    </Typography>

                    {/* Name Field */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            sx={{
                                color: colors.text,
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                mb: 0.5,
                            }}
                        >
                            Name
                        </Typography>
                        <Typography
                            sx={{
                                color: colors.textSecondary,
                                fontSize: '0.8125rem',
                                mb: 1.5,
                            }}
                        >
                            Customer display name; appears on invoices.
                        </Typography>
                        <TextField
                            fullWidth
                            value={formData.name}
                            onChange={handleChange('name')}
                            placeholder="Enter customer name"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    borderRadius: 2,
                                    fontSize: '0.875rem',
                                    '& fieldset': {
                                        borderColor: colors.border,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.border,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.accent,
                                        borderWidth: 1,
                                    },
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: colors.text,
                                    padding: '10px 14px',
                                },
                            }}
                        />
                    </Box>

                    {/* Email Field */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            sx={{
                                color: colors.text,
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                mb: 1.5,
                            }}
                        >
                            Email
                        </Typography>
                        <TextField
                            fullWidth
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            placeholder="customer@example.com"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    borderRadius: 2,
                                    fontSize: '0.875rem',
                                    '& fieldset': {
                                        borderColor: colors.border,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.border,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.accent,
                                        borderWidth: 1,
                                    },
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: colors.text,
                                    padding: '10px 14px',
                                },
                            }}
                        />
                    </Box>

                    {/* Language Field */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            sx={{
                                color: colors.text,
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                mb: 1.5,
                            }}
                        >
                            Language
                        </Typography>
                        <FormControl fullWidth>
                            <Select
                                value={formData.language}
                                onChange={handleChange('language')}
                                sx={{
                                    bgcolor: colors.inputBg,
                                    borderRadius: 2,
                                    fontSize: '0.875rem',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.border,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.border,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.accent,
                                        borderWidth: 1,
                                    },
                                    '& .MuiSelect-select': {
                                        color: colors.text,
                                        padding: '10px 14px',
                                    },
                                }}
                            >
                                <MenuItem value="English (United States)">English (United States)</MenuItem>
                                <MenuItem value="English (United Kingdom)">English (United Kingdom)</MenuItem>
                                <MenuItem value="Spanish">Spanish</MenuItem>
                                <MenuItem value="French">French</MenuItem>
                                <MenuItem value="German">German</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        p: 3,
                        borderTop: `1px solid ${colors.border}`,
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        onClick={onClose}
                        sx={{
                            color: colors.textSecondary,
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            px: 3,
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.email}
                        sx={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            px: 3,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                            },
                            '&:disabled': {
                                background: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.5)',
                                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)',
                            },
                        }}
                    >
                        Create customer
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
}

export default AddCustomerDrawer
