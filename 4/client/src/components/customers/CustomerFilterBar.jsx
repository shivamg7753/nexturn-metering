import { Box, TextField, InputAdornment, Chip, IconButton, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'

function CustomerFilterBar({ colors, isDark }) {
    const filterChips = [
        { label: 'Email', icon: <AddIcon sx={{ fontSize: 16 }} /> },
        { label: 'Name', icon: <AddIcon sx={{ fontSize: 16 }} /> },
        { label: 'Created date', icon: <AddIcon sx={{ fontSize: 16 }} /> },
        { label: 'Type', icon: <AddIcon sx={{ fontSize: 16 }} /> },
        { label: 'More filters', icon: null },
    ]

    const actionButtons = [
        { icon: <ContentCopyIcon sx={{ fontSize: 18 }} />, label: 'Copy' },
        { icon: <FileDownloadIcon sx={{ fontSize: 18 }} />, label: 'Export' },
        { icon: <BarChartIcon sx={{ fontSize: 18 }} />, label: 'Analyze' },
        { icon: <SettingsIcon sx={{ fontSize: 18 }} />, label: 'Edit columns' },
    ]

    return (
        <Box sx={{ mb: 3 }}>
            {/* Search and Filters Row */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                }}
            >
                {/* Search Input */}
                <TextField
                    placeholder="Search"
                    size="small"
                    sx={{
                        width: 500,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: colors.cardBg,
                            borderRadius: 2,
                            fontSize: '0.875rem',
                            '& fieldset': {
                                borderColor: colors.border,
                            },
                            '&:hover fieldset': {
                                borderColor: colors.borderSecondary,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: colors.accent,
                            },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        pr: 1,
                                        borderRight: `1px solid ${colors.border}`,
                                        mr: 1,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: colors.textSecondary,
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        All
                                    </Typography>
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            fontSize: 18,
                                            color: colors.textTertiary,
                                        }}
                                    />
                                </Box>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Filter Chips and Actions Row */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Filter Chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {filterChips.map((chip, index) => (
                        <Chip
                            key={index}
                            label={chip.label}
                            icon={chip.icon}
                            variant="outlined"
                            sx={{
                                bgcolor: 'transparent',
                                borderColor: colors.border,
                                color: colors.textSecondary,
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                height: 28,
                                '& .MuiChip-icon': {
                                    color: colors.textTertiary,
                                    marginLeft: '8px',
                                },
                                '&:hover': {
                                    bgcolor: colors.hover,
                                    borderColor: colors.borderSecondary,
                                },
                                cursor: 'pointer',
                            }}
                        />
                    ))}
                </Box>

                {/* Action Buttons and Remaining Balances */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {actionButtons.map((button, index) => (
                        <IconButton
                            key={index}
                            size="small"
                            sx={{
                                color: colors.textSecondary,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 1.5,
                                padding: '4px 8px',
                                fontSize: '0.8125rem',
                                '&:hover': {
                                    bgcolor: colors.hover,
                                    borderColor: colors.borderSecondary,
                                },
                            }}
                        >
                            {button.icon}
                            <Typography
                                sx={{
                                    ml: 0.5,
                                    fontSize: '0.8125rem',
                                    fontWeight: 500,
                                    color: colors.textSecondary,
                                }}
                            >
                                {button.label}
                            </Typography>
                        </IconButton>
                    ))}

                    {/* Remaining Balances */}
                    <Typography
                        sx={{
                            ml: 2,
                            color: colors.textSecondary,
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                        }}
                    >
                        Remaining balances
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default CustomerFilterBar
