// Point d'entrée principal de l'application VaultX
// Ce fichier configure tous les providers et gère l'écran de démarrage animé

import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { VaultProvider } from './src/context/VaultContext';
import { SettingsProvider } from './src/context/SettingsContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  // On utilise un état pour savoir si on doit afficher l'écran de démarrage ou pas
  const [showSplash, setShowSplash] = useState(true);

  // Cette fonction est appelée quand l'animation du splash screen est terminée
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    // GestureHandlerRootView est nécessaire pour que les gestes fonctionnent correctement
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* On enveloppe l'app avec les différents providers pour partager les données */}
      <SettingsProvider>
        <AuthProvider>
          <VaultProvider>
            {/* La barre d'état s'adapte automatiquement au thème */}
            <StatusBar style="auto" />

            {/* Le navigateur principal de l'application */}
            <AppNavigator />

            {/* L'écran de démarrage animé qui s'affiche au lancement */}
            {showSplash && (
              <SplashScreen onAnimationComplete={handleSplashComplete} />
            )}
          </VaultProvider>
        </AuthProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
