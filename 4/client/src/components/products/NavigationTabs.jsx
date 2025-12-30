import { Box, Tabs, Tab } from '@mui/material'

const TAB_LABELS = ['All products', 'Features', 'Coupons', 'Shipping rates', 'Tax rates', 'Pricing tables']

function NavigationTabs({ activeTab, onTabChange, colors }) {
    return (
        <Box sx={{ borderBottom: `1px solid ${colors.border}`, mb: 3 }}>
            <Tabs
                value={activeTab}
                onChange={(e, v) => onTabChange(v)}
                sx={{
                    minHeight: 'auto',
                    '& .MuiTabs-indicator': {
                        bgcolor: '#7c3aed',
                        height: 2,
                    },
                }}
            >
                {TAB_LABELS.map((label, index) => (
                    <Tab
                        key={label}
                        label={label}
                        sx={{
                            textTransform: 'none',
                            fontWeight: activeTab === index ? 600 : 400,
                            fontSize: 14,
                            color: activeTab === index ? colors.text : colors.textSecondary,
                            minHeight: 'auto',
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                                color: colors.text,
                            },
                        }}
                    />
                ))}
            </Tabs>
        </Box>
    )
}

export default NavigationTabs
