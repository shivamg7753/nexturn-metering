import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Paper,
    Divider,
    Grid,
    Chip,
    TextField,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getProductCatalogueColors } from '../components/products/themeUtils';
import AddProductDrawer from '../components/products/AddProductDrawer';
import ConfirmDialog from '../components/common/ConfirmDialog';
import MultiplePricesDisplay from '../components/products/MultiplePricesDisplay';
import { useProduct } from '../hooks/useProduct';
import { useSnackbar } from '../hooks/useSnackbar';
import { usePriceManagement } from '../hooks/usePriceManagement';
import { useMeters } from '../hooks/useMeters';
import { useMeterForm } from '../hooks/useMeterForm';
import MeterFormDrawer from '../components/meters/MeterFormDrawer';

function ProductDetailPage({ themeMode }) {
    const { productId } = useParams();
    const navigate = useNavigate();
    const isDark = themeMode === 'dark';
    const colors = getProductCatalogueColors(isDark);

    // Modularized logic using custom hooks
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const { product, logs, events, loading, refreshProduct } = useProduct(productId);

    const {
        drawerOpen,
        editingPriceIndex,
        deleteDialogOpen,
        deleteLoading,
        handleAddPrice,
        handleEditPrice,
        handleDeletePrice,
        handleSubmitPrice,
        handleConfirmDelete,
        closeDrawer,
        closeDeleteDialog
    } = usePriceManagement(productId, refreshProduct, showSuccess, showError);

    const { meters, createMeter } = useMeters();
    const meterForm = useMeterForm();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: colors.bg }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ p: 4, bgcolor: colors.bg, height: '100vh' }}>
                <Typography color="error">Product not found</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')}>
                    Back to products
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
            {/* Header / Breadcrumbs */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: colors.textSecondary }}>
                <Typography
                    onClick={() => navigate('/products')}
                    sx={{
                        cursor: 'pointer',
                        fontSize: 14,
                        '&:hover': { color: '#7c3aed' }
                    }}
                >
                    Products
                </Typography>
                <Typography sx={{ fontSize: 14 }}>{'>'}</Typography>
            </Box>

            {/* Product Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Inventory2OutlinedIcon sx={{ color: colors.textSecondary }} />
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
                                {product.name}
                            </Typography>
                            <Chip
                                label={product.status || 'Active'}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    bgcolor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                                    color: isDark ? '#4ade80' : '#166534',
                                    borderRadius: 0.5
                                }}
                            />
                        </Box>
                        <Typography sx={{ color: colors.textSecondary, fontSize: 14 }}>
                            {product.pricing} • Per month
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<EditOutlinedIcon />}
                        sx={{
                            color: colors.text,
                            borderColor: colors.border,
                            textTransform: 'none',
                            bgcolor: colors.cardBg,
                            '&:hover': {
                                borderColor: colors.textSecondary,
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                            }
                        }}
                    >
                        Edit product
                    </Button>
                    <IconButton sx={{ border: `1px solid ${colors.border} `, borderRadius: 1 }}>
                        <MoreHorizIcon sx={{ color: colors.text }} />
                    </IconButton>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Pricing Section */}
                    <Box sx={{ mb: 6 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600, color: colors.text }}>
                                Pricing
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={handleAddPrice}
                                sx={{
                                    color: colors.textSecondary,
                                    '&:hover': {
                                        color: '#7c3aed',
                                        bgcolor: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)'
                                    }
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>

                        {product.prices && product.prices.length > 0 ? (
                            <MultiplePricesDisplay
                                prices={product.prices}
                                onEditPrice={handleEditPrice}
                                onDeletePrice={handleDeletePrice}
                                colors={colors}
                                isDark={isDark}
                            />
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: colors.cardBg,
                                    border: `1px dashed ${colors.border} `,
                                    borderRadius: 2,
                                    p: 4,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography sx={{ color: colors.textSecondary, fontSize: 14 }}>
                                    No prices yet
                                </Typography>
                            </Paper>
                        )}
                    </Box>

                    {/* Cross-sells Section */}
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 1 }}>
                            Cross-sells
                        </Typography>
                        <Typography sx={{ color: colors.textSecondary, fontSize: 14, mb: 2 }}>
                            Suggest a related product for customers to add to their order, right in Checkout. <Box component="span" sx={{ color: '#7c3aed', cursor: 'pointer' }}>Learn more.</Box>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ color: colors.text, fontSize: 14, fontWeight: 500 }}>
                                Cross-sells to
                            </Typography>
                            <TextField
                                placeholder="Find a product..."
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: colors.cardBg,
                                        '& fieldset': { borderColor: colors.border },
                                        '&:hover fieldset': { borderColor: colors.border },
                                        color: colors.text,
                                        width: 300,
                                        height: 36
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Features Section */}
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 2 }}>
                            Features
                        </Typography>
                        <Box sx={{
                            border: `1px dashed ${colors.border} `,
                            borderRadius: 2,
                            p: 4,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Typography sx={{ color: colors.textSecondary, fontSize: 14 }}>
                                No features
                            </Typography>
                        </Box>
                    </Box>

                    {/* Logs Section */}
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 2 }}>
                            Logs
                        </Typography>
                        <Box>
                            {logs.length > 0 ? (
                                logs.map((log, index) => (
                                    <Box key={log._id || index} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        py: 1.5,
                                        borderBottom: index !== logs.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} ` : 'none'
                                    }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Typography sx={{ color: colors.text, fontSize: 13, fontFamily: 'monospace' }}>
                                                {log.method} {log.endpoint}
                                            </Typography>
                                            <Chip label={`${log.statusCode} OK`} size="small" variant="outlined" sx={{
                                                border: `1px solid ${colors.border} `,
                                                color: colors.textSecondary,
                                                height: 20,
                                                fontSize: 11
                                            }} />
                                        </Box>
                                        <Typography sx={{ color: colors.textSecondary, fontSize: 13 }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography sx={{ color: colors.textSecondary, fontSize: 13, py: 2 }}>
                                    No logs available
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Events Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 2 }}>
                            Events
                        </Typography>
                        <Box>
                            {events.length > 0 ? (
                                events.map((event, index) => (
                                    <Box key={event._id || index} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        py: 1.5,
                                        borderBottom: index !== events.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} ` : 'none'
                                    }}>
                                        <Typography sx={{ color: colors.text, fontSize: 13, maxWidth: '70%' }}>
                                            {event.text}
                                        </Typography>
                                        <Typography sx={{ color: colors.textSecondary, fontSize: 13 }}>
                                            {event.date}, {event.time}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography sx={{ color: colors.textSecondary, fontSize: 13, py: 2 }}>
                                    No events available
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Grid>

                {/* Right Column - Details */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: colors.text }}>
                                Details
                            </Typography>
                            <IconButton size="small" sx={{ border: `1px solid ${colors.border} `, borderRadius: 1, p: 0.5 }}>
                                <EditOutlinedIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.text, mb: 0.5 }}>
                                    Product ID
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: 13, color: colors.textSecondary, fontFamily: 'monospace' }}>
                                        {productId || 'prod_Tpc7x3cFyBijbV'}
                                    </Typography>
                                    <ContentCopyIcon sx={{ fontSize: 14, color: colors.textSecondary, cursor: 'pointer' }} />
                                </Box>
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.text, mb: 0.5 }}>
                                    Product tax code
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                                    {product.taxCategory || 'General - Electronically Supplied Services'}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: colors.textSecondary, fontFamily: 'monospace' }}>
                                    txcd_10000000
                                </Typography>
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.text, mb: 0.5 }}>
                                    Marketing feature list
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>—</Typography>
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.text, mb: 0.5 }}>
                                    Description
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                                    {product.description || '—'}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.text, mb: 0.5 }}>
                                    Attributes
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>—</Typography>
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: 13, color: '#7c3aed', cursor: 'pointer', fontWeight: 500 }}>
                                    View more v
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Metadata Section */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: colors.text }}>
                                Metadata
                            </Typography>
                            <IconButton size="small" sx={{ border: `1px solid ${colors.border} `, borderRadius: 1, p: 0.5 }}>
                                <EditOutlinedIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                            </IconButton>
                        </Box>
                        <Box sx={{
                            border: `1px dashed ${colors.border} `,
                            borderRadius: 2,
                            p: 3,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 60
                        }}>
                            <Typography sx={{ color: colors.textSecondary, fontSize: 13 }}>
                                No metadata
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Add/Edit Price Drawer */}
            <AddProductDrawer
                open={drawerOpen}
                onClose={closeDrawer}
                onSubmit={handleSubmitPrice}
                themeMode={themeMode}
                meters={meters}
                mode="price-only"
                editProduct={editingPriceIndex !== null ? {
                    ...product,
                    prices: [product.prices[editingPriceIndex]]
                } : null}
                onCreateMeter={meterForm.openCreateForm}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleConfirmDelete}
                title="Delete Price"
                message="Are you sure you want to delete this price? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleteLoading}
                themeMode={themeMode}
            />

            {/* Snackbar for feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={hideSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={hideSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Meter Form Drawer */}
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
                onSubmit={async () => {
                    const meterData = meterForm.getMeterData()
                    const result = await createMeter(meterData)
                    if (result.success) {
                        meterForm.closeForm()
                    }
                }}
                isFormValid={meterForm.isFormValid}
                themeMode={themeMode}
            />
        </Box>
    )
}

export default ProductDetailPage
