import { useState, useEffect } from 'react'
import { Box, Typography, Button, Drawer, IconButton, Switch } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useProductForm } from '../../hooks/useProductForm'
import ProductInfoSection from './ProductInfoSection'
import TaxCodeSection from './TaxCodeSection'
import PricingSection from './PricingSection'
import PreviewPanel from './PreviewPanel'
import MorePricingOptionsScreen from './MorePricingOptionsScreen'
import MultiplePricesDisplay from './MultiplePricesDisplay'
import { getProductCatalogueColors } from './themeUtils'

function AddProductDrawer({ open, onClose, onSubmit, themeMode = 'light', meters = [], editProduct = null, onCreateMeter }) {
    const isDark = themeMode === 'dark'
    const baseColors = getProductCatalogueColors(isDark)
    const [currentScreen, setCurrentScreen] = useState('basic') // 'basic' | 'pricing'
    const [editingPriceIndex, setEditingPriceIndex] = useState(null) // Track which price is being edited

    const colors = {
        ...baseColors,
        inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        previewBg: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
        drawerBg: isDark ? '#1a1a2e' : '#ffffff',
    }

    const {
        formData,
        previewData,
        showMoreOptions,
        loading,
        errors,
        prices,
        updateField,
        updatePreview,
        toggleMoreOptions,
        validate,
        resetForm,
        setLoading,
        calculateTotals,
        setFormData,
        addPrice,
        updatePrice,
        deletePrice,
        setPrices,
    } = useProductForm()

    const totals = calculateTotals()

    // Populate form when editing
    useEffect(() => {
        if (editProduct && open) {
            setFormData({
                name: editProduct.name || '',
                description: editProduct.description || '',
                imageUrl: editProduct.imageUrl || '',
                statementDescriptor: editProduct.statementDescriptor || '',
                unitLabel: editProduct.unitLabel || '',
                taxCode: editProduct.taxCategory === 'General - Electronically Supplied Services'
                    ? 'general-electronic'
                    : editProduct.taxCategory || 'general-electronic',
                amount: editProduct.prices?.[0]?.amount || '',
                billingPeriod: editProduct.prices?.[0]?.billingPeriod || 'monthly',
            })

            // Set prices array if exists
            if (editProduct.prices && editProduct.prices.length > 0) {
                setPrices(editProduct.prices)
            }
        }
    }, [editProduct, open, setFormData, setPrices])

    const handleClose = () => {
        resetForm()
        setCurrentScreen('basic')
        setEditingPriceIndex(null)
        onClose()
    }

    const handleMorePricingOptions = () => {
        setEditingPriceIndex(null) // Creating new price
        setCurrentScreen('pricing')
    }

    const handleBackFromPricing = () => {
        setEditingPriceIndex(null)
        setCurrentScreen('basic')
    }

    const handlePricingNext = (pricingData) => {
        if (editingPriceIndex !== null) {
            // Update existing price
            updatePrice(editingPriceIndex, pricingData)
        } else {
            // Add new price
            addPrice(pricingData)
        }
        setEditingPriceIndex(null)
        setCurrentScreen('basic')
    }

    const handleEditPrice = (index) => {
        setEditingPriceIndex(index)
        setCurrentScreen('pricing')
    }

    const handleDeletePrice = (index) => {
        deletePrice(index)
    }

    const handleSubmit = async () => {
        if (!validate()) return

        setLoading(true)
        try {
            const productData = {
                ...formData,
                prices: prices.length > 0 ? prices : undefined,
            }
            await onSubmit?.(productData)
            handleClose()
        } catch (error) {
            console.error('Error creating product:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', md: 800 },
                    bgcolor: colors.drawerBg,
                    boxShadow: '-4px 0 30px rgba(0,0,0,0.1)',
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 3,
                    py: 2,
                    borderBottom: `1px solid ${colors.border}`,
                }}>
                    <Typography sx={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: colors.text,
                    }}>
                        {editProduct ? 'Edit product' : 'Add a product'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                                Close preview
                            </Typography>
                            <Switch size="small" />
                        </Box>
                        <IconButton onClick={handleClose} size="small" sx={{ color: colors.textSecondary }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Content - Conditional based on screen */}
                {currentScreen === 'basic' ? (
                    <>
                        <Box sx={{
                            display: 'flex',
                            flex: 1,
                            overflow: 'hidden',
                        }}>
                            {/* Left Form Section */}
                            <Box sx={{
                                flex: 1,
                                p: 3,
                                overflowY: 'auto',
                                borderRight: `1px solid ${colors.border}`,
                            }}>
                                <ProductInfoSection
                                    formData={formData}
                                    errors={errors}
                                    onFieldChange={updateField}
                                    colors={colors}
                                />

                                <TaxCodeSection
                                    taxCode={formData.taxCode}
                                    onTaxCodeChange={(value) => updateField('taxCode', value)}
                                    colors={colors}
                                />

                                <PricingSection
                                    formData={formData}
                                    errors={errors}
                                    onFieldChange={updateField}
                                    showMoreOptions={showMoreOptions}
                                    onToggleMoreOptions={toggleMoreOptions}
                                    onMorePricingOptions={handleMorePricingOptions}
                                    colors={colors}
                                    isDark={isDark}
                                />

                                {/* Multiple Prices Display */}
                                <MultiplePricesDisplay
                                    prices={prices}
                                    onEditPrice={handleEditPrice}
                                    onDeletePrice={handleDeletePrice}
                                    colors={colors}
                                    isDark={isDark}
                                />
                            </Box>

                            {/* Right Preview Section */}
                            <Box sx={{
                                width: 280,
                                p: 3,
                                bgcolor: colors.previewBg,
                                overflowY: 'auto',
                            }}>
                                <PreviewPanel
                                    previewData={previewData}
                                    onPreviewChange={updatePreview}
                                    totals={totals}
                                    billingPeriod={formData.billingPeriod}
                                    colors={colors}
                                />
                            </Box>
                        </Box>

                        {/* Footer */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 2,
                            px: 3,
                            py: 2,
                            borderTop: `1px solid ${colors.border}`,
                        }}>
                            <Button
                                onClick={handleClose}
                                sx={{
                                    color: colors.textSecondary,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: 14,
                                    '&:hover': {
                                        bgcolor: 'transparent',
                                        color: colors.text,
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{
                                    bgcolor: '#7c3aed',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    px: 3,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        bgcolor: '#6d28d9',
                                        boxShadow: 'none',
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: '#a78bfa',
                                        color: '#fff',
                                    },
                                }}
                            >
                                {loading ? (editProduct ? 'Updating...' : 'Adding...') : (editProduct ? 'Update product' : 'Add product')}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <MorePricingOptionsScreen
                        onBack={handleBackFromPricing}
                        onNext={handlePricingNext}
                        initialData={editingPriceIndex !== null ? prices[editingPriceIndex] : null}
                        meters={meters}
                        themeMode={themeMode}
                        onCreateMeter={onCreateMeter}
                        isEditing={editingPriceIndex !== null}
                    />
                )}
            </Box>
        </Drawer>
    )
}

export default AddProductDrawer
