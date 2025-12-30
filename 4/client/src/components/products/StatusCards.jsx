import { Box, Typography } from '@mui/material'

function StatusCards({ counts, statusFilter, onStatusChange, colors, isDark }) {
    const cards = [
        { key: 'all', label: 'All', count: counts.all },
        { key: 'active', label: 'Active', count: counts.active },
        { key: 'archived', label: 'Archived', count: counts.archived },
    ]

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {cards.map((card) => (
                <Box
                    key={card.key}
                    onClick={() => onStatusChange(card.key)}
                    sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: statusFilter === card.key ? (isDark ? colors.activeBg : '#f0ebff') : colors.cardBg,
                        border: statusFilter === card.key ? '2px solid #7c3aed' : `1px solid ${colors.border}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: '#7c3aed',
                        },
                    }}
                >
                    <Typography sx={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        mb: 0.5,
                    }}>
                        {card.label}
                    </Typography>
                    <Typography sx={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: statusFilter === card.key ? '#7c3aed' : colors.text,
                    }}>
                        {card.count}
                    </Typography>
                </Box>
            ))}
        </Box>
    )
}

export default StatusCards
