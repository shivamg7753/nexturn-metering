import { Box, Typography, TextField, Button } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'

function ProductInfoSection({ formData, errors, onFieldChange, colors }) {
    return (
        <Box sx={{ mb: 3 }}>
            {/* Name Field */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5
                }}>
                    Name <Box component="span" sx={{ color: '#7c3aed' }}>(required)</Box>
                </Typography>
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mb: 1
                }}>
                    Name of the product or service, visible to customers.
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& fieldset': {
                                borderColor: errors.name ? '#ef4444' : colors.border,
                            },
                            '&:hover fieldset': {
                                borderColor: '#7c3aed',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#7c3aed',
                            },
                        },
                        '& .MuiInputBase-input': {
                            color: colors.text,
                            fontSize: 14,
                        },
                    }}
                />
            </Box>

            {/* Description Field */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5
                }}>
                    Description
                </Typography>
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mb: 1
                }}>
                    Appears at checkout, on the customer portal, and in quotes.
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: colors.inputBg,
                            borderRadius: 1.5,
                            '& fieldset': {
                                borderColor: colors.border,
                            },
                            '&:hover fieldset': {
                                borderColor: '#7c3aed',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#7c3aed',
                            },
                        },
                        '& .MuiInputBase-input': {
                            color: colors.text,
                            fontSize: 14,
                        },
                    }}
                />
            </Box>

            {/* Image Upload */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    mb: 0.5
                }}>
                    Image
                </Typography>
                <Typography sx={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    mb: 1
                }}>
                    Appears at checkout. JPEG, PNG or WEBP under 2MB.
                </Typography>
                <Button
                    variant="text"
                    startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                        color: colors.textSecondary,
                        textTransform: 'none',
                        fontSize: 13,
                        fontWeight: 500,
                        px: 0,
                        '&:hover': {
                            bgcolor: 'transparent',
                            color: '#7c3aed',
                        },
                    }}
                >
                    Upload
                </Button>
            </Box>
        </Box>
    )
}

export default ProductInfoSection
