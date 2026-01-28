import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' | 'warning'
    loading = false,
    themeMode = 'light'
}) {
    const isDark = themeMode === 'dark';

    const colors = {
        bg: isDark ? '#1a1a2e' : '#ffffff',
        text: isDark ? '#e5e7eb' : '#1f2937',
        textSecondary: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    };

    const variantColors = {
        danger: {
            icon: '#ef4444',
            confirmBg: '#ef4444',
            confirmHover: '#dc2626',
        },
        warning: {
            icon: '#f59e0b',
            confirmBg: '#f59e0b',
            confirmHover: '#d97706',
        }
    };

    const currentVariant = variantColors[variant] || variantColors.danger;

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 2,
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WarningAmberIcon sx={{ color: currentVariant.icon, fontSize: 28 }} />
                    <Typography sx={{ fontSize: 18, fontWeight: 600, color: colors.text }}>
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6 }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        color: colors.textSecondary,
                        textTransform: 'none',
                        fontSize: 14,
                        fontWeight: 500,
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        }
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        bgcolor: currentVariant.confirmBg,
                        color: '#ffffff',
                        textTransform: 'none',
                        fontSize: 14,
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: currentVariant.confirmHover,
                            boxShadow: 'none',
                        },
                        '&:disabled': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
                            color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.26)',
                        }
                    }}
                >
                    {loading ? 'Processing...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmDialog;
