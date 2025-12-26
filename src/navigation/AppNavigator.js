// Ce fichier gère toute la navigation de l'application
// Il contient le menu latéral (drawer) et les différentes pages accessibles

import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { darkColors, lightColors } from '../theme';

// On importe tous les écrans de l'application
import LoginScreen from '../screens/LoginScreen';
import VaultScreen from '../screens/VaultScreen';
import DetailScreen from '../screens/DetailScreen';
import ImportExportScreen from '../screens/ImportExportScreen';
import QRShareScreen from '../screens/QRShareScreen';
import QRScanScreen from '../screens/QRScanScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountScreen from '../screens/AccountScreen';
import { ThemedText, ThemedView, useThemeColors } from '../components/ThemedComponents';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// On crée les navigateurs - Drawer pour le menu latéral, Stack pour les pages empilées
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Ce composant personnalise le contenu du menu latéral
function CustomDrawerContent(props) {
    const { logout, user } = useAuth();
    const colors = useThemeColors();

    return (
        <ThemedView style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20 }}>
            {/* En-tête du profil utilisateur avec son avatar et son nom */}
            <View style={{
                marginBottom: 30,
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
            }}>
                {/* L'avatar circulaire avec une icône de personne */}
                <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 15
                }}>
                    <Ionicons name="person" size={24} color={colors.primaryText} />
                </View>
                {/* Le nom d'utilisateur et son rôle */}
                <View>
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>{user?.username}</ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, fontSize: 14 }}>VaultX User</ThemedText>
                </View>
            </View>

            {/* La liste des éléments du menu (générée automatiquement) */}
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* Le bouton de déconnexion en bas du menu */}
            <View style={{ marginBottom: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border }}>
                <TouchableOpacity
                    onPress={logout}
                    style={{
                        backgroundColor: colors.danger,
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        borderRadius: 9999,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Se Déconnecter</Text>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

// Ce composant configure le menu latéral avec toutes les pages accessibles
function AppDrawer() {
    const { isDarkMode } = useSettings();
    const colors = isDarkMode ? darkColors : lightColors;

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                // Style de l'en-tête de chaque page
                headerStyle: {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                // Couleur du bouton hamburger selon le thème
                headerTintColor: isDarkMode ? '#FFFFFF' : '#000000',
                // Style du menu latéral lui-même
                drawerStyle: { backgroundColor: colors.background, width: 280 },
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: colors.textSecondary,
                drawerActiveBackgroundColor: colors.border,
                sceneContainerStyle: { backgroundColor: colors.background },
            }}
        >
            {/* Page principale - Mon Coffre */}
            <Drawer.Screen
                name="Vault"
                component={VaultScreen}
                options={{
                    title: 'Mon Coffre',
                    drawerIcon: ({ color }) => <Ionicons name="lock-closed" size={22} color={color} />
                }}
            />
            {/* Page de gestion des données (import/export) */}
            <Drawer.Screen
                name="ImportExport"
                component={ImportExportScreen}
                options={{
                    title: 'Gestion des Données',
                    drawerIcon: ({ color }) => <Ionicons name="save" size={22} color={color} />
                }}
            />
            {/* Page pour partager le coffre via QR code */}
            <Drawer.Screen
                name="QRShare"
                component={QRShareScreen}
                options={{
                    title: 'Partager (QR)',
                    drawerIcon: ({ color }) => <Ionicons name="qr-code" size={22} color={color} />
                }}
            />
            {/* Page pour scanner un QR code et importer */}
            <Drawer.Screen
                name="QRScan"
                component={QRScanScreen}
                options={{
                    title: 'Scanner (QR)',
                    drawerIcon: ({ color }) => <Ionicons name="scan" size={22} color={color} />
                }}
            />
            {/* Page des paramètres (thème, catégories, groupes) */}
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Paramètres',
                    drawerIcon: ({ color }) => <Ionicons name="settings" size={22} color={color} />
                }}
            />
            {/* Page du compte (changer nom/mot de passe) */}
            <Drawer.Screen
                name="Account"
                component={AccountScreen}
                options={{
                    title: 'Mon Compte',
                    drawerIcon: ({ color }) => <Ionicons name="person-circle" size={22} color={color} />
                }}
            />
        </Drawer.Navigator>
    );
}

// Le navigateur principal qui décide quelle page afficher
export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    // On essaie de récupérer le thème, sinon on utilise le thème sombre par défaut
    let isDarkMode = true;
    try {
        const settings = useSettings();
        isDarkMode = settings.isDarkMode;
    } catch {
        isDarkMode = true;
    }

    const colors = isDarkMode ? darkColors : lightColors;

    // Pendant le chargement, on affiche un écran de chargement
    if (isLoading) {
        return <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ThemedText>Chargement...</ThemedText></ThemedView>;
    }

    // On configure le thème de navigation selon le mode sombre ou clair
    const navigationTheme = isDarkMode ? {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            background: colors.background,
            card: colors.background,
            border: colors.border,
            text: colors.text,
        }
    } : {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: colors.background,
            card: colors.background,
            border: colors.border,
            text: colors.text,
        }
    };

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background }
            }}>
                {/* Si l'utilisateur n'est pas connecté, on affiche la page de connexion */}
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        {/* Sinon on affiche l'application avec le menu latéral */}
                        <Stack.Screen name="AppDrawer" component={AppDrawer} />
                        {/* La page de détail d'un élément (ajout/modification) */}
                        <Stack.Screen
                            name="Detail"
                            component={DetailScreen}
                            options={{
                                headerShown: true,
                                headerStyle: { backgroundColor: colors.background },
                                headerTintColor: colors.text,
                                title: '',
                                headerBackTitle: 'Retour'
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
