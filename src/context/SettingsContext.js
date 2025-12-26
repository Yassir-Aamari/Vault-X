import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

// Available icons for groups
export const GROUP_ICONS = ['folder', 'home', 'briefcase', 'wallet', 'heart', 'star', 'bookmark', 'flag', 'globe', 'people'];

// Default categories with their fields
const DEFAULT_CATEGORIES = [
    {
        id: 'login',
        name: 'Login',
        icon: 'lock-closed',
        fields: [
            { id: 'username', name: 'Username', type: 'text' },
            { id: 'password', name: 'Password', type: 'password' },
            { id: 'url', name: 'Website URL', type: 'text' },
            { id: 'notes', name: 'Notes', type: 'multiline' },
        ]
    },
    {
        id: 'credit_card',
        name: 'Credit Card',
        icon: 'card',
        fields: [
            { id: 'cardNumber', name: 'Card Number', type: 'text', sensitive: true },
            { id: 'cardHolder', name: 'Card Holder', type: 'text' },
            { id: 'expiryDate', name: 'Expiry Date', type: 'text' },
            { id: 'cvv', name: 'CVV', type: 'password' },
            { id: 'notes', name: 'Notes', type: 'multiline' },
        ]
    },
    {
        id: 'email',
        name: 'Email',
        icon: 'mail',
        fields: [
            { id: 'email', name: 'Email Address', type: 'text' },
            { id: 'password', name: 'Password', type: 'password' },
            { id: 'recoveryEmail', name: 'Recovery Email', type: 'text' },
            { id: 'notes', name: 'Notes', type: 'multiline' },
        ]
    },
    {
        id: 'note',
        name: 'Secure Note',
        icon: 'document-text',
        fields: [
            { id: 'content', name: 'Note Content', type: 'multiline' },
        ]
    },
];

const DEFAULT_GROUPS = [
    { id: 'personal', name: 'Personal', icon: 'home' },
    { id: 'work', name: 'Work', icon: 'briefcase' },
    { id: 'finance', name: 'Finance', icon: 'wallet' },
];

export const SettingsProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [groups, setGroups] = useState(DEFAULT_GROUPS);
    const [isVaultLocked, setIsVaultLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem('vaultx_theme');
            const storedCategories = await AsyncStorage.getItem('vaultx_categories');
            const storedGroups = await AsyncStorage.getItem('vaultx_groups');
            const storedLockState = await AsyncStorage.getItem('vaultx_locked');

            if (storedTheme !== null) setIsDarkMode(storedTheme === 'dark');
            if (storedCategories) setCategories(JSON.parse(storedCategories));
            if (storedGroups) setGroups(JSON.parse(storedGroups));
            if (storedLockState !== null) setIsVaultLocked(storedLockState === 'true');
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (e) {
            console.error('Failed to save setting', e);
        }
    };

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        saveSettings('vaultx_theme', newTheme ? 'dark' : 'light');
    };

    const toggleVaultLock = () => {
        const newState = !isVaultLocked;
        setIsVaultLocked(newState);
        saveSettings('vaultx_locked', newState.toString());
    };

    // Category CRUD
    const addCategory = (category) => {
        const newCategory = { ...category, id: Date.now().toString() };
        const newCategories = [...categories, newCategory];
        setCategories(newCategories);
        saveSettings('vaultx_categories', newCategories);
        return newCategory;
    };

    const updateCategory = (id, updates) => {
        const newCategories = categories.map(c => c.id === id ? { ...c, ...updates } : c);
        setCategories(newCategories);
        saveSettings('vaultx_categories', newCategories);
    };

    const deleteCategory = (id) => {
        const newCategories = categories.filter(c => c.id !== id);
        setCategories(newCategories);
        saveSettings('vaultx_categories', newCategories);
    };

    // Group CRUD - now with icon support
    const addGroup = (name, icon = 'folder') => {
        const newGroup = { id: Date.now().toString(), name, icon };
        const newGroups = [...groups, newGroup];
        setGroups(newGroups);
        saveSettings('vaultx_groups', newGroups);
        return newGroup;
    };

    const updateGroup = (id, name, icon) => {
        const newGroups = groups.map(g => g.id === id ? { ...g, name, icon: icon || g.icon } : g);
        setGroups(newGroups);
        saveSettings('vaultx_groups', newGroups);
    };

    const deleteGroup = (id) => {
        const newGroups = groups.filter(g => g.id !== id);
        setGroups(newGroups);
        saveSettings('vaultx_groups', newGroups);
    };

    return (
        <SettingsContext.Provider
            value={{
                isDarkMode,
                toggleTheme,
                categories,
                addCategory,
                updateCategory,
                deleteCategory,
                groups,
                addGroup,
                updateGroup,
                deleteGroup,
                isVaultLocked,
                toggleVaultLock,
                isLoading,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
