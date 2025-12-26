import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { spacing, borderRadius, darkColors, lightColors, getTypography } from '../theme';
import { useSettings } from '../context/SettingsContext';

// Hook to get current theme colors
export const useThemeColors = () => {
    try {
        const { isDarkMode } = useSettings();
        return isDarkMode ? darkColors : lightColors;
    } catch {
        return darkColors; // fallback if context not available
    }
};

export const ThemedView = ({ style, children, ...props }) => {
    const colors = useThemeColors();
    return (
        <View style={[{ backgroundColor: colors.background, flex: 1 }, style]} {...props}>
            {children}
        </View>
    );
};

export const ThemedText = ({ style, type = 'body', children, ...props }) => {
    const colors = useThemeColors();
    const typography = getTypography(colors === darkColors);
    const textStyle = typography[type] || typography.body;
    return (
        <Text style={[textStyle, style]} {...props}>
            {children}
        </Text>
    );
};

export const ThemedButton = ({ title, onPress, style, textStyle, loading, variant = 'primary', icon, disabled }) => {
    const colors = useThemeColors();
    const isPrimary = variant === 'primary';
    const bg = disabled ? colors.border : (isPrimary ? colors.primary : 'transparent');
    const fg = isPrimary ? colors.primaryText : colors.text;
    const border = isPrimary ? 'transparent' : colors.border;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading || disabled}
            style={[
                styles.button,
                { backgroundColor: bg, borderColor: border, borderWidth: isPrimary ? 0 : 1 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={fg} />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.buttonText, { color: fg }, textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

export const ThemedInput = ({ style, label, error, ...props }) => {
    const colors = useThemeColors();
    return (
        <View style={styles.inputContainer}>
            {label && <ThemedText style={[styles.label, { color: colors.textSecondary }]}>{label}</ThemedText>}
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }, style]}
                placeholderTextColor={colors.textSecondary}
                selectionColor={colors.blue}
                {...props}
            />
            {error && <ThemedText style={[styles.error, { color: colors.danger }]}>{error}</ThemedText>}
        </View>
    );
};

export const ThemedSwitch = ({ label, value, onValueChange, style }) => {
    const colors = useThemeColors();
    return (
        <View style={[styles.switchContainer, style]}>
            <ThemedText>{label}</ThemedText>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.blue }}
                thumbColor={value ? colors.primary : colors.textSecondary}
            />
        </View>
    );
};

export const ThemedCard = ({ style, children, onPress }) => {
    const colors = useThemeColors();
    const content = (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
            {children}
        </View>
    );

    if (onPress) {
        return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
    }
    return content;
};

export const FAB = ({ onPress, icon }) => {
    const colors = useThemeColors();
    return (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.blue }]} onPress={onPress}>
            {icon}
        </TouchableOpacity>
    );
};

export const ThemedPicker = ({ label, options, selectedValue, onValueChange, style }) => {
    const colors = useThemeColors();
    return (
        <View style={[styles.inputContainer, style]}>
            {label && <ThemedText style={[styles.label, { color: colors.textSecondary }]}>{label}</ThemedText>}
            <View style={styles.pickerContainer}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.id || option.value}
                        style={[
                            styles.pickerOption,
                            {
                                borderColor: colors.border,
                                backgroundColor: selectedValue === (option.id || option.value) ? colors.blue : 'transparent',
                            }
                        ]}
                        onPress={() => onValueChange(option.id || option.value)}
                    >
                        <Text style={{
                            color: selectedValue === (option.id || option.value) ? '#FFFFFF' : colors.text,
                            fontSize: 14,
                        }}>
                            {option.name || option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: spacing.s,
    },
    inputContainer: {
        marginBottom: spacing.m,
    },
    label: {
        marginBottom: spacing.s,
        fontSize: 14,
    },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderRadius: borderRadius.m,
        padding: spacing.m,
        fontSize: 16,
    },
    error: {
        fontSize: 12,
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.m,
    },
    card: {
        padding: spacing.m,
        borderRadius: borderRadius.l,
        borderWidth: 1,
        marginBottom: spacing.s,
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.s,
    },
    pickerOption: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.pill,
        borderWidth: 1,
    },
});
