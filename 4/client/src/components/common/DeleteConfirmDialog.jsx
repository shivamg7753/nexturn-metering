import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button
} from '@mui/material'

function DeleteConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Delete Item',
    itemName = '',
    themeMode = 'dark'
}) {
    const isDark = themeMode === 'dark'
    const textPrimary = isDark ? '#f8fafc' : '#0f172a'
    const textSecondary = isDark ? '#94a3b8' : '#475569'

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    bgcolor: isDark ? '#1a1a24' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    minWidth: 400,
                }
            }}
        >
            <DialogTitle sx={{ color: textPrimary, fontWeight: 700 }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ color: textSecondary }}>
                    Are you sure you want to delete "{itemName}"? This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={onClose} sx={{ color: textSecondary }}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DeleteConfirmDialog
