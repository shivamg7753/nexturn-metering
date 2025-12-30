import { useState } from 'react'
import { Box, LinearProgress } from '@mui/material'
import { useProducts } from '../hooks/useProducts'
import {
    PageHeader,
    NavigationTabs,
    StatusCards,
    FilterBar,
    ProductsTable,
    Pagination,
    AddProductDrawer,
} from '../components/products'
import { getProductCatalogueColors } from '../components/products/themeUtils'

const ROWS_PER_PAGE = 10

function ProductCataloguePage({ themeMode }) {
    const { products, loading, statusFilter, setStatusFilter, counts, fetchProducts } = useProducts()
    const [activeTab, setActiveTab] = useState(0)
    const [page, setPage] = useState(1)
    const [drawerOpen, setDrawerOpen] = useState(false)
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
    }

    const handleSubmitProduct = async (productData) => {
        try {
            const response = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: productData.name,
                    description: productData.description,
                    pricing: productData.amount ? `₹${productData.amount}` : '1 price',
                    taxCategory: productData.taxCode === 'general-electronic'
                        ? 'General - Electronically Supplied Services'
                        : productData.taxCode,
                    status: 'active',
                }),
            })

            if (!response.ok) throw new Error('Failed to create product')

            // Refresh the products list
            fetchProducts()
        } catch (error) {
            console.error('Error creating product:', error)
            throw error
        }
    }

    const handleAnalyse = () => {
        console.log('Analyse clicked')
    }

    const handleProductAction = (product) => {
        console.log('Product action:', product.id)
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
            />
        </Box>
    )
}

export default ProductCataloguePage
