import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'http://localhost:3001/api'

export function useMeters() {
    const [meters, setMeters] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchMeters = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`${API_BASE}/meters`)
            if (!res.ok) throw new Error('Failed to fetch meters')
            const data = await res.json()
            setMeters(data.meters || [])
        } catch (err) {
            console.error('Error fetching meters:', err)
            setError(err.message)
            setMeters([])
        } finally {
            setLoading(false)
        }
    }, [])

    const getMeter = useCallback(async (id) => {
        try {
            const res = await fetch(`${API_BASE}/meters/${id}`)
            if (!res.ok) throw new Error('Meter not found')
            return await res.json()
        } catch (err) {
            console.error('Error getting meter:', err)
            return null
        }
    }, [])

    const createMeter = useCallback(async (meterData) => {
        try {
            const res = await fetch(`${API_BASE}/meters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(meterData)
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to create meter')
            }
            const newMeter = await res.json()
            await fetchMeters()
            return { success: true, meter: newMeter }
        } catch (err) {
            console.error('Error creating meter:', err)
            return { success: false, error: err.message }
        }
    }, [fetchMeters])

    const updateMeter = useCallback(async (id, meterData) => {
        try {
            const res = await fetch(`${API_BASE}/meters/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(meterData)
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to update meter')
            }
            const updatedMeter = await res.json()
            await fetchMeters()
            return { success: true, meter: updatedMeter }
        } catch (err) {
            console.error('Error updating meter:', err)
            return { success: false, error: err.message }
        }
    }, [fetchMeters])

    const deleteMeter = useCallback(async (id) => {
        try {
            const res = await fetch(`${API_BASE}/meters/${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete meter')
            await fetchMeters()
            return { success: true }
        } catch (err) {
            console.error('Error deleting meter:', err)
            return { success: false, error: err.message }
        }
    }, [fetchMeters])

    const toggleMeterStatus = useCallback(async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
        return updateMeter(id, { status: newStatus })
    }, [updateMeter])

    useEffect(() => {
        fetchMeters()
    }, [fetchMeters])

    return {
        meters,
        loading,
        error,
        fetchMeters,
        getMeter,
        createMeter,
        updateMeter,
        deleteMeter,
        toggleMeterStatus
    }
}

export default useMeters
