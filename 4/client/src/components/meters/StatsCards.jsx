import { Box, Typography } from '@mui/material'

function StatsCards({ meters, glassStyle, colors }) {
    const stats = [
        { label: 'Total Meters', value: meters.length, change: '+2 this week' },
        { label: 'Active', value: meters.filter(m => m.status === 'Active').length, change: 'All healthy' },
        { label: 'Inactive', value: meters.filter(m => m.status === 'Inactive').length, change: 'Paused meters' },
        { label: 'Revenue Impact', value: '$45.2K', change: '+23% this month' },
    ]

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 4 }}>
            {stats.map((stat, index) => (
                <Box key={index} sx={{
                    p: 3,
                    borderRadius: 3,
                    ...glassStyle,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                    }
                }}>
                    <Typography sx={{ fontSize: 12, color: colors.textMuted, fontWeight: 500, mb: 1 }}>
                        {stat.label}
                    </Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                        {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: colors.success, fontWeight: 500 }}>
                        {stat.change}
                    </Typography>
                </Box>
            ))}
        </Box>
    )
}

export default StatsCards
