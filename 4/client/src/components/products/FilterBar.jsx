import { useState } from 'react'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'

function FilterBar({ statusFilter, onStatusChange, onClearFilters, colors, isDark }) {
    const [statusAnchor, setStatusAnchor] = useState(null)
    const [taxCategoryAnchor, setTaxCategoryAnchor] = useState(null)

    const getStatusLabel = () => {
        switch (statusFilter) {
            case 'active': return 'Active'
            case 'archived': return 'Archived'
            default: return 'All'
        }
    }

    const filterButtonStyle = {
        textTransform: 'none',
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: 500,
        px: 1.5,
        py: 0.5,
        borderRadius: 1.5,
        '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        },
    }

    const menuPaperProps = {
        sx: {
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            {/* Left Filters */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Created Filter */}
                <Button
                    size="small"
                    startIcon={<FilterAltOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={filterButtonStyle}
                >
                    Created
                </Button>

                {/* Status Filter */}
                <Button
                    size="small"
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => setStatusAnchor(e.currentTarget)}
                    sx={{
                        ...filterButtonStyle,
                        color: colors.text,
                        fontWeight: 600,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        },
                    }}
                >
                    Status <Box component="span" sx={{ ml: 0.5, color: '#7c3aed' }}>{getStatusLabel()}</Box>
                </Button>
                <Menu
                    anchorEl={statusAnchor}
                    open={Boolean(statusAnchor)}
                    onClose={() => setStatusAnchor(null)}
                    PaperProps={menuPaperProps}
                >
                    <MenuItem onClick={() => { onStatusChange('all'); setStatusAnchor(null); }}>All</MenuItem>
                    <MenuItem onClick={() => { onStatusChange('active'); setStatusAnchor(null); }}>Active</MenuItem>
                    <MenuItem onClick={() => { onStatusChange('archived'); setStatusAnchor(null); }}>Archived</MenuItem>
                </Menu>

                {/* Tax Category Filter */}
                <Button
                    size="small"
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => setTaxCategoryAnchor(e.currentTarget)}
                    sx={filterButtonStyle}
                >
                    Tax category
                </Button>
                <Menu
                    anchorEl={taxCategoryAnchor}
                    open={Boolean(taxCategoryAnchor)}
                    onClose={() => setTaxCategoryAnchor(null)}
                    PaperProps={menuPaperProps}
                >
                    <MenuItem onClick={() => setTaxCategoryAnchor(null)}>All categories</MenuItem>
                    <MenuItem onClick={() => setTaxCategoryAnchor(null)}>General - Electronically Supplied Services</MenuItem>
                    <MenuItem onClick={() => setTaxCategoryAnchor(null)}>Preset: General</MenuItem>
                </Menu>

                {/* Clear Filters */}
                <Button
                    size="small"
                    onClick={onClearFilters}
                    sx={{
                        textTransform: 'none',
                        color: '#7c3aed',
                        fontSize: 13,
                        fontWeight: 500,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1.5,
                        '&:hover': {
                            bgcolor: 'rgba(124, 58, 237, 0.08)',
                        },
                    }}
                >
                    Clear filters
                </Button>
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={filterButtonStyle}
                >
                    Export prices
                </Button>
                <Button
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={filterButtonStyle}
                >
                    Export products
                </Button>
                <Button
                    size="small"
                    startIcon={<ViewColumnOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={filterButtonStyle}
                >
                    Edit columns
                </Button>
            </Box>
        </Box>
    )
}

export default FilterBar
