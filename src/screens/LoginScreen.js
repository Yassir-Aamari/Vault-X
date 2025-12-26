// Écran de connexion / inscription
// C'est la première page qu'on voit quand on n'est pas connecté

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ThemedView, ThemedText, ThemedButton, ThemedInput } from '../components/ThemedComponents';
import { useAuth } from '../context/AuthContext';
import { spacing, colors } from '../theme';
import { generateMasterPassword } from '../utils/crypto';
import * as Clipboard from 'expo-clipboard';

export default function LoginScreen() {
    // On récupère les fonctions d'authentification
    const { login, register, isFirstLaunch } = useAuth();

    // Les états pour les champs de saisie
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');

    // Cette fonction est appelée quand on appuie sur le bouton
    const handleAction = async () => {
        // On vérifie que tous les champs sont remplis
        if (!username) {
            Alert.alert('Erreur', 'Veuillez renseigner un nom d\'utilisateur');
            return;
        }
        if (!isFirstLaunch && !password) {
            Alert.alert('Erreur', 'Veuillez renseigner votre mot de passe maître');
            return;
        }

        setLoading(true);
        try {
            if (isFirstLaunch) {
                // Premier lancement : on crée un compte et on génère un mot de passe maître
                const newPassword = generateMasterPassword();
                const success = await register(username, newPassword);
                if (!success) {
                    Alert.alert('Erreur', 'L\'inscription a échoué');
                } else {
                    setGeneratedPassword(newPassword);
                    Alert.alert(
                        'Mot de passe maître généré',
                        `Conservez-le précieusement :\n\n${newPassword}\n\nIl sera demandé pour déchiffrer votre coffre.`,
                        [
                            {
                                text: 'Copier',
                                onPress: async () => {
                                    try {
                                        await Clipboard.setStringAsync(newPassword);
                                    } catch {
                                        // ignore copy errors in alert flow
                                    }
                                }
                            },
                            { text: 'OK' },
                        ]
                    );
                }
            } else {
                // Connexion classique
                const success = await login(username, password);
                if (!success) Alert.alert('Erreur', 'Identifiants incorrects');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                {/* Le titre de l'application */}
                <ThemedText type="header" style={styles.title}>
                    VaultX
                </ThemedText>

                {/* Le sous-titre qui change selon si c'est le premier lancement ou pas */}
                <ThemedText style={styles.subtitle}>
                    {isFirstLaunch ? 'Créez votre coffre local' : 'Déverrouillez votre coffre'}
                </ThemedText>

                {/* Le champ pour le nom d'utilisateur */}
                <ThemedInput
                    label="Nom d'utilisateur"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                {/* Le champ pour le mot de passe (masqué) - uniquement après le premier lancement */}
                {!isFirstLaunch && (
                    <ThemedInput
                        label="Mot de passe maître"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                )}

                {/* Le bouton qui change de texte selon le contexte */}
                <ThemedButton
                    title={isFirstLaunch ? 'Créer le Coffre' : 'Déverrouiller'}
                    onPress={handleAction}
                    loading={loading}
                    style={styles.button}
                />

                {isFirstLaunch && generatedPassword ? (
                    <View style={styles.generatedContainer}>
                        <ThemedText style={[styles.generatedInfo, { color: colors.textSecondary }]}>
                            Votre mot de passe maître généré :
                        </ThemedText>
                        <ThemedText style={styles.generatedPassword}>
                            {generatedPassword}
                        </ThemedText>
                        <ThemedButton
                            title="Copier le mot de passe"
                            variant="secondary"
                            onPress={async () => {
                                try {
                                    await Clipboard.setStringAsync(generatedPassword);
                                    Alert.alert('Copié', 'Le mot de passe maître a été copié dans le presse‑papiers.');
                                } catch {
                                    Alert.alert('Erreur', 'Impossible de copier le mot de passe.');
                                }
                            }}
                            style={styles.copyButton}
                        />
                    </View>
                ) : null}
            </View>
        </ThemedView>
    );
}

// Les styles de l'écran
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        padding: spacing.l,
    },
    // Le contenu est centré et limité en largeur
    content: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    // Le titre VaultX en gros
    title: {
        fontSize: 40,
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    // Le sous-titre explicatif
    subtitle: {
        textAlign: 'center',
        marginBottom: spacing.xl,
        color: colors.textSecondary,
    },
    button: {
        marginTop: spacing.m,
    },
    generatedContainer: {
        marginTop: spacing.l,
        alignItems: 'center',
    },
    generatedInfo: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    generatedPassword: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    copyButton: {
        alignSelf: 'center',
    },
});
