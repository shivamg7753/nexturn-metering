import { useState, useEffect } from 'react'
import {
    Drawer,
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
    Autocomplete,
    Switch,
    FormControlLabel,
    Divider,
    createFilterOptions
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { formatPriceDisplay, getPricingDescription } from '../../utils/priceFormatters'

const filter = createFilterOptions()

function AddSubscriptionDrawer({ open, onClose, customer, themeMode, onSuccess }) {
    const isDark = themeMode === 'dark'

    const colors = {
        bg: isDark ? '#0a0a0a' : '#f5f5f5',
        cardBg: isDark ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.9)',
        border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        text: isDark ? '#ffffff' : '#1a1a1a',
        textSecondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        textTertiary: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        accent: isDark ? '#8b5cf6' : '#7c3aed',
        buttonBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
    }

    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        isForever: true,
        endDate: '',
        products: [],
        selectedProduct: null,
        quantity: 1,
        billingStartDate: new Date().toISOString().split('T')[0],
        trialDays: 0,
        collectTaxAutomatically: false,
        metadata: {}
    })

    const [products, setProducts] = useState([])
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            fetchProducts()
        }
    }, [open])

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/products')
            const data = await response.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const formatPriceLabel = (price) => {
        const priceDisplay = formatPriceDisplay(price)
        const pricingDescription = getPricingDescription(price)
        return `${price.productName || ''}\n${pricingDescription} • ${price.currency || 'INR'} ${price.amount || formatPriceDisplay(price).split(' ')[2]} / ${price.billingPeriod || 'monthly'}`
    }

    const productOptions = products.reduce((acc, product) => {
        // Still filter out invalid ones from the main list, but "Add" will appear for search terms
        if (!product.prices || product.prices.length === 0) return acc;
        product.prices.forEach((price, index) => {
            acc.push({
                id: `${product.id || product._id}-${index}`,
                productName: product.name,
                product: product,
                price: price, // The specific price plan
                priceIndex: index, // Store the index
                label: formatPriceLabel(price)
            })
        })
        return acc;
    }, [])

    const createProductOnTheFly = async (name) => {
        try {
            // Create a product with a default flat-rate monthly price
            const newProductPayload = {
                name: name,
                description: 'Created from subscription drawer',
                status: 'active',
                pricing: 'Recurring',
                prices: [{
                    pricingModel: 'flat-rate',
                    pricingType: 'recurring',
                    amount: 0,
                    currency: 'USD',
                    billingPeriod: 'monthly',
                    includeTaxInPrice: 'auto'
                }]
            }

            const response = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProductPayload)
            })

            const createdProduct = await response.json()

            // Refresh products list
            await fetchProducts()

            // Return the formatted option for the new product
            if (createdProduct && createdProduct.prices && createdProduct.prices.length > 0) {
                return {
                    id: `${createdProduct.id}-${0}`,
                    productName: createdProduct.name,
                    product: createdProduct,
                    price: createdProduct.prices[0],
                    priceIndex: 0,
                    label: formatPriceLabel(createdProduct.prices[0])
                }
            }
            return null
        } catch (error) {
            console.error('Error creating product:', error)
            return null
        }
    }

    const handleAddProduct = () => {
        if (formData.selectedProduct) {
            // selectedProduct is now the Option object { product, price, ... }
            const { product, price, priceIndex } = formData.selectedProduct

            // Check if this exact product+price combination already exists
            const isDuplicate = formData.products.some(
                p => p.productId === (product.id || product._id) && p.priceIndex === priceIndex
            );

            if (isDuplicate) {
                console.warn('This product is already added to the subscription');
                return;
            }

            // Extract details from the specific selected price
            let finalPrice = 0
            if (price.pricingModel === 'flat-rate') {
                finalPrice = price.amount || 0
            } else if (['tiered', 'graduated'].includes(price.pricingModel)) {
                if (price.tiers && price.tiers.length > 0) {
                    finalPrice = price.tiers[0].unitPrice || price.tiers[0].flatFee || 0
                }
            }

            const newProduct = {
                productId: product.id || product._id,
                productName: product.name,
                quantity: formData.quantity,
                price: finalPrice,
                currency: price.currency || 'USD',
                billingPeriod: price.billingPeriod || 'month',
                pricingModel: price.pricingModel,
                priceDetails: price, // Store full details
                priceIndex: priceIndex // Pass the index to the backend
            }

            setFormData(prev => ({
                ...prev,
                products: [...prev.products, newProduct],
                selectedProduct: null,
                quantity: 1
            }))
        }
    }

    const calculateTotal = () => {
        return formData.products.reduce((sum, product) => {
            return sum + (product.price * product.quantity)
        }, 0)
    }

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount)
    }

    const handleSubmit = async () => {
        try {
            setSubmitting(true)

            const subscriptionData = {
                customerId: customer.id,
                products: formData.products,
                duration: {
                    startDate: formData.startDate,
                    endDate: formData.isForever ? null : formData.endDate,
                    isForever: formData.isForever
                },
                billingStartDate: formData.billingStartDate,
                trialDays: formData.trialDays,
                collectTaxAutomatically: formData.collectTaxAutomatically,
                metadata: formData.metadata
            }

            const response = await fetch('http://localhost:3001/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscriptionData)
            })

            if (!response.ok) {
                throw new Error('Failed to create subscription')
            }

            if (onSuccess) {
                onSuccess()
            }

            handleClose()
        } catch (error) {
            console.error('Error creating subscription:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            startDate: new Date().toISOString().split('T')[0],
            isForever: true,
            endDate: '',
            products: [],
            selectedProduct: null,
            quantity: 1,
            billingStartDate: new Date().toISOString().split('T')[0],
            trialDays: 0,
            collectTaxAutomatically: false,
            metadata: {}
        })
        onClose()
    }

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 600 },
                    bgcolor: colors.cardBg,
                    backgroundImage: 'none',
                    borderLeft: `1px solid ${colors.border}`,
                }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1.125rem' }}>
                        Create a test subscription
                    </Typography>
                    <IconButton onClick={handleClose} sx={{ color: colors.textSecondary }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                    {/* Customer Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem', mb: 1.5 }}>
                            Customer
                        </Typography>
                        <Box sx={{ bgcolor: colors.hover, border: `1px solid ${colors.border}`, borderRadius: 2, p: 2 }}>
                            <Typography sx={{ color: colors.text, fontSize: '0.875rem', mb: 0.5 }}>
                                {customer?.email}
                            </Typography>
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                {customer?.name}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Subscription Details */}
                    <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem', mb: 2 }}>
                        Subscription details
                    </Typography>

                    {/* Duration */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem', mb: 1 }}>
                            Duration
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                size="small"
                                InputProps={{
                                    startAdornment: <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: colors.textTertiary }} />
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        bgcolor: colors.cardBg,
                                        '& fieldset': { borderColor: colors.border },
                                    }
                                }}
                            />
                            <Typography sx={{ color: colors.textTertiary }}>→</Typography>
                            {formData.isForever ? (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setFormData({ ...formData, isForever: false })}
                                    sx={{
                                        color: colors.text,
                                        borderColor: colors.border,
                                        textTransform: 'none',
                                        '&:hover': { borderColor: colors.accent }
                                    }}
                                >
                                    Forever
                                </Button>
                            ) : (
                                <TextField
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: colors.text,
                                            bgcolor: colors.cardBg,
                                            '& fieldset': { borderColor: colors.border },
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Pricing */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem', mb: 1 }}>
                            Pricing
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 2, mb: 1 }}>
                            <Typography sx={{ color: colors.textTertiary, fontSize: '0.75rem' }}>PRODUCT</Typography>
                            <Typography sx={{ color: colors.textTertiary, fontSize: '0.75rem' }}>QTY</Typography>
                            <Typography sx={{ color: colors.textTertiary, fontSize: '0.75rem' }}>TOTAL</Typography>
                        </Box>

                        {/* Product Selection */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 2, mb: 2 }}>
                            <Autocomplete
                                value={formData.selectedProduct}
                                onChange={async (e, newValue) => {
                                    // Prevent setting the same value twice
                                    if (newValue === formData.selectedProduct) {
                                        return;
                                    }

                                    if (typeof newValue === 'string') {
                                        // Timeout to avoid interference
                                        setTimeout(() => {
                                            // Handling direct string entry if freeSolo were true (it's not, but good for safety)
                                        });
                                    } else if (newValue && newValue.inputValue) {
                                        // Create a new value from the user input
                                        const newOption = await createProductOnTheFly(newValue.inputValue);
                                        if (newOption) {
                                            setFormData(prev => ({ ...prev, selectedProduct: newOption }));
                                        }
                                    } else {
                                        setFormData(prev => ({ ...prev, selectedProduct: newValue }));
                                    }
                                }}
                                filterOptions={(options, params) => {
                                    const filtered = filter(options, params);

                                    const { inputValue } = params;
                                    // Suggest the creation of a new value
                                    const isExisting = options.some((option) => inputValue === option.productName);
                                    if (inputValue !== '' && !isExisting) {
                                        filtered.push({
                                            inputValue,
                                            productName: `Add "${inputValue}"`,
                                            label: 'Create new product with default pricing',
                                            id: 'new-product-id'
                                        });
                                    }
                                    return filtered;
                                }}
                                options={productOptions}
                                groupBy={(option) => option.productName}
                                getOptionLabel={(option) => {
                                    // Value selected with enter, right from the input
                                    if (typeof option === 'string') {
                                        return option;
                                    }
                                    // Add "xxx" option created dynamically
                                    if (option.inputValue) {
                                        return option.productName;
                                    }
                                    // Regular option
                                    return option.productName ? `${option.productName} - ${option.label}` : '';
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: option.inputValue ? 600 : 400 }}>
                                                {option.productName}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                                                {option.label}
                                            </Typography>
                                        </Box>
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Find or add a test product..."
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: colors.text,
                                                bgcolor: colors.cardBg,
                                                '& fieldset': { borderColor: colors.border },
                                            }
                                        }}
                                    />
                                )}
                                selectOnFocus
                                clearOnBlur
                                handleHomeEndKeys
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                size="small"
                                sx={{
                                    width: 80,
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        bgcolor: colors.cardBg,
                                        '& fieldset': { borderColor: colors.border },
                                    }
                                }}
                            />
                            <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', pt: 1, width: 60, textAlign: 'right' }}>
                                —
                            </Typography>
                        </Box>

                        {/* Added Products List */}
                        {formData.products.map((product, index) => (
                            <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 2, mb: 1 }}>
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>{product.productName}</Typography>
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}>{product.quantity}</Typography>
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem', textAlign: 'right', width: 60 }}>
                                    {formatCurrency(product.price * product.quantity, product.currency)}
                                </Typography>
                            </Box>
                        ))}

                        {/* Total */}
                        {formData.products.length > 0 && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 2, mt: 2, pt: 2, borderTop: `1px solid ${colors.border}` }}>
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem', fontWeight: 600 }}>Total</Typography>
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem' }}></Typography>
                                <Typography sx={{ color: colors.text, fontSize: '0.875rem', fontWeight: 600, textAlign: 'right', width: 60 }}>
                                    {formatCurrency(calculateTotal(), formData.products[0]?.currency || 'USD')}
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                            <Button
                                onClick={handleAddProduct}
                                disabled={!formData.selectedProduct}
                                sx={{
                                    color: colors.accent,
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    p: 0,
                                    minWidth: 'auto',
                                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                }}
                            >
                                Add product
                            </Button>
                            <Button
                                sx={{
                                    color: colors.accent,
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    p: 0,
                                    minWidth: 'auto',
                                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                }}
                            >
                                Add coupon
                            </Button>
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.collectTaxAutomatically}
                                    onChange={(e) => setFormData({ ...formData, collectTaxAutomatically: e.target.checked })}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: colors.accent },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.accent }
                                    }}
                                />
                            }
                            label="Collect tax automatically"
                            sx={{ color: colors.text, mt: 2, mb: 1 }}
                        />

                        <Button
                            sx={{
                                color: colors.accent,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                p: 0,
                                minWidth: 'auto',
                                display: 'block',
                                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                            }}
                        >
                            Add tax manually
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3, borderColor: colors.border }} />

                    {/* Bill Starting */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem', mb: 1 }}>
                            Bill starting
                        </Typography>
                        <TextField
                            type="date"
                            value={formData.billingStartDate}
                            onChange={(e) => setFormData({ ...formData, billingStartDate: e.target.value })}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: colors.textTertiary }} />
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    bgcolor: colors.cardBg,
                                    '& fieldset': { borderColor: colors.border },
                                }
                            }}
                        />
                        <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mt: 1 }}>
                            This is when the first invoice will be generated.
                        </Typography>
                    </Box>

                    {/* Free Trial Days */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem', mb: 1 }}>
                            Free trial days
                        </Typography>
                        {formData.trialDays > 0 ? (
                            <TextField
                                type="number"
                                value={formData.trialDays}
                                onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                                size="small"
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: colors.text,
                                        bgcolor: colors.cardBg,
                                        '& fieldset': { borderColor: colors.border },
                                    }
                                }}
                            />
                        ) : (
                            <Button
                                startIcon={<span>+</span>}
                                onClick={() => setFormData({ ...formData, trialDays: 7 })}
                                sx={{
                                    color: colors.accent,
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    p: 0,
                                    minWidth: 'auto',
                                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                }}
                            >
                                Add trial days
                            </Button>
                        )}
                    </Box>

                    {/* Metadata */}
                    <Box>
                        <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem', mb: 1 }}>
                            Metadata
                        </Typography>
                        <Button
                            startIcon={<span>+</span>}
                            sx={{
                                color: colors.accent,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                p: 0,
                                minWidth: 'auto',
                                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                            }}
                        >
                            Add metadata
                        </Button>
                    </Box>
                </Box>

                {/* Footer */}
                <Box sx={{ p: 3, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        sx={{
                            color: colors.textSecondary,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            '&:hover': { bgcolor: colors.hover }
                        }}
                    >
                        ◀ Feedback?
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitting || formData.products.length === 0}
                        sx={{
                            background: colors.buttonBg,
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                            },
                            '&:disabled': {
                                bgcolor: colors.textTertiary,
                                color: colors.textSecondary
                            }
                        }}
                    >
                        {submitting ? 'Creating...' : 'Create test subscription'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
}

export default AddSubscriptionDrawer
