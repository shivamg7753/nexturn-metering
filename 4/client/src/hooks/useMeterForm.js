import { useState, useCallback } from 'react'

const initialMeterState = {
    displayName: '',
    eventName: '',
    aggregationMethod: 'Sum',
    eventIngestion: 'Raw',
    dimensions: '',
    valueKey: 'value',
    customerMappingKey: 'stripe_customer_id'
}

const initialExampleUsage = [
    { value: 1, date: '6 May 2025, 13:20' },
    { value: 10, date: '7 May 2025, 13:20' },
    { value: 5, date: '8 May 2025, 13:20' },
]

export function useMeterForm() {
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [editingMeter, setEditingMeter] = useState(null)
    const [newMeter, setNewMeter] = useState(initialMeterState)
    const [exampleUsage, setExampleUsage] = useState(initialExampleUsage)

    const openCreateForm = useCallback(() => {
        setShowCreateForm(true)
    }, [])

    const openEditForm = useCallback((meter) => {
        setEditingMeter(meter)
        setNewMeter({
            displayName: meter.displayName,
            eventName: meter.eventName,
            aggregationMethod: meter.aggregationMethod || 'Sum',
            eventIngestion: meter.eventIngestion || 'Raw',
            dimensions: meter.dimensions?.join(', ') || '',
            valueKey: meter.valueKey || 'value',
            customerMappingKey: meter.customerMappingKey || 'stripe_customer_id'
        })
        setShowCreateForm(true)
    }, [])

    const closeForm = useCallback(() => {
        setShowCreateForm(false)
        setShowAdvanced(false)
        setEditingMeter(null)
        setNewMeter(initialMeterState)
    }, [])

    const updateMeterField = useCallback((field, value) => {
        setNewMeter(prev => ({ ...prev, [field]: value }))
    }, [])

    const toggleAdvanced = useCallback(() => {
        setShowAdvanced(prev => !prev)
    }, [])

    const removeExampleUsage = useCallback((index) => {
        setExampleUsage(prev => prev.filter((_, i) => i !== index))
    }, [])

    const calculatePreview = useCallback(() => {
        if (exampleUsage.length === 0) return { formula: '0', result: 0 }
        switch (newMeter.aggregationMethod) {
            case 'Sum':
                return {
                    formula: exampleUsage.map(e => e.value).join(' + '),
                    result: exampleUsage.reduce((sum, e) => sum + e.value, 0)
                }
            case 'Count':
                return {
                    formula: `${exampleUsage.length} events`,
                    result: exampleUsage.length
                }
            case 'Last':
                return {
                    formula: `Last value: ${exampleUsage[exampleUsage.length - 1]?.value}`,
                    result: exampleUsage[exampleUsage.length - 1]?.value || 0
                }
            default:
                return { formula: '0', result: 0 }
        }
    }, [exampleUsage, newMeter.aggregationMethod])

    const getMeterData = useCallback(() => ({
        ...newMeter,
        dimensions: newMeter.dimensions ? newMeter.dimensions.split(',').map(d => d.trim()).filter(d => d) : []
    }), [newMeter])

    const isFormValid = Boolean(newMeter.displayName && newMeter.eventName)

    return {
        // State
        showCreateForm,
        showAdvanced,
        editingMeter,
        newMeter,
        exampleUsage,
        isFormValid,

        // Actions
        openCreateForm,
        openEditForm,
        closeForm,
        updateMeterField,
        toggleAdvanced,
        removeExampleUsage,
        calculatePreview,
        getMeterData,
    }
}

export default useMeterForm
