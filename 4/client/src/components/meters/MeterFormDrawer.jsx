import {
    Box,
    Typography,
    Button,
    Drawer,
    TextField,
    MenuItem,
    Divider,
    Collapse,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { ThemeProvider } from '@mui/material/styles'
import { gradientBg, getGlassStyle, getThemeColors } from '../../theme/styles'
import { darkTheme, lightTheme } from '../../theme'
import { aggregationDescriptions } from '../../constants/menuItems.jsx'

function MeterFormDrawer({
    open,
    onClose,
    editingMeter,
    newMeter,
    showAdvanced,
    exampleUsage,
    preview,
    onUpdateField,
    onToggleAdvanced,
    onRemoveExampleUsage,
    onSubmit,
    isFormValid,
    themeMode = 'dark'
}) {
    const isDark = themeMode === 'dark'
    const colors = getThemeColors(themeMode)
    const glassStyle = getGlassStyle(themeMode)

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 950,
                    bgcolor: isDark ? '#0a0a0f' : '#f8fafc',
                    borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.1)',
                }
            }}
        >
            <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
                <Box sx={{ display: 'flex', height: '100%' }}>
                    {/* Left - Form */}
                    <Box sx={{
                        flex: 1,
                        p: 5,
                        borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.1)',
                        overflowY: 'auto',
                        background: isDark
                            ? 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)'
                            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                    }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Box sx={{
                                width: 44,
                                height: 44,
                                ...gradientBg,
                                borderRadius: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
                            }}>
                                {editingMeter ? <EditIcon sx={{ color: '#fff' }} /> : <AddIcon sx={{ color: '#fff' }} />}
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary }}>
                                    {editingMeter ? 'Edit Meter' : 'Create Meter'}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: colors.textMuted }}>
                                    {editingMeter ? 'Update meter configuration' : 'Configure a new usage meter for billing'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Meter Name */}
                        <Box sx={{ mb: 4 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: colors.textPrimary }}>Meter Name</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.textMuted, mb: 1.5 }}>Display name for the meter. Not displayed to customers.</Typography>
                            <TextField
                                placeholder="e.g., API Requests, Token Usage"
                                value={newMeter.displayName}
                                onChange={(e) => onUpdateField('displayName', e.target.value)}
                                size="small"
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { fontSize: 14 } }}
                            />
                        </Box>

                        {/* Event Name */}
                        <Box sx={{ mb: 4 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: colors.textPrimary }}>Event Name</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.textMuted, mb: 1.5 }}>Unique identifier sent with each event. Cannot be changed after creation.</Typography>
                            <TextField
                                placeholder="api_requests"
                                value={newMeter.eventName}
                                onChange={(e) => onUpdateField('eventName', e.target.value)}
                                size="small"
                                fullWidth
                                disabled={!!editingMeter}
                                sx={{ '& .MuiOutlinedInput-root': { fontSize: 14, fontFamily: "'JetBrains Mono', monospace" } }}
                            />
                            {editingMeter && (
                                <Typography sx={{ fontSize: 11, color: '#f59e0b', mt: 1 }}>
                                    Event name cannot be changed after creation
                                </Typography>
                            )}
                        </Box>

                        {/* Aggregation Method */}
                        <Box sx={{ mb: 4 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: colors.textPrimary }}>Aggregation Method</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.textMuted, mb: 1.5 }}>Specify how to aggregate meter events into a single value.</Typography>
                            <TextField
                                select
                                value={newMeter.aggregationMethod}
                                onChange={(e) => onUpdateField('aggregationMethod', e.target.value)}
                                size="small"
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { fontSize: 14 } }}
                            >
                                {['Sum', 'Count', 'Last'].map(method => (
                                    <MenuItem key={method} value={method}>
                                        <Box>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{method}</Typography>
                                            <Typography sx={{ fontSize: 11, color: colors.textMuted }}>
                                                {method === 'Sum' && 'Sum of all usage values'}
                                                {method === 'Count' && 'Count of all usage events'}
                                                {method === 'Last' && 'Most recent usage value'}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* Event Ingestion */}
                        <Box sx={{ mb: 4 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: colors.textPrimary }}>Event Ingestion</Typography>
                            <Typography sx={{ fontSize: 12, color: colors.textMuted, mb: 1.5 }}>Specify how to send events.</Typography>
                            <FormControl>
                                <RadioGroup
                                    value={newMeter.eventIngestion}
                                    onChange={(e) => onUpdateField('eventIngestion', e.target.value)}
                                >
                                    {[
                                        { value: 'Raw', title: 'Raw', desc: 'Handle all meter events as standalone events.' },
                                        { value: 'Pre-aggregated', title: 'Pre-aggregated', desc: 'Only uses the most recently received meter event in each time interval.' },
                                    ].map(option => (
                                        <FormControlLabel
                                            key={option.value}
                                            value={option.value}
                                            control={<Radio size="small" sx={{ color: '#64748b', '&.Mui-checked': { color: '#8b5cf6' } }} />}
                                            label={
                                                <Box sx={{ ml: 0.5 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{option.title}</Typography>
                                                    <Typography sx={{ fontSize: 11, color: colors.textMuted }}>{option.desc}</Typography>
                                                </Box>
                                            }
                                            sx={{ mb: 1.5, alignItems: 'flex-start' }}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Box>

                        {/* Advanced Options Toggle */}
                        <Button
                            variant="text"
                            onClick={onToggleAdvanced}
                            sx={{
                                color: '#8b5cf6',
                                fontSize: 13,
                                fontWeight: 600,
                                mb: 2,
                                p: 0,
                                '&:hover': { bgcolor: 'transparent', color: '#a78bfa' }
                            }}
                            endIcon={showAdvanced ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        >
                            Advanced Options
                        </Button>

                        <Collapse in={showAdvanced}>
                            <Box sx={{ ...glassStyle, p: 3, borderRadius: 3, mb: 3 }}>
                                {/* Dimensions */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: '#f8fafc' }}>Dimensions</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1.5 }}>
                                        Tag your usage data with dimensions for granular analytics and pricing.
                                    </Typography>
                                    <TextField
                                        placeholder="model, token_type, region"
                                        value={newMeter.dimensions}
                                        onChange={(e) => onUpdateField('dimensions', e.target.value)}
                                        size="small"
                                        fullWidth
                                        helperText="Comma-separated list of dimension names"
                                        sx={{
                                            '& .MuiOutlinedInput-root': { fontSize: 13 },
                                            '& .MuiFormHelperText-root': { color: '#475569' }
                                        }}
                                    />
                                </Box>

                                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

                                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 2.5, color: '#f8fafc' }}>Payload Key Overrides</Typography>

                                {/* Value Key */}
                                <Box sx={{ mb: 2.5 }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: '#f8fafc' }}>Value Key</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1.5 }}>
                                        Key in the event payload for numerical usage value.
                                    </Typography>
                                    <TextField
                                        placeholder="value"
                                        value={newMeter.valueKey}
                                        onChange={(e) => onUpdateField('valueKey', e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, fontFamily: "'JetBrains Mono', monospace" } }}
                                    />
                                </Box>

                                {/* Customer Mapping Key */}
                                <Box>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: '#f8fafc' }}>Customer Mapping Key</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1.5 }}>
                                        Key in the event payload for Customer ID.
                                    </Typography>
                                    <TextField
                                        placeholder="stripe_customer_id"
                                        value={newMeter.customerMappingKey}
                                        onChange={(e) => onUpdateField('customerMappingKey', e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, fontFamily: "'JetBrains Mono', monospace" } }}
                                    />
                                </Box>
                            </Box>
                        </Collapse>

                        {/* Footer */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            pt: 4,
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            mt: 3
                        }}>
                            <Button
                                variant="text"
                                startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                                sx={{ color: '#64748b', fontSize: 13, '&:hover': { color: '#94a3b8' } }}
                            >
                                View Docs
                            </Button>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#94a3b8',
                                    px: 3,
                                    '&:hover': { borderColor: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={onSubmit}
                                disabled={!isFormValid}
                                sx={{
                                    ...gradientBg,
                                    px: 3,
                                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                                    '&:hover': { boxShadow: '0 6px 30px rgba(139, 92, 246, 0.5)' },
                                    '&.Mui-disabled': { opacity: 0.5 }
                                }}
                            >
                                {editingMeter ? 'Update Meter' : 'Create Meter'}
                            </Button>
                        </Box>
                    </Box>

                    {/* Right - Preview Panel */}
                    <Box sx={{
                        width: 380,
                        p: 4,
                        overflowY: 'auto',
                        background: isDark
                            ? 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)'
                            : 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography sx={{ fontSize: 12, color: colors.textMuted, fontWeight: 500 }}>Preview</Typography>
                            <IconButton size="small" onClick={onClose} sx={{ color: colors.textMuted }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Typography sx={{ fontSize: 12, color: colors.textMuted, mb: 1, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Aggregation</Typography>
                        <Typography sx={{
                            fontSize: 22,
                            fontWeight: 700,
                            mb: 2,
                            background: colors.headerGradient,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {newMeter.aggregationMethod}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: colors.textMuted, mb: 5, lineHeight: 1.7 }}>
                            {aggregationDescriptions[newMeter.aggregationMethod]}
                        </Typography>

                        {/* Formula Display */}
                        <Box sx={{
                            textAlign: 'center',
                            py: 4,
                            px: 3,
                            ...glassStyle,
                            borderRadius: 3,
                            mb: 4,
                        }}>
                            <Typography sx={{
                                fontSize: 18,
                                fontWeight: 400,
                                color: '#a78bfa',
                                mb: 1,
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                {preview.formula}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', mb: 3 }}>current values</Typography>

                            <Typography sx={{
                                fontSize: 52,
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                {preview.result}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>end of cycle value</Typography>
                        </Box>

                        <Divider sx={{ my: 4, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)' }} />

                        {/* Example Events */}
                        <Typography sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            mb: 3,
                            color: colors.textPrimary,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                        }}>
                            Example Events
                        </Typography>
                        {exampleUsage.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(139, 92, 246, 0.05)',
                                        borderColor: 'rgba(139, 92, 246, 0.2)',
                                    }
                                }}
                            >
                                <Box sx={{
                                    width: 4,
                                    height: 32,
                                    ...gradientBg,
                                    borderRadius: 1,
                                    mr: 2
                                }} />
                                <Typography sx={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    minWidth: 40,
                                    color: '#f8fafc',
                                }}>
                                    {item.value}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: '#475569', flex: 1, textAlign: 'right', mr: 1 }}>{item.date}</Typography>
                                <IconButton size="small" onClick={() => onRemoveExampleUsage(index)} sx={{ color: '#374151', '&:hover': { color: '#ef4444' } }}>
                                    <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </ThemeProvider>
        </Drawer>
    )
}

export default MeterFormDrawer
