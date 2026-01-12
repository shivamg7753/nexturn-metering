import { useState } from 'react'
import { Box, LinearProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import { useProducts } from '../hooks/useProducts'
import { useMeters } from '../hooks/useMeters'
import { useMeterForm } from '../hooks/useMeterForm'
import {
    PageHeader,
    NavigationTabs,
    StatusCards,
    FilterBar,
    ProductsTable,
    Pagination,
    AddProductDrawer,
} from '../components/products'
import MeterFormDrawer from '../components/meters/MeterFormDrawer'
import { getProductCatalogueColors } from '../components/products/themeUtils'

const ROWS_PER_PAGE = 10

function ProductCataloguePage({ themeMode }) {
    const { products, loading, statusFilter, setStatusFilter, counts, fetchProducts } = useProducts()
    const { meters, createMeter } = useMeters()
    const meterForm = useMeterForm()
    const [activeTab, setActiveTab] = useState(0)
    const [page, setPage] = useState(1)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState(null)
    const [editingProduct, setEditingProduct] = useState(null)
    const isDark = themeMode === 'dark'
    const colors = getProductCatalogueColors(isDark)

    // Pagination calculations
    const totalPages = Math.ceil(products.length / ROWS_PER_PAGE)
    const paginatedProducts = products.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

    // Handlers
    const handleClearFilters = () => {
        setStatusFilter('all')
    }

    const handleStatusChange = (status) => {
        setStatusFilter(status)
        setPage(1) // Reset to first page on filter change
    }

    const handleCreateProduct = () => {
        setDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setDrawerOpen(false)
        setEditingProduct(null)
    }

    const handleSubmitProduct = async (productData) => {
        try {
            // Build pricing display string for backward compatibility
            let pricingDisplay = '1 price'
            if (productData.advancedPricing) {
                const pricing = productData.advancedPricing
                if (pricing.pricingModel === 'flat-rate' && pricing.amount) {
                    pricingDisplay = `₹${pricing.amount}`
                } else if (pricing.pricingModel === 'customer-chooses-price') {
                    pricingDisplay = 'Customer chooses'
                } else if (['tiered', 'graduated', 'volume'].includes(pricing.pricingModel)) {
                    pricingDisplay = `${pricing.tiers?.length || 0} tiers`
                }
            } else if (productData.amount) {
                pricingDisplay = `₹${productData.amount}`
            }

            const payload = {
                name: productData.name,
                description: productData.description || '',
                imageUrl: productData.imageUrl || '',
                statementDescriptor: productData.statementDescriptor || '',
                unitLabel: productData.unitLabel || '',
                taxCategory: productData.taxCode === 'general-electronic'
                    ? 'General - Electronically Supplied Services'
                    : productData.taxCode,
                status: 'active',
                pricing: pricingDisplay, // Legacy field
                prices: productData.advancedPricing ? [productData.advancedPricing] : []
            }

            const isEditing = !!editingProduct
            const url = isEditing
                ? `http://localhost:3001/api/products/${editingProduct.id}`
                : 'http://localhost:3001/api/products'
            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} product`)

            // Refresh the products list
            fetchProducts()
            setEditingProduct(null)
        } catch (error) {
            console.error('Error saving product:', error)
            throw error
        }
    }

    const handleAnalyse = () => {
        console.log('Analyse clicked')
    }

    const handleProductAction = (product) => {
        console.log('Product action:', product.id)
    }

    const handleEditProduct = async (product) => {
        try {
            // Fetch full product details from API
            const response = await fetch(`http://localhost:3001/api/products/${product.id}`)
            if (!response.ok) throw new Error('Failed to fetch product details')

            const fullProduct = await response.json()
            setEditingProduct(fullProduct)
            setDrawerOpen(true)
        } catch (error) {
            console.error('Error fetching product:', error)
        }
    }

    const handleDeleteProduct = (product) => {
        setProductToDelete(product)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!productToDelete) return

        try {
            const response = await fetch(`http://localhost:3001/api/products/${productToDelete.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete product')

            // Refresh the products list
            fetchProducts()
            setDeleteDialogOpen(false)
            setProductToDelete(null)
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setProductToDelete(null)
    }

    return (
        <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', p: 3 }}>
            <PageHeader
                colors={colors}
                onCreateProduct={handleCreateProduct}
                onAnalyse={handleAnalyse}
            />

            <NavigationTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            <StatusCards
                counts={counts}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                colors={colors}
                isDark={isDark}
            />

            <FilterBar
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                onClearFilters={handleClearFilters}
                colors={colors}
                isDark={isDark}
            />

            {loading && (
                <LinearProgress
                    sx={{
                        mb: 2,
                        borderRadius: 1,
                        bgcolor: 'rgba(124, 58, 237, 0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#7c3aed' }
                    }}
                />
            )}

            <ProductsTable
                products={paginatedProducts}
                colors={colors}
                isDark={isDark}
                onProductAction={handleProductAction}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
            />

            <Pagination
                totalCount={counts.all}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                colors={colors}
            />

            {/* Add Product Drawer */}
            <AddProductDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                onSubmit={handleSubmitProduct}
                themeMode={themeMode}
                meters={meters}
                editProduct={editingProduct}
                onCreateMeter={meterForm.openCreateForm}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                PaperProps={{
                    sx: {
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 2,
                        minWidth: 400,
                    }
                }}
            >
                <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>
                    Delete Product
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: colors.textSecondary }}>
                        Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCancelDelete}
                        sx={{
                            color: colors.textSecondary,
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{
                            bgcolor: '#ef4444',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#dc2626',
                                boxShadow: 'none',
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

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

export default ProductCataloguePage
