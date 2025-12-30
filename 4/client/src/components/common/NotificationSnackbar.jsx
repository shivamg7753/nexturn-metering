import { Snackbar, Alert } from '@mui/material'

function NotificationSnackbar({ open, message, severity, onClose }) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                sx={{
                    bgcolor: severity === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: severity === 'success' ? '#22c55e' : '#ef4444',
                    border: severity === 'success' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    )
}

export default NotificationSnackbar
