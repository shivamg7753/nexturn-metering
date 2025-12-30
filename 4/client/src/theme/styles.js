// Reusable style objects

// Dark mode glass style
export const glassStyle = {
    background: 'rgba(26, 26, 36, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
}

// Light mode glass style
export const glassStyleLight = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
}

// Light theme specific colors
export const lightThemeColors = {
    bg: '#f8fafc',
    paper: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.12)', // Use slate-400 with very low opacity for subtle borders
    borderSubtle: 'rgba(148, 163, 184, 0.08)', // Even lighter for very subtle dividers
    cardBg: 'rgba(255, 255, 255, 0.95)',
    headerGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    success: '#16a34a',
    tableBg: 'rgba(255, 255, 255, 0.98)',
    tableHeaderBg: 'rgba(139, 92, 246, 0.08)',
    inputBackground: 'rgba(0, 0, 0, 0.03)',
    activeBg: 'rgba(139, 92, 246, 0.1)',
}

// Dark theme specific colors
export const darkThemeColors = {
    bg: '#0a0a0f',
    paper: '#12121a',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    cardBg: 'rgba(26, 26, 36, 0.6)',
    headerGradient: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
    success: '#22c55e',
    tableBg: 'rgba(26, 26, 36, 0.6)',
    tableHeaderBg: 'rgba(139, 92, 246, 0.05)',
    inputBackground: 'rgba(255, 255, 255, 0.03)',
    activeBg: 'rgba(139, 92, 246, 0.2)',
}

export const gradientBg = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
}

export const drawerWidth = 260

// Dynamic styles based on theme mode
export const getGlassStyle = (mode) => mode === 'dark' ? glassStyle : glassStyleLight

// Get theme colors dynamically
export const getThemeColors = (mode) => mode === 'dark' ? darkThemeColors : lightThemeColors

// Legacy support for Product Catalogue components if they use a different structure
export const getProductCatalogueColors = (isDark) => {
    const colors = isDark ? darkThemeColors : lightThemeColors
    return {
        bg: colors.bg,
        cardBg: colors.cardBg,
        text: colors.textPrimary,
        textSecondary: colors.textSecondary,
        textMuted: colors.textMuted,
        border: colors.border,
        activeBg: colors.activeBg,
        activeText: '#8b5cf6',
        headerBg: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
        drawerBg: colors.paper,
        inputBg: colors.inputBackground,
        previewBg: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
    }
}
