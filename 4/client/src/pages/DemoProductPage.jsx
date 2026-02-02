import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    Divider,
    Card,
    CardContent,
    Chip,
    Snackbar,
    Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BoltIcon from '@mui/icons-material/Bolt';
import { getThemeColors, getGlassStyle } from '../theme/styles';
import { buildApiUrl } from '../api/config';
import { formatPriceDisplay } from '../utils/priceFormatters';

function DemoProductPage({ themeMode = 'dark' }) {
    const isDark = themeMode === 'dark';
    const colors = getThemeColors(themeMode);
    const glassStyle = getGlassStyle(themeMode);

    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [associatedCustomers, setAssociatedCustomers] = useState([]);
    const [customerId, setCustomerId] = useState('');
    const [usageValue, setUsageValue] = useState(1);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(buildApiUrl('/products'));
                const data = await res.json();
                setProducts(data.products || []);
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };
        fetchProducts();
    }, []);

    const handleProductChange = async (e) => {
        const id = e.target.value;
        setSelectedProductId(id);
        const product = products.find(p => p.id === id);
        setSelectedProduct(product);

        // Fetch associated customers for this product
        try {
            const res = await fetch(buildApiUrl(`/subscriptions?productId=${id}`));
            const subscriptions = await res.json();

            const customers = subscriptions.map(sub => ({
                id: sub.customerId.customerId || sub.customerId._id,
                name: sub.customerId.name,
                email: sub.customerId.email
            })).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i); // Unique customers

            setAssociatedCustomers(customers);

            if (customers.length > 0) {
                setCustomerId(customers[0].id);
            } else {
                setCustomerId('cust_unsubscribed_user');
            }
        } catch (err) {
            console.error('Error fetching associated customers:', err);
            setCustomerId('cust_error_fetch');
        }
    };

    const sendEvent = async (customValue = null) => {
        if (!selectedProduct) {
            setSnackbar({ open: true, message: 'Please select a product first', severity: 'warning' });
            return;
        }

        // Find the meter associated with the product price
        const price = selectedProduct.prices?.[0];
        const eventName = price?.meter || 'usage_event';
        const value = customValue !== null ? customValue : usageValue;

        // Structured JSON: Event Name as the key
        const payload = {
            [eventName]: {
                value: parseFloat(value),
                unit: selectedProduct.unitLabel || 'unit'
            },
            timestamp: new Date().toISOString()
        };

        try {
            setLoading(true);
            const res = await fetch(buildApiUrl('/ingest'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventName,
                    customerId,
                    payload
                })
            });

            if (res.ok) {
                setSnackbar({ open: true, message: `Event "${eventName}" sent successfully!`, severity: 'success' });
            } else {
                const err = await res.json();
                throw new Error(err.error || 'Failed to send event');
            }
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                    Demo Product Simulator
                </Typography>
                <Typography sx={{ color: colors.textSecondary }}>
                    Connect to the Metering Engine and simulate real-time usage for your products
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Configuration Panel */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{
                        ...glassStyle,
                        p: 3,
                        border: `1px solid ${colors.border}`,
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)'
                    }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: colors.text }}>
                            Simulation Settings
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel sx={{ color: colors.textSecondary }}>Select Product to Connect</InputLabel>
                            <Select
                                value={selectedProductId}
                                label="Select Product to Connect"
                                onChange={handleProductChange}
                                sx={{
                                    color: colors.text,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }
                                }}
                            >
                                {products.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel sx={{ color: colors.textSecondary }}>Associated Customer ID</InputLabel>
                            <Select
                                value={customerId}
                                label="Associated Customer ID"
                                onChange={(e) => setCustomerId(e.target.value)}
                                sx={{
                                    color: colors.text,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }
                                }}
                            >
                                {associatedCustomers.map(c => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.name} ({c.id})
                                    </MenuItem>
                                ))}
                                {associatedCustomers.length === 0 && (
                                    <MenuItem value={customerId || 'cust_demo_123'}>
                                        {customerId || 'cust_demo_123'} (Manual Entry)
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Manual Customer ID"
                            helperText="Override or manually enter customer ID"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            sx={{
                                mb: 3,
                                input: { color: colors.text },
                                '& .MuiFormLabel-root': { color: colors.textSecondary },
                                '& .MuiFormHelperText-root': { color: colors.textSecondary }
                            }}
                        />

                        <Divider sx={{ my: 3, borderColor: colors.border }} />

                        <Typography variant="subtitle2" sx={{ mb: 2, color: colors.textSecondary }}>
                            Quick Actions
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<BoltIcon />}
                                onClick={() => sendEvent(1)}
                                disabled={loading}
                                sx={{
                                    bgcolor: '#a78bfa',
                                    '&:hover': { bgcolor: '#8b5cf6' },
                                    fontWeight: 600
                                }}
                            >
                                Send Heartbeat (1 unit)
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                type="number"
                                label="Custom Usage"
                                value={usageValue}
                                onChange={(e) => setUsageValue(e.target.value)}
                                size="small"
                                sx={{ flex: 1, input: { color: colors.text }, label: { color: colors.textSecondary } }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<SendIcon />}
                                onClick={() => sendEvent()}
                                disabled={loading}
                                sx={{ borderColor: colors.border, color: colors.text }}
                            >
                                Send Data
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Connection Status & Price Plans */}
                <Grid item xs={12} md={7}>
                    {selectedProduct ? (
                        <Box>
                            <Paper sx={{
                                ...glassStyle,
                                p: 3,
                                mb: 3,
                                border: `1px solid #4ade80`,
                                bgcolor: isDark ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.05)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: colors.text }}>
                                            Connected to: {selectedProduct.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#4ade80' }}>
                                            API Link: http://localhost:3001/api/products/{selectedProduct.id}
                                        </Typography>
                                    </Box>
                                    <Chip label="LIVE" sx={{ bgcolor: '#4ade80', color: '#166534', fontWeight: 800 }} />
                                </Box>
                            </Paper>

                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: colors.text }}>
                                Active Price Plans
                            </Typography>

                            <Grid container spacing={2}>
                                {selectedProduct.prices?.map((price, idx) => (
                                    <Grid item xs={12} sm={6} key={idx}>
                                        <Card sx={{
                                            bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 2
                                        }}>
                                            <CardContent>
                                                <Typography sx={{ color: '#a78bfa', fontWeight: 600, mb: 1 }}>
                                                    {price.priceName || 'Standard Plan'}
                                                </Typography>
                                                <Typography variant="h5" sx={{ color: colors.text, mb: 2, fontWeight: 700 }}>
                                                    {formatPriceDisplay(price).replace('Starts at ', '')}
                                                </Typography>

                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    <Chip label={price.pricingModel} size="small" variant="outlined" sx={{ color: colors.textSecondary }} />
                                                    <Chip label={price.usageType || 'per-unit'} size="small" variant="outlined" sx={{ color: colors.textSecondary }} />
                                                </Box>

                                                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                                                    Metered Event: <strong>{price.meter}</strong>
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ) : (
                        <Box sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: 0.5
                        }}>
                            <SendIcon sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
                            <Typography sx={{ color: colors.textSecondary }}>
                                Select a product to view connection details and price plans
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default DemoProductPage;
