import { useState, useCallback } from 'react'

const initialState = {
    pricingType: 'recurring',
    pricingModel: 'flat-rate',
    currency: 'INR',
    amount: '',

    // Tiered/Graduated/Volume pricing
    tiers: [{ upTo: null, unitPrice: '', flatFee: '' }],

    // Usage-based
    usageType: 'metered',
    tierMode: 'graduated',
    meter: '',

    // Package pricing
    packageSize: '',

    // Customer-chooses-price
    minimumAmount: '',
    maximumAmount: '',
    suggestedAmount: '',

    billingPeriod: 'monthly',
    includeTaxInPrice: 'auto',
}

export function useAdvancedPricing() {
    const [pricingData, setPricingData] = useState(initialState)
    const [errors, setErrors] = useState({})

    const updateField = useCallback((field, value) => {
        setPricingData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }))
        }
    }, [errors])

    const updateTiers = useCallback((newTiers) => {
        setPricingData(prev => ({ ...prev, tiers: newTiers }))
    }, [])

    const addTier = useCallback(() => {
        setPricingData(prev => {
            const lastTier = prev.tiers[prev.tiers.length - 1]
            const newFirstUnit = lastTier ? String(parseInt(lastTier.lastUnit) + 1 || prev.tiers.length + 1) : '1'
            return {
                ...prev,
                tiers: [
                    ...prev.tiers.slice(0, -1),
                    { ...prev.tiers[prev.tiers.length - 1], lastUnit: String(parseInt(newFirstUnit) - 1) },
                    { firstUnit: newFirstUnit, lastUnit: '∞', perUnit: '', flatFee: '' },
                ],
            }
        })
    }, [])

    const removeTier = useCallback((index) => {
        setPricingData(prev => ({
            ...prev,
            tiers: prev.tiers.filter((_, i) => i !== index),
        }))
    }, [])

    const validate = useCallback(() => {
        const newErrors = {}

        if (pricingData.pricingModel === 'flat-rate' && !pricingData.amount) {
            newErrors.amount = 'Amount is required'
        }

        if (pricingData.pricingModel === 'usage-based' && !pricingData.meter) {
            newErrors.meter = 'Please select a meter'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [pricingData])

    const reset = useCallback(() => {
        setPricingData(initialState)
        setErrors({})
    }, [])

    // Calculate preview based on pricing model
    const calculatePreview = useCallback((unitQuantity = 1) => {
        let subtotal = 0

        switch (pricingData.pricingModel) {
            case 'flat-rate':
                subtotal = (parseFloat(pricingData.amount) || 0) * unitQuantity
                break
            case 'tiered':
            case 'usage-based':
                // Calculate based on tiers
                let remaining = unitQuantity
                for (const tier of pricingData.tiers) {
                    const firstUnit = parseInt(tier.firstUnit) || 1
                    const lastUnit = tier.lastUnit === '∞' ? Infinity : parseInt(tier.lastUnit)
                    const perUnit = parseFloat(tier.perUnit) || 0
                    const flatFee = parseFloat(tier.flatFee) || 0

                    if (remaining > 0) {
                        const unitsInTier = Math.min(remaining, lastUnit - firstUnit + 1)
                        if (pricingData.tierMode === 'volume') {
                            // Volume: all units at this tier's rate
                            subtotal = (perUnit * unitQuantity) + flatFee
                        } else {
                            // Graduated: each tier's units at tier's rate
                            subtotal += (perUnit * unitsInTier) + flatFee
                        }
                        remaining -= unitsInTier
                    }
                }
                break
            default:
                subtotal = (parseFloat(pricingData.amount) || 0) * unitQuantity
        }

        const tax = 0 // Would be calculated based on location
        const total = subtotal + tax

        return {
            subtotal: `₹${subtotal.toFixed(2)}`,
            tax: tax > 0 ? `₹${tax.toFixed(2)}` : '-',
            total: `₹${total.toFixed(2)}`,
            priceDisplay: `${unitQuantity} × ₹${(subtotal / unitQuantity || 0).toFixed(2)} = ₹${subtotal.toFixed(2)}`
        }
    }, [pricingData])

    return {
        pricingData,
        errors,
        updateField,
        updateTiers,
        addTier,
        removeTier,
        validate,
        reset,
        calculatePreview,
    }
}

export default useAdvancedPricing
