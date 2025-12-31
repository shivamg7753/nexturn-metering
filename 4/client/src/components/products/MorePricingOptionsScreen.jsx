import { useState } from 'react'
import { Box, Typography, Button, Select, MenuItem, FormControl } from '@mui/material'
import { useAdvancedPricing } from '../../hooks/useAdvancedPricing'
import {
    PricingTypeToggle,
    PricingModelSelector,
    UsageTypeSelector,
    TieredPricingTable,
    GraduatedPricingTable,
    VolumePricingTable,
    UsageMeterSection,
    FlatRatePriceSection,
    SelectedMeterDisplay,
    AdvancedPriceSection,
    CustomerChoosesPriceSection,
} from './pricing'
import PreviewPanel from './PreviewPanel'
import { getProductCatalogueColors } from './themeUtils'

const TAX_OPTIONS = [
    { value: 'auto', label: 'Auto' },
    { value: 'inclusive', label: 'Inclusive' },
    { value: 'exclusive', label: 'Exclusive' },
]

function MorePricingOptionsScreen({
    onBack,
    onNext,
    initialData = {},
    meters = [],
    themeMode = 'light',
    onCreateMeter,
}) {
    const isDark = themeMode === 'dark'
    const baseColors = getProductCatalogueColors(isDark)
    const colors = {
        ...baseColors,
        inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        previewBg: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
    }

    const {
        pricingData,
        errors,
        updateField,
        updateTiers,
        addTier,
        removeTier,
        validate,
        calculatePreview,
    } = useAdvancedPricing()

    const [previewData, setPreviewData] = useState({
        unitQuantity: 1,
        location: 'United States',
        state: '',
    })

    const [advancedData, setAdvancedData] = useState({
        priceDescription: '',
        lookupKey: '',
    })

    const totals = calculatePreview(previewData.unitQuantity)

    // Get meter name for display
    const selectedMeter = meters.find(m => m.id === pricingData.meter)
    const meterName = selectedMeter?.eventName || selectedMeter?.displayName || pricingData.meter

    const handleRemoveMeter = () => {
        updateField('meter', '')
    }

    const handleNext = () => {
        if (validate()) {
            onNext?.({ ...pricingData, ...advancedData })
        }
    }

    const renderPricingFields = () => {
        switch (pricingData.pricingModel) {
            case 'flat-rate':
                return (
                    <FlatRatePriceSection
                        amount={pricingData.amount}
                        currency={pricingData.currency}
                        includeTaxInPrice={pricingData.includeTaxInPrice}
                        onAmountChange={(v) => updateField('amount', v)}
                        onCurrencyChange={(v) => updateField('currency', v)}
                        onTaxChange={(v) => updateField('includeTaxInPrice', v)}
                        colors={colors}
                    />
                )

            case 'graduated':
                return (
                    <>
                        <GraduatedPricingTable
                            tiers={pricingData.tiers}
                            currency={pricingData.currency}
                            onTiersChange={updateTiers}
                            onCurrencyChange={(v) => updateField('currency', v)}
                            onAddTier={addTier}
                            onRemoveTier={removeTier}
                            colors={colors}
                        />

                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: colors.text,
                                mb: 1,
                            }}>
                                Include tax in price
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={pricingData.includeTaxInPrice}
                                    onChange={(e) => updateField('includeTaxInPrice', e.target.value)}
                                    sx={{
                                        bgcolor: colors.inputBg,
                                        borderRadius: 1.5,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                                        '& .MuiSelect-select': { color: colors.text, fontSize: 14 },
                                    }}
                                >
                                    {TAX_OPTIONS.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <AdvancedPriceSection
                            priceDescription={advancedData.priceDescription}
                            lookupKey={advancedData.lookupKey}
                            onPriceDescriptionChange={(v) => setAdvancedData(prev => ({ ...prev, priceDescription: v }))}
                            onLookupKeyChange={(v) => setAdvancedData(prev => ({ ...prev, lookupKey: v }))}
                            colors={colors}
                        />
                    </>
                )

            case 'volume':
                return (
                    <>
                        <VolumePricingTable
                            tiers={pricingData.tiers}
                            currency={pricingData.currency}
                            onTiersChange={updateTiers}
                            onCurrencyChange={(v) => updateField('currency', v)}
                            onAddTier={addTier}
                            onRemoveTier={removeTier}
                            colors={colors}
                        />

                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: colors.text,
                                mb: 1,
                            }}>
                                Include tax in price
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={pricingData.includeTaxInPrice}
                                    onChange={(e) => updateField('includeTaxInPrice', e.target.value)}
                                    sx={{
                                        bgcolor: colors.inputBg,
                                        borderRadius: 1.5,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                                        '& .MuiSelect-select': { color: colors.text, fontSize: 14 },
                                    }}
                                >
                                    {TAX_OPTIONS.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <AdvancedPriceSection
                            priceDescription={advancedData.priceDescription}
                            lookupKey={advancedData.lookupKey}
                            onPriceDescriptionChange={(v) => setAdvancedData(prev => ({ ...prev, priceDescription: v }))}
                            onLookupKeyChange={(v) => setAdvancedData(prev => ({ ...prev, lookupKey: v }))}
                            colors={colors}
                        />
                    </>
                )

            case 'customer-chooses-price':
                return (
                    <>
                        <CustomerChoosesPriceSection
                            minimumAmount={pricingData.minimumAmount}
                            maximumAmount={pricingData.maximumAmount}
                            suggestedAmount={pricingData.suggestedAmount}
                            currency={pricingData.currency}
                            onMinimumChange={(v) => updateField('minimumAmount', v)}
                            onMaximumChange={(v) => updateField('maximumAmount', v)}
                            onSuggestedChange={(v) => updateField('suggestedAmount', v)}
                            onCurrencyChange={(v) => updateField('currency', v)}
                            colors={colors}
                        />

                        <AdvancedPriceSection
                            priceDescription={advancedData.priceDescription}
                            lookupKey={advancedData.lookupKey}
                            onPriceDescriptionChange={(v) => setAdvancedData(prev => ({ ...prev, priceDescription: v }))}
                            onLookupKeyChange={(v) => setAdvancedData(prev => ({ ...prev, lookupKey: v }))}
                            colors={colors}
                        />
                    </>
                )

            case 'tiered':
            case 'usage-based':
                return (
                    <>
                        {/* Show selected meter if one is chosen */}
                        {pricingData.meter && (
                            <SelectedMeterDisplay
                                meterName={meterName}
                                onRemove={handleRemoveMeter}
                                colors={colors}
                            />
                        )}

                        {/* Meter selection if none chosen */}
                        {!pricingData.meter && (
                            <UsageTypeSelector
                                usageType={pricingData.usageType}
                                tierMode={pricingData.tierMode}
                                onUsageTypeChange={(v) => updateField('usageType', v)}
                                onTierModeChange={(v) => updateField('tierMode', v)}
                                colors={colors}
                            />
                        )}

                        {pricingData.usageType === 'per-tier' && (
                            <TieredPricingTable
                                tiers={pricingData.tiers}
                                currency={pricingData.currency}
                                onTiersChange={updateTiers}
                                onCurrencyChange={(v) => updateField('currency', v)}
                                onAddTier={addTier}
                                onRemoveTier={removeTier}
                                colors={colors}
                            />
                        )}

                        {pricingData.usageType !== 'per-tier' && (
                            <FlatRatePriceSection
                                amount={pricingData.amount}
                                currency={pricingData.currency}
                                includeTaxInPrice={pricingData.includeTaxInPrice}
                                onAmountChange={(v) => updateField('amount', v)}
                                onCurrencyChange={(v) => updateField('currency', v)}
                                onTaxChange={(v) => updateField('includeTaxInPrice', v)}
                                colors={colors}
                            />
                        )}

                        {/* Include Tax for tiered */}
                        {pricingData.usageType === 'per-tier' && (
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: colors.text,
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}>
                                    Include tax in price
                                    <Box
                                        component="span"
                                        sx={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: '50%',
                                            border: `1px solid ${colors.textSecondary}`,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 10,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        ?
                                    </Box>
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={pricingData.includeTaxInPrice}
                                        onChange={(e) => updateField('includeTaxInPrice', e.target.value)}
                                        sx={{
                                            bgcolor: colors.inputBg,
                                            borderRadius: 1.5,
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                                            '& .MuiSelect-select': { color: colors.text, fontSize: 14 },
                                        }}
                                    >
                                        {TAX_OPTIONS.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        {/* Usage Meter Section (only when not already selected) */}
                        {pricingData.pricingModel === 'usage-based' && !pricingData.meter && (
                            <UsageMeterSection
                                meter={pricingData.meter}
                                billingPeriod={pricingData.billingPeriod}
                                meters={meters}
                                onMeterChange={(v) => updateField('meter', v)}
                                onBillingPeriodChange={(v) => updateField('billingPeriod', v)}
                                onCreateMeter={onCreateMeter}
                                colors={colors}
                            />
                        )}

                        {/* Billing Period when meter is selected */}
                        {pricingData.meter && (
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: colors.text,
                                    mb: 1
                                }}>
                                    Billing period
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={pricingData.billingPeriod}
                                        onChange={(e) => updateField('billingPeriod', e.target.value)}
                                        sx={{
                                            bgcolor: colors.inputBg,
                                            borderRadius: 1.5,
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                                            '& .MuiSelect-select': { color: colors.text, fontSize: 14 },
                                        }}
                                    >
                                        <MenuItem value="daily">Daily</MenuItem>
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="yearly">Yearly</MenuItem>
                                        <MenuItem value="every-3-months">Every 3 months</MenuItem>
                                        <MenuItem value="every-6-months">Every 6 months</MenuItem>
                                        <MenuItem value="custom">Custom</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        {/* Advanced Section */}
                        <AdvancedPriceSection
                            priceDescription={advancedData.priceDescription}
                            lookupKey={advancedData.lookupKey}
                            onPriceDescriptionChange={(v) => setAdvancedData(prev => ({ ...prev, priceDescription: v }))}
                            onLookupKeyChange={(v) => setAdvancedData(prev => ({ ...prev, lookupKey: v }))}
                            colors={colors}
                        />
                    </>
                )

            case 'package':
                return (
                    <FlatRatePriceSection
                        amount={pricingData.amount}
                        currency={pricingData.currency}
                        includeTaxInPrice={pricingData.includeTaxInPrice}
                        onAmountChange={(v) => updateField('amount', v)}
                        onCurrencyChange={(v) => updateField('currency', v)}
                        onTaxChange={(v) => updateField('includeTaxInPrice', v)}
                        colors={colors}
                    />
                )

            default:
                return null
        }
    }

    return (
        <Box sx={{ display: 'flex', height: '100%', pb: 8 }}>
            {/* Left Form Section */}
            <Box sx={{
                flex: 1,
                p: 3,
                overflowY: 'auto',
                borderRight: `1px solid ${colors.border}`,
            }}>
                <PricingTypeToggle
                    pricingType={pricingData.pricingType}
                    onPricingTypeChange={(v) => updateField('pricingType', v)}
                    colors={colors}
                />

                <PricingModelSelector
                    pricingModel={pricingData.pricingModel}
                    onPricingModelChange={(v) => updateField('pricingModel', v)}
                    colors={colors}
                />

                {renderPricingFields()}
            </Box>

            {/* Right Preview Section */}
            <Box sx={{
                width: 280,
                p: 3,
                bgcolor: colors.previewBg,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <PreviewPanel
                    previewData={previewData}
                    onPreviewChange={(field, value) => setPreviewData(prev => ({ ...prev, [field]: value }))}
                    totals={totals}
                    billingPeriod={pricingData.billingPeriod}
                    colors={colors}
                />
            </Box>

            {/* Footer positioned absolute */}
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                borderTop: `1px solid ${colors.border}`,
                bgcolor: colors.drawerBg || colors.bg,
            }}>
                <Button
                    onClick={onBack}
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
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
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
                    }}
                >
                    Next
                </Button>
            </Box>
        </Box>
    )
}

export default MorePricingOptionsScreen
