import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'http://localhost:3001/api'

export function useProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [counts, setCounts] = useState({ all: 0, active: 0, archived: 0 })

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`${API_BASE}/products?status=${statusFilter}`)
            const data = await res.json()
            setProducts(data.products)
            setCounts(data.counts)
        } catch (err) {
            console.error('Error fetching products:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    return {
        products,
        loading,
        error,
        statusFilter,
        setStatusFilter,
        counts,
        fetchProducts
    }
}

export default useProducts
