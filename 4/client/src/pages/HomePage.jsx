import { Box, Typography } from '@mui/material'

function HomePage({ themeMode }) {
    const isDark = themeMode === 'dark'

    return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{
                fontSize: 28,
                fontWeight: 800,
                mb: 2,
                color: isDark ? '#f8fafc' : '#1e293b'
            }}>
                Welcome to RateCard Pro
            </Typography>
            <Typography sx={{ color: isDark ? '#64748b' : '#64748b', fontSize: 16 }}>
                Select an option from the sidebar to get started
            </Typography>
        </Box>
    )
}

export default HomePage
