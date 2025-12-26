// Écran de démarrage animé de VaultX
// Cet écran s'affiche au lancement de l'app avec une animation sympa du logo

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ onAnimationComplete }) {
    // On crée les valeurs animées pour contrôler les différentes animations
    // L'échelle du cadenas (pour l'effet de "pop")
    const lockScale = useRef(new Animated.Value(0)).current;
    // L'opacité du cadenas
    const lockOpacity = useRef(new Animated.Value(0)).current;
    // L'opacité du texte VaultX
    const textOpacity = useRef(new Animated.Value(0)).current;
    // La position verticale du texte (pour l'effet de glissement vers le haut)
    const textTranslateY = useRef(new Animated.Value(20)).current;
    // L'opacité du conteneur entier (pour le fondu de sortie)
    const containerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // La séquence d'animation complète
        const runAnimation = () => {
            // Étape 1: Le cadenas apparaît avec un effet de rebond (pop)
            Animated.parallel([
                Animated.spring(lockScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(lockOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Étape 2: Le texte "VaultX" apparaît et glisse vers le haut
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(textOpacity, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(textTranslateY, {
                            toValue: 0,
                            duration: 400,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        // Étape 3: On attend un peu puis on fait disparaître le tout
                        setTimeout(() => {
                            Animated.timing(containerOpacity, {
                                toValue: 0,
                                duration: 500,
                                useNativeDriver: true,
                            }).start(() => {
                                // Quand l'animation est finie, on prévient le parent
                                onAnimationComplete?.();
                            });
                        }, 600);
                    });
                }, 200);
            });
        };

        // On démarre l'animation après un petit délai
        setTimeout(runAnimation, 200);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
            {/* L'icône du cadenas qui apparaît en premier */}
            <Animated.View
                style={[
                    styles.lockContainer,
                    {
                        opacity: lockOpacity,
                        transform: [{ scale: lockScale }],
                    },
                ]}
            >
                <Ionicons name="lock-closed" size={80} color="#FFFFFF" />
            </Animated.View>

            {/* Le texte "VaultX" qui apparaît ensuite */}
            <Animated.Text
                style={[
                    styles.title,
                    {
                        opacity: textOpacity,
                        transform: [{ translateY: textTranslateY }],
                    },
                ]}
            >
                VaultX
            </Animated.Text>
        </Animated.View>
    );
}

// Les styles pour l'écran de démarrage
const styles = StyleSheet.create({
    // Le conteneur principal - fond noir qui couvre tout l'écran
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
    },
    // Conteneur du cadenas avec un peu d'espace en dessous
    lockContainer: {
        marginBottom: 20,
    },
    // Style du texte VaultX - gros, gras et espacé
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 4,
    },
});
