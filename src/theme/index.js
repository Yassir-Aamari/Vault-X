// Dynamic theme based on settings
import { useSettings } from '../context/SettingsContext';

export const lightColors = {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#000000',
    primaryText: '#FFFFFF',
    danger: '#DC2626',
    success: '#16A34A',
    blue: '#2563EB',
    card: '#F9FAFB',
};

export const darkColors = {
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#71767B',
    border: '#333333',
    primary: '#FFFFFF',
    primaryText: '#000000',
    danger: '#F4212E',
    success: '#00BA7C',
    blue: '#1D9BF0',
    card: '#111111',
};

// Default export for backwards compatibility
export const colors = darkColors;

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const borderRadius = {
    s: 4,
    m: 8,
    l: 16,
    pill: 9999,
};

export const getTypography = (isDark = true) => ({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDark ? darkColors.text : lightColors.text,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: isDark ? darkColors.textSecondary : lightColors.textSecondary,
    },
    body: {
        fontSize: 16,
        color: isDark ? darkColors.text : lightColors.text,
    },
    caption: {
        fontSize: 14,
        color: isDark ? darkColors.textSecondary : lightColors.textSecondary,
    },
});

export const typography = getTypography(true);
