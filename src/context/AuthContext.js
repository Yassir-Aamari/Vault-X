// Ce fichier gère tout ce qui concerne l'authentification de l'utilisateur
// Il permet de se connecter, s'inscrire, se déconnecter et changer ses identifiants

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword } from '../utils/crypto';

// On crée un contexte pour pouvoir accéder aux données d'auth depuis n'importe où dans l'app
const AuthContext = createContext();

// Hook personnalisé pour utiliser facilement le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Est-ce que l'utilisateur est connecté ou pas
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Les informations de l'utilisateur connecté (son nom d'utilisateur par exemple)
    const [user, setUser] = useState(null);

    // La clé maître gardée en mémoire pour chiffrer/déchiffrer les données du coffre
    // On ne la stocke jamais sur le disque pour des raisons de sécurité
    const [masterKey, setMasterKey] = useState(null);

    // Indique si on est en train de vérifier l'état de connexion au démarrage
    const [isLoading, setIsLoading] = useState(true);

    // Est-ce que c'est la première fois que l'utilisateur lance l'app
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);

    // Au lancement de l'app, on vérifie si un utilisateur existe déjà
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Cette fonction vérifie si un compte existe déjà dans le stockage local
    // Si aucun compte n'existe, on crée/force le compte par défaut ahmed/111
    const checkAuthStatus = async () => {
        try {
            const defaultUsername = 'ahmed';
            const defaultPassword = '111';
            const defaultHash = hashPassword(defaultPassword);

            let storedUser = await AsyncStorage.getItem('vaultx_user');
            let storedHash = await AsyncStorage.getItem('vaultx_hash');

            if (!storedUser || !storedHash) {
                await AsyncStorage.setItem('vaultx_user', defaultUsername);
                await AsyncStorage.setItem('vaultx_hash', defaultHash);
                storedUser = defaultUsername;
                storedHash = defaultHash;
            }

            setIsFirstLaunch(false);
        } catch (e) {
            console.error('Erreur lors de la vérification du statut', e);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour créer un nouveau compte (premier lancement)
    const register = async (username, password) => {
        try {
            // On hash le mot de passe avant de le stocker (jamais en clair!)
            const hash = hashPassword(password);
            await AsyncStorage.setItem('vaultx_user', username);
            await AsyncStorage.setItem('vaultx_hash', hash);

            setUser({ username });
            // On garde le mot de passe brut en mémoire car c'est lui qui sert de clé de chiffrement
            setMasterKey(password);
            setIsAuthenticated(true);
            setIsFirstLaunch(false);
            return true;
        } catch (e) {
            console.error('Échec de l\'inscription', e);
            return false;
        }
    };

    // Fonction pour se connecter avec un compte existant
    const login = async (username, password) => {
        try {
            const inputUser = (username || '').trim();
            const inputPass = password || '';

            const defaultUsername = 'ahmed';
            const defaultPassword = '111';
            const defaultHash = hashPassword(defaultPassword);

            // Toujours accepter le couple par défaut
            if (inputUser === defaultUsername && inputPass === defaultPassword) {
                await AsyncStorage.setItem('vaultx_user', defaultUsername);
                await AsyncStorage.setItem('vaultx_hash', defaultHash);
                setUser({ username: defaultUsername });
                setMasterKey(defaultPassword);
                setIsAuthenticated(true);
                return true;
            }

            const storedUser = await AsyncStorage.getItem('vaultx_user');
            const storedHash = await AsyncStorage.getItem('vaultx_hash');

            // Sinon on vérifie le stockage
            if (storedUser === inputUser && storedHash === hashPassword(inputPass)) {
                setUser({ username: inputUser });
                setMasterKey(inputPass);
                setIsAuthenticated(true);
                return true;
            }

            return false;
        } catch (e) {
            console.error('Échec de la connexion', e);
            return false;
        }
    };

    // Fonction pour se déconnecter - on efface tout de la mémoire
    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setMasterKey(null);
    };

    // Réinitialise complètement l'application (comme un premier lancement)
    const resetAll = async () => {
        try {
            await AsyncStorage.multiRemove([
                'vaultx_user',
                'vaultx_hash',
                'vaultx_data',
                'vaultx_theme',
                'vaultx_categories',
                'vaultx_groups',
                'vaultx_locked',
            ]);
        } catch (e) {
            console.error('Erreur lors de la réinitialisation', e);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            setMasterKey(null);
            setIsFirstLaunch(true);
        }
    };

    // Fonction pour changer le nom d'utilisateur
    const updateUsername = async (newUsername) => {
        try {
            // On vérifie que le nouveau nom n'est pas vide
            if (!newUsername || newUsername.trim() === '') {
                return { success: false, error: 'Le nom d\'utilisateur ne peut pas être vide' };
            }
            await AsyncStorage.setItem('vaultx_user', newUsername.trim());
            setUser({ username: newUsername.trim() });
            return { success: true };
        } catch (e) {
            console.error('Échec de la mise à jour du nom d\'utilisateur', e);
            return { success: false, error: 'Impossible de mettre à jour le nom' };
        }
    };

    // Fonction pour changer le mot de passe
    const updatePassword = async (currentPassword, newPassword) => {
        try {
            // Le nouveau mot de passe doit faire au moins 4 caractères
            if (!newPassword || newPassword.length < 4) {
                return { success: false, error: 'Le mot de passe doit faire au moins 4 caractères' };
            }

            // On vérifie d'abord que l'ancien mot de passe est correct
            const storedHash = await AsyncStorage.getItem('vaultx_hash');
            if (storedHash !== hashPassword(currentPassword)) {
                return { success: false, error: 'Le mot de passe actuel est incorrect' };
            }

            // Si tout est bon, on enregistre le nouveau mot de passe hashé
            const newHash = hashPassword(newPassword);
            await AsyncStorage.setItem('vaultx_hash', newHash);
            setMasterKey(newPassword);
            return { success: true };
        } catch (e) {
            console.error('Échec de la mise à jour du mot de passe', e);
            return { success: false, error: 'Impossible de mettre à jour le mot de passe' };
        }
    };

    // On rend toutes ces valeurs et fonctions disponibles pour le reste de l'app
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                masterKey,
                isLoading,
                isFirstLaunch,
                register,
                login,
                logout,
                resetAll,
                updateUsername,
                updatePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
