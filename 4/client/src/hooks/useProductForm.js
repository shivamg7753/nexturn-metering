import { useState, useCallback } from 'react'

const initialFormState = {
    name: '',
    description: '',
    image: null,
    taxCode: 'general-electronic',
    pricingType: 'recurring', // 'recurring' | 'one-off'
    amount: '',
    currency: 'INR',
    includeTaxInPrice: 'auto',
    billingPeriod: 'monthly',
}

const initialPreviewState = {
    unitQuantity: 1,
    location: 'United States',
    state: '',
}

export function useProductForm() {
    const [formData, setFormData] = useState(initialFormState)
    const [previewData, setPreviewData] = useState(initialPreviewState)
    const [showMoreOptions, setShowMoreOptions] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }))
        }
    }, [errors])

    const updatePreview = useCallback((field, value) => {
        setPreviewData(prev => ({ ...prev, [field]: value }))
    }, [])

    const toggleMoreOptions = useCallback(() => {
        setShowMoreOptions(prev => !prev)
    }, [])

    const validate = useCallback(() => {
        const newErrors = {}
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }
        if (showMoreOptions && !formData.amount) {
            newErrors.amount = 'Amount is required'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [formData, showMoreOptions])

    const resetForm = useCallback(() => {
        setFormData(initialFormState)
        setPreviewData(initialPreviewState)
        setShowMoreOptions(false)
        setErrors({})
    }, [])

    // Calculate preview totals
    const calculateTotals = useCallback(() => {
        const amount = parseFloat(formData.amount) || 0
        const quantity = previewData.unitQuantity || 1
        const subtotal = amount * quantity
        const tax = 0 // Would be calculated based on location/tax code
        const total = subtotal + tax

        return {
            subtotal: `₹${subtotal.toFixed(2)}`,
            tax: tax > 0 ? `₹${tax.toFixed(2)}` : '-',
            total: `₹${total.toFixed(2)}`,
            priceDisplay: `${quantity} × ₹${amount.toFixed(2)} = ₹${subtotal.toFixed(2)}`
        }
    }, [formData.amount, previewData.unitQuantity])

    return {
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
    }
}

export default useProductForm
