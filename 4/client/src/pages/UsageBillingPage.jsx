import { useState } from 'react'
import { Box, Tabs, Tab } from '@mui/material'
import { useMeters } from '../hooks/useMeters'
import { useMeterForm } from '../hooks/useMeterForm'
import { meterTabs } from '../constants/menuItems.jsx'
import { getGlassStyle, getThemeColors, gradientBg } from '../theme/styles'

// Components
import PageHeader from '../components/meters/PageHeader'
import StatsCards from '../components/meters/StatsCards'
import MetersTable from '../components/meters/MetersTable'
import MeterActionMenu from '../components/meters/MeterActionMenu'
import MeterFormDrawer from '../components/meters/MeterFormDrawer'
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog'
import Pagination from '../components/common/Pagination'
import NotificationSnackbar from '../components/common/NotificationSnackbar'

function UsageBillingPage({ themeMode = 'dark' }) {
    const colors = getThemeColors(themeMode)
    const glassStyle = getGlassStyle(themeMode)

    // Data hooks
    const { meters, loading, createMeter, updateMeter, deleteMeter, toggleMeterStatus } = useMeters()
    const meterForm = useMeterForm()

    // UI state
    const [selectedTab, setSelectedTab] = useState(2)
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedMeter, setSelectedMeter] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [meterToDelete, setMeterToDelete] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    // Menu handlers
    const handleMenuOpen = (event, meter) => {
        setAnchorEl(event.currentTarget)
        setSelectedMeter(meter)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedMeter(null)
    }

    const handleEditMeter = () => {
        meterForm.openEditForm(selectedMeter)
        handleMenuClose()
    }

    const handleDeleteClick = () => {
        setMeterToDelete(selectedMeter)
        setDeleteDialogOpen(true)
        handleMenuClose()
    }

    const handleDeleteConfirm = async () => {
        if (meterToDelete) {
            const result = await deleteMeter(meterToDelete.id)
            setSnackbar({
                open: true,
                message: result.success ? 'Meter deleted successfully' : 'Failed to delete meter',
                severity: result.success ? 'success' : 'error'
            })
        }
        setDeleteDialogOpen(false)
        setMeterToDelete(null)
    }

    const handleToggleStatus = async () => {
        if (selectedMeter) {
            const result = await toggleMeterStatus(selectedMeter.id, selectedMeter.status)
            setSnackbar({
                open: true,
                message: result.success
                    ? `Meter ${selectedMeter.status === 'Active' ? 'deactivated' : 'activated'} successfully`
                    : 'Failed to update meter status',
                severity: result.success ? 'success' : 'error'
            })
        }
        handleMenuClose()
    }

    const handleFormSubmit = async () => {
        const meterData = meterForm.getMeterData()
        let result

        if (meterForm.editingMeter) {
            result = await updateMeter(meterForm.editingMeter.id, meterData)
        } else {
            result = await createMeter(meterData)
        }

        if (result.success) {
            meterForm.closeForm()
            setSnackbar({
                open: true,
                message: meterForm.editingMeter ? 'Meter updated successfully' : 'Meter created successfully',
                severity: 'success'
            })
        } else {
            setSnackbar({
                open: true,
                message: result.error || 'Operation failed',
                severity: 'error'
            })
        }
    }

    return (
        <>
            <PageHeader
                title="Usage-Based Billing"
                subtitle="Manage your meters and billing configurations"
                createButtonText="Create Meter"
                showImportButton
                onCreateClick={meterForm.openCreateForm}
                colors={colors}
            />

            <Tabs
                value={selectedTab}
                onChange={(e, v) => setSelectedTab(v)}
                sx={{
                    mb: 4,
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: 14,
                        fontWeight: 500,
                        minHeight: 48,
                        color: '#64748b',
                        px: 3,
                        '&:hover': { color: '#f8fafc' },
                    },
                    '& .Mui-selected': { color: '#a78bfa !important' },
                    '& .MuiTabs-indicator': {
                        ...gradientBg,
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                    }
                }}
            >
                {meterTabs.map((tab) => <Tab key={tab} label={tab} />)}
            </Tabs>

            <StatsCards meters={meters} glassStyle={glassStyle} colors={colors} />

            <MetersTable
                meters={meters}
                loading={loading}
                onMenuOpen={handleMenuOpen}
                glassStyle={glassStyle}
                colors={colors}
                themeMode={themeMode}
            />

            <Pagination
                totalItems={meters.length}
                itemLabel="meters"
                themeMode={themeMode}
            />

            <MeterActionMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                selectedMeter={selectedMeter}
                onClose={handleMenuClose}
                onEdit={handleEditMeter}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteClick}
                themeMode={themeMode}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Meter"
                itemName={meterToDelete?.displayName}
                themeMode={themeMode}
            />

            <MeterFormDrawer
                open={meterForm.showCreateForm}
                onClose={meterForm.closeForm}
                editingMeter={meterForm.editingMeter}
                newMeter={meterForm.newMeter}
                showAdvanced={meterForm.showAdvanced}
                exampleUsage={meterForm.exampleUsage}
                preview={meterForm.calculatePreview()}
                onUpdateField={meterForm.updateMeterField}
                onToggleAdvanced={meterForm.toggleAdvanced}
                onRemoveExampleUsage={meterForm.removeExampleUsage}
                onSubmit={handleFormSubmit}
                isFormValid={meterForm.isFormValid}
                themeMode={themeMode}
            />

            <NotificationSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </>
    )
}

export default UsageBillingPage
