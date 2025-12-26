// Composant de popup/modal personnalisé avec des animations fluides
// Ce composant affiche une fenêtre modale avec un effet d'apparition sympa

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Animated, TouchableWithoutFeedback, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useThemeColors } from './ThemedComponents';
import { spacing, borderRadius } from '../theme';

// On récupère la hauteur de l'écran pour calculer la taille max du popup
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ThemedModal = ({
    visible,      // Est-ce que le popup est visible ?
    onClose,      // Fonction à appeler quand on ferme le popup
    children,     // Le contenu à afficher dans le popup
    title,        // Le titre du popup (optionnel)
    size = 'medium' // La taille : 'small', 'medium' ou 'large'
}) => {
    const colors = useThemeColors();

    // Les valeurs animées pour les effets
    const fadeAnim = useRef(new Animated.Value(0)).current;      // Pour le fondu
    const scaleAnim = useRef(new Animated.Value(0.9)).current;   // Pour l'effet de zoom
    const translateYAnim = useRef(new Animated.Value(20)).current; // Pour le glissement vertical

    useEffect(() => {
        if (visible) {
            // Animation d'apparition - on lance les 3 animations en même temps
            Animated.parallel([
                // Fondu vers visible
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                // Zoom de 90% à 100% avec un effet de rebond
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
                // Glissement vers le haut
                Animated.timing(translateYAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // On remet les valeurs à leur état initial pour la prochaine ouverture
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
            translateYAnim.setValue(20);
        }
    }, [visible]);

    // Fonction pour fermer le popup avec une animation de sortie
    const handleClose = () => {
        // Animation de disparition
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 20,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Quand l'animation est finie, on appelle la fonction de fermeture
            onClose?.();
        });
    };

    // Calcule la largeur max selon la taille choisie
    const getMaxWidth = () => {
        switch (size) {
            case 'small': return 320;
            case 'large': return 450;
            default: return 380;
        }
    };

    // Calcule la hauteur max selon la taille choisie
    const getMaxHeight = () => {
        switch (size) {
            case 'small': return SCREEN_HEIGHT * 0.5;
            case 'large': return SCREEN_HEIGHT * 0.85;
            default: return SCREEN_HEIGHT * 0.75;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none" // On gère nous-même les animations
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            {/* Pour que le clavier ne cache pas le contenu sur iOS */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                {/* Si on touche l'arrière-plan, on ferme le popup */}
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View
                        style={[
                            styles.overlay,
                            { opacity: fadeAnim }
                        ]}
                    >
                        {/* On empêche la fermeture quand on touche le contenu du popup */}
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.modalContainer,
                                    {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                        maxWidth: getMaxWidth(),
                                        maxHeight: getMaxHeight(),
                                        transform: [
                                            { scale: scaleAnim },
                                            { translateY: translateYAnim }
                                        ],
                                    }
                                ]}
                            >
                                {/* La petite barre en haut du popup (style iOS) */}
                                <View style={styles.handleContainer}>
                                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                                </View>

                                {/* Le contenu du popup avec scroll si nécessaire */}
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.scrollContent}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {children}
                                </ScrollView>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// Les styles du composant
const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    // L'arrière-plan sombre semi-transparent
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.m,
    },
    // Le conteneur principal du popup
    modalContainer: {
        width: '100%',
        borderRadius: borderRadius.l + 4,
        borderWidth: 1,
        overflow: 'hidden',
        // Ombre pour iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        // Ombre pour Android
        elevation: 20,
    },
    // Conteneur de la barre de poignée
    handleContainer: {
        alignItems: 'center',
        paddingTop: spacing.m,
        paddingBottom: spacing.s,
    },
    // La petite barre de poignée
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
    },
    // Le contenu scrollable
    scrollContent: {
        padding: spacing.l,
        paddingTop: spacing.s,
    },
});

export default ThemedModal;
