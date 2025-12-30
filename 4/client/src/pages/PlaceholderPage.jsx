import { Box, Typography } from '@mui/material'

function PlaceholderPage({ title, description, themeMode }) {
    const isDark = themeMode === 'dark'

    return (
        <Box>
            <Typography sx={{
                fontSize: 28,
                fontWeight: 800,
                mb: 2,
                color: isDark ? '#f8fafc' : '#1e293b'
            }}>
                {title}
            </Typography>
            <Typography sx={{ color: isDark ? '#64748b' : '#64748b', fontSize: 14 }}>
                {description}
            </Typography>
        </Box>
    )
}

export default PlaceholderPage
