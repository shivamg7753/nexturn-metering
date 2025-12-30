import { useState } from 'react'
import { Box, Typography, Button, Drawer, IconButton, Switch } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useProductForm } from '../../hooks/useProductForm'
import ProductInfoSection from './ProductInfoSection'
import TaxCodeSection from './TaxCodeSection'
import PricingSection from './PricingSection'
import PreviewPanel from './PreviewPanel'
import MorePricingOptionsScreen from './MorePricingOptionsScreen'
import { getProductCatalogueColors } from './themeUtils'

function AddProductDrawer({ open, onClose, onSubmit, themeMode = 'light', meters = [] }) {
    const isDark = themeMode === 'dark'
    const baseColors = getProductCatalogueColors(isDark)
    const [currentScreen, setCurrentScreen] = useState('basic') // 'basic' | 'pricing'
    const [advancedPricingData, setAdvancedPricingData] = useState(null)

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
        updateField,
        updatePreview,
        toggleMoreOptions,
        validate,
        resetForm,
        setLoading,
        calculateTotals,
    } = useProductForm()

    const totals = calculateTotals()

    const handleClose = () => {
        resetForm()
        setCurrentScreen('basic')
        setAdvancedPricingData(null)
        onClose()
    }

    const handleMorePricingOptions = () => {
        setCurrentScreen('pricing')
    }

    const handleBackFromPricing = () => {
        setCurrentScreen('basic')
    }

    const handlePricingNext = (pricingData) => {
        setAdvancedPricingData(pricingData)
        setCurrentScreen('basic')
    }

    const handleSubmit = async () => {
        if (!validate()) return

        setLoading(true)
        try {
            const productData = {
                ...formData,
                advancedPricing: advancedPricingData,
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
                        Add a product
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

                                {/* Pricing Summary Card (only if advanced pricing is configured) */}
                                {advancedPricingData && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: colors.text,
                                            mb: 2
                                        }}>
                                            Pricing configuration
                                        </Typography>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: `1px solid ${colors.border}`,
                                            bgcolor: colors.bg
                                        }}>
                                            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                                                {advancedPricingData.pricingModel.replace('-', ' ')} • {advancedPricingData.pricingType}
                                            </Typography>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', mt: 0.5 }}>
                                                {advancedPricingData.amount ? `₹${advancedPricingData.amount}` : 'Multiple prices'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
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
                                {loading ? 'Adding...' : 'Add product'}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <MorePricingOptionsScreen
                        onBack={handleBackFromPricing}
                        onNext={handlePricingNext}
                        initialData={advancedPricingData}
                        meters={meters}
                        themeMode={themeMode}
                    />
                )}
            </Box>
        </Drawer>
    )
}

export default AddProductDrawer
