// Écran de gestion du compte utilisateur
// Permet de changer le nom d'utilisateur et le mot de passe

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { ThemedView, ThemedText, ThemedButton, ThemedInput, ThemedCard, useThemeColors } from '../components/ThemedComponents';
import { ThemedModal } from '../components/ThemedModal';
import { useAuth } from '../context/AuthContext';
import { spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
    const colors = useThemeColors();
    const { user, updateUsername, updatePassword, resetAll } = useAuth();

    // États pour le popup de changement de nom d'utilisateur
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    // États pour le popup de changement de mot de passe
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Ouvre le popup pour changer le nom d'utilisateur
    const handleOpenUsernameModal = () => {
        setNewUsername(user?.username || '');
        setShowUsernameModal(true);
    };

    // Sauvegarde le nouveau nom d'utilisateur
    const handleSaveUsername = async () => {
        const result = await updateUsername(newUsername);
        if (result.success) {
            Alert.alert('Succès', 'Nom d\'utilisateur mis à jour avec succès');
            setShowUsernameModal(false);
        } else {
            Alert.alert('Erreur', result.error);
        }
    };

    // Ouvre le popup pour changer le mot de passe
    const handleOpenPasswordModal = () => {
        // On remet tous les champs à zéro
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowPasswordModal(true);
    };

    // Sauvegarde le nouveau mot de passe
    const handleSavePassword = async () => {
        // On vérifie que les deux mots de passe correspondent
        if (newPassword !== confirmPassword) {
            Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        const result = await updatePassword(currentPassword, newPassword);
        if (result.success) {
            Alert.alert('Succès', 'Mot de passe mis à jour avec succès');
            setShowPasswordModal(false);
        } else {
            Alert.alert('Erreur', result.error);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Section du profil avec l'avatar et le nom */}
                <View style={styles.profileSection}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Ionicons name="person" size={48} color={colors.primaryText} />
                    </View>
                    <ThemedText style={styles.username}>{user?.username}</ThemedText>
                    <ThemedText style={[styles.userRole, { color: colors.textSecondary }]}>
                        Utilisateur VaultX
                    </ThemedText>
                </View>

                {/* Options du compte */}
                <ThemedText type="subHeader" style={styles.sectionTitle}>Paramètres du Compte</ThemedText>

                {/* Carte pour changer le nom d'utilisateur */}
                <ThemedCard style={styles.optionCard} onPress={handleOpenUsernameModal}>
                    <View style={styles.optionContent}>
                        <View style={[styles.optionIcon, { backgroundColor: colors.blue }]}>
                            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.optionInfo}>
                            <ThemedText style={styles.optionTitle}>Changer le Nom d'Utilisateur</ThemedText>
                            <ThemedText style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                                Actuel : {user?.username}
                            </ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </View>
                </ThemedCard>

                {/* Carte pour changer le mot de passe */}
                <ThemedCard style={styles.optionCard} onPress={handleOpenPasswordModal}>
                    <View style={styles.optionContent}>
                        <View style={[styles.optionIcon, { backgroundColor: colors.success }]}>
                            <Ionicons name="key-outline" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.optionInfo}>
                            <ThemedText style={styles.optionTitle}>Changer le Mot de Passe</ThemedText>
                            <ThemedText style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                                Modifier votre mot de passe maître
                            </ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </View>
                </ThemedCard>

                {/* Carte d'information sur la sécurité */}
                <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="shield-checkmark" size={24} color={colors.success} />
                    <View style={styles.infoContent}>
                        <ThemedText style={styles.infoTitle}>Vos données sont sécurisées</ThemedText>
                        <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                            Toutes les données du coffre sont chiffrées localement avec AES-256 en utilisant votre mot de passe maître.
                        </ThemedText>
                    </View>
                </View>

                {/* Bouton pour réinitialiser complètement l'application */}
                <View style={styles.resetContainer}>
                    <ThemedButton
                        title="Restart (Tout Réinitialiser)"
                        onPress={() => {
                            Alert.alert(
                                'Redémarrer VaultX',
                                'Cela va supprimer TOUTES vos données, votre compte et les paramètres. Êtes-vous sûr ?',
                                [
                                    { text: 'Annuler', style: 'cancel' },
                                    {
                                        text: 'Oui, tout effacer',
                                        style: 'destructive',
                                        onPress: () => resetAll(),
                                    },
                                ]
                            );
                        }}
                        style={styles.resetButton}
                        textStyle={{ color: colors.danger }}
                        variant="secondary"
                    />
                </View>
            </ScrollView>

            {/* Popup pour changer le nom d'utilisateur */}
            <ThemedModal visible={showUsernameModal} onClose={() => setShowUsernameModal(false)} size="small">
                <ThemedText type="header" style={styles.modalTitle}>Changer le Nom d'Utilisateur</ThemedText>

                <ThemedInput
                    label="Nouveau Nom d'Utilisateur"
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder="Entrez le nouveau nom"
                    autoCapitalize="none"
                />

                <View style={styles.modalActions}>
                    <ThemedButton
                        title="Annuler"
                        variant="secondary"
                        onPress={() => setShowUsernameModal(false)}
                        style={styles.modalButton}
                    />
                    <ThemedButton
                        title="Sauvegarder"
                        onPress={handleSaveUsername}
                        style={styles.modalButton}
                    />
                </View>
            </ThemedModal>

            {/* Popup pour changer le mot de passe */}
            <ThemedModal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)} size="medium">
                <ThemedText type="header" style={styles.modalTitle}>Changer le Mot de Passe</ThemedText>

                <View style={styles.passwordField}>
                    <ThemedInput
                        label="Mot de Passe Actuel"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showCurrentPassword}
                        placeholder="Entrez le mot de passe actuel"
                    />
                </View>

                <View style={styles.passwordField}>
                    <ThemedInput
                        label="Nouveau Mot de Passe"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        placeholder="Entrez le nouveau mot de passe"
                    />
                </View>

                <View style={styles.passwordField}>
                    <ThemedInput
                        label="Confirmer le Nouveau Mot de Passe"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showNewPassword}
                        placeholder="Confirmez le nouveau mot de passe"
                    />
                </View>

                <View style={styles.modalActions}>
                    <ThemedButton
                        title="Annuler"
                        variant="secondary"
                        onPress={() => setShowPasswordModal(false)}
                        style={styles.modalButton}
                    />
                    <ThemedButton
                        title="Mettre à Jour"
                        onPress={handleSavePassword}
                        style={styles.modalButton}
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
    content: {
        padding: spacing.m,
    },
    // Section du profil en haut
    profileSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        marginBottom: spacing.l,
    },
    // L'avatar circulaire
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.m,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    userRole: {
        fontSize: 14,
        marginTop: spacing.xs,
    },
    sectionTitle: {
        marginBottom: spacing.m,
    },
    // Cartes d'option cliquables
    optionCard: {
        marginBottom: spacing.s,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.m,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    optionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    // Carte d'information sur la sécurité
    infoCard: {
        flexDirection: 'row',
        padding: spacing.m,
        borderRadius: borderRadius.l,
        borderWidth: 1,
        marginTop: spacing.xl,
        alignItems: 'flex-start',
        gap: spacing.m,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
    },
    resetContainer: {
        marginTop: spacing.xl,
    },
    resetButton: {
        borderRadius: borderRadius.l,
    },
    // Styles des popups
    modalTitle: {
        marginBottom: spacing.l,
        textAlign: 'center',
    },
    passwordField: {
        marginBottom: spacing.s,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.m,
        marginTop: spacing.m,
    },
    modalButton: {
        flex: 1,
    },
});
