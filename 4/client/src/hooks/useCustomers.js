import { useState, useEffect } from 'react'

export const useCustomers = () => {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:3001/api/customers')

            if (!response.ok) {
                // If endpoint doesn't exist yet, return empty array
                if (response.status === 404) {
                    setCustomers([])
                    return
                }
                throw new Error('Failed to fetch customers')
            }

            const data = await response.json()
            setCustomers(data)
        } catch (err) {
            console.error('Error fetching customers:', err)
            setError(err.message)
            setCustomers([]) // Set empty array on error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    return {
        customers,
        loading,
        error,
        fetchCustomers,
    }
}
