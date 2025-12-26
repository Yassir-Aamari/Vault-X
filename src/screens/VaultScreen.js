// Écran principal du coffre-fort
// C'est ici qu'on affiche tous les éléments stockés dans le coffre

import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedView, ThemedText, ThemedInput, ThemedButton, FAB, useThemeColors } from '../components/ThemedComponents';
import { ThemedModal } from '../components/ThemedModal';
import { useVault } from '../context/VaultContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function VaultScreen({ navigation }) {
    // On récupère les éléments du coffre
    const { items } = useVault();
    // On récupère les paramètres (verrouillage, catégories, etc.)
    const { isVaultLocked, toggleVaultLock, categories } = useSettings();
    const { masterKey } = useAuth();
    const colors = useThemeColors();

    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockCode, setUnlockCode] = useState('');

    // Cette fonction trouve l'icône correspondant à une catégorie
    const getCategoryIcon = (categoryId) => {
        const category = categories.find(c => c.id === categoryId || c.name === categoryId);
        return category?.icon || 'lock-closed';
    };

    // Comment on affiche chaque élément de la liste
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => !isVaultLocked && navigation.navigate('Detail', { itemId: item.id })}
            disabled={isVaultLocked}
        >
            {/* Icône de la catégorie dans un cercle */}
            <View style={[styles.iconContainer, { backgroundColor: colors.border }]}>
                <Ionicons name={getCategoryIcon(item.category)} size={24} color={colors.text} />
            </View>

            {/* Le titre et les infos de l'élément */}
            <View style={styles.itemContent}>
                <ThemedText style={styles.itemTitle}>
                    {/* Si le coffre est verrouillé, on masque le titre */}
                    {isVaultLocked ? '••••••••' : item.title}
                </ThemedText>
                <ThemedText style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                    {isVaultLocked ? '••••••' : `${item.category} • ${item.sub_group || 'Aucun groupe'}`}
                </ThemedText>
            </View>

            {/* Icône à droite - cadenas si verrouillé, flèche sinon */}
            {isVaultLocked ? (
                <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            )}
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Barre en haut pour verrouiller/déverrouiller le coffre */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    {/* Icône qui change selon l'état du coffre */}
                    <Ionicons
                        name={isVaultLocked ? "lock-closed" : "lock-open"}
                        size={20}
                        color={isVaultLocked ? colors.danger : colors.success}
                    />
                    <ThemedText style={styles.headerText}>
                        {isVaultLocked ? 'Coffre Verrouillé' : 'Coffre Déverrouillé'}
                    </ThemedText>
                </View>

                {/* Bouton pour changer l'état du verrouillage */}
                <TouchableOpacity
                    style={[
                        styles.encryptionButton,
                        {
                            backgroundColor: isVaultLocked ? colors.danger : colors.success,
                        }
                    ]}
                    onPress={() => {
                        if (isVaultLocked) {
                            // Si verrouillé, on demande le code de déverrouillage
                            setUnlockCode('');
                            setShowUnlockModal(true);
                        } else {
                            // Si déjà déverrouillé, on verrouille directement
                            toggleVaultLock();
                        }
                    }}
                >
                    <ThemedText style={styles.encryptionButtonText}>
                        {isVaultLocked ? 'Déverrouiller' : 'Verrouiller'}
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {/* La liste des éléments du coffre */}
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    // Ce qu'on affiche quand le coffre est vide
                    <View style={styles.emptyState}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="lock-closed" size={64} color={colors.text} />
                            <ThemedText style={styles.logoText}>VaultX</ThemedText>
                        </View>
                        <ThemedText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            Appuyez sur + pour ajouter votre premier élément
                        </ThemedText>
                    </View>
                }
            />

            {/* Le bouton flottant pour ajouter un nouvel élément (visible seulement si déverrouillé) */}
            {!isVaultLocked && (
                <FAB
                    icon={<Ionicons name="add" size={24} color="#FFFFFF" />}
                    onPress={() => navigation.navigate('Detail', { itemId: null })}
                />
            )}

            {/* Popup pour entrer le code de déverrouillage */}
            <ThemedModal
                visible={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                size="small"
            >
                <ThemedText type="header" style={{ marginBottom: spacing.m }}>
                    Entrer le code de déverrouillage
                </ThemedText>
                <ThemedText style={{ marginBottom: spacing.s, color: colors.textSecondary }}>
                    Saisissez votre mot de passe maître généré pour déverrouiller le coffre.
                </ThemedText>
                <ThemedInput
                    label="Code"
                    value={unlockCode}
                    onChangeText={setUnlockCode}
                    secureTextEntry
                />
                <View style={{ flexDirection: 'row', marginTop: spacing.m, gap: spacing.m }}>
                    <ThemedButton
                        title="Annuler"
                        variant="secondary"
                        onPress={() => setShowUnlockModal(false)}
                        style={{ flex: 1 }}
                    />
                    <ThemedButton
                        title="Déverrouiller"
                        onPress={() => {
                            if (!masterKey) {
                                Alert.alert('Erreur', 'Session invalide, veuillez vous reconnecter.');
                                setShowUnlockModal(false);
                                return;
                            }
                            if (unlockCode === masterKey) {
                                toggleVaultLock();
                                setShowUnlockModal(false);
                                setUnlockCode('');
                            } else {
                                Alert.alert('Erreur', 'Code incorrect.');
                            }
                        }}
                        style={{ flex: 1 }}
                    />
                </View>
            </ThemedModal>
        </ThemedView>
    );
}

// Les styles de l'écran
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // En-tête avec le statut de verrouillage
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.m,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Bouton de verrouillage/déverrouillage
    encryptionButton: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.pill,
    },
    encryptionButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Contenu de la liste
    listContent: {
        padding: spacing.m,
        flexGrow: 1,
    },
    // Carte pour chaque élément
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: borderRadius.l,
        marginBottom: spacing.s,
        borderWidth: 1,
    },
    // Conteneur de l'icône de catégorie
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.m,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    // État vide quand il n'y a pas d'éléments
    emptyState: {
        flex: 1,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    logoText: {
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 4,
        marginTop: spacing.s,
    },
    emptyText: {
        marginTop: spacing.m,
        fontSize: 16,
    },
    emptySubtext: {
        marginTop: spacing.s,
        fontSize: 14,
    },
});
