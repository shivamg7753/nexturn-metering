import { Menu, MenuItem, Divider } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'

function MeterActionMenu({
    anchorEl,
    open,
    onClose,
    selectedMeter,
    onEdit,
    onToggleStatus,
    onDelete,
    themeMode = 'dark'
}) {
    const isDark = themeMode === 'dark'
    const textPrimary = isDark ? '#f8fafc' : '#0f172a'
    const textMuted = isDark ? '#64748b' : '#64748b'

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    bgcolor: isDark ? '#1a1a24' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    minWidth: 180,
                    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.15)',
                }
            }}
        >
            <MenuItem
                onClick={onEdit}
                sx={{ py: 1.5, color: textPrimary, '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
            >
                <EditIcon sx={{ fontSize: 18, mr: 1.5, color: textMuted }} />
                Edit Meter
            </MenuItem>
            <MenuItem
                onClick={onToggleStatus}
                sx={{ py: 1.5, color: textPrimary, '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
            >
                {selectedMeter?.status === 'Active' ? (
                    <>
                        <ToggleOffIcon sx={{ fontSize: 18, mr: 1.5, color: '#f59e0b' }} />
                        Deactivate
                    </>
                ) : (
                    <>
                        <ToggleOnIcon sx={{ fontSize: 18, mr: 1.5, color: '#22c55e' }} />
                        Activate
                    </>
                )}
            </MenuItem>
            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)', my: 1 }} />
            <MenuItem
                onClick={onDelete}
                sx={{ py: 1.5, color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
            >
                <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
                Delete Meter
            </MenuItem>
        </Menu>
    )
}

export default MeterActionMenu
