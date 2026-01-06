export const getCustomerColors = (isDark) => {
    if (isDark) {
        return {
            bg: '#0a0a0f',
            cardBg: 'rgba(26, 26, 36, 0.8)',
            border: 'rgba(255, 255, 255, 0.06)',
            borderSecondary: 'rgba(255, 255, 255, 0.1)',
            text: '#f8fafc',
            textSecondary: '#94a3b8',
            textTertiary: '#64748b',
            accent: '#8b5cf6',
            accentHover: '#a78bfa',
            buttonBg: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
            chipBg: 'rgba(139, 92, 246, 0.1)',
            chipBorder: 'rgba(139, 92, 246, 0.3)',
            hover: 'rgba(139, 92, 246, 0.1)',
            iconBg: 'rgba(139, 92, 246, 0.15)',
        }
    }
    return {
        bg: '#f8fafc',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(148, 163, 184, 0.12)',
        borderSecondary: 'rgba(148, 163, 184, 0.2)',
        text: '#0f172a',
        textSecondary: '#475569',
        textTertiary: '#64748b',
        accent: '#8b5cf6',
        accentHover: '#7c3aed',
        buttonBg: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
        chipBg: 'rgba(139, 92, 246, 0.08)',
        chipBorder: 'rgba(139, 92, 246, 0.25)',
        hover: 'rgba(139, 92, 246, 0.08)',
        iconBg: 'rgba(139, 92, 246, 0.1)',
    }
}
