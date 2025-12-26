import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedView, ThemedText } from '../components/ThemedComponents';
import { useVault } from '../context/VaultContext';
import { spacing, colors } from '../theme';

export default function QRScanScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const { importVault } = useVault();

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned) return;
        setScanned(true);
        try {
            const success = await importVault(data);
            if (success) {
                Alert.alert('Success', 'Vault imported successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', 'Invalid QR code or password mismatch', [
                    { text: 'Try Again', onPress: () => setScanned(false) }
                ]);
            }
        } catch (e) {
            Alert.alert('Error', 'Import failed', [
                { text: 'Try Again', onPress: () => setScanned(false) }
            ]);
        }
    };

    if (!permission) {
        return <ThemedView style={styles.center}><ThemedText>Requesting permissions...</ThemedText></ThemedView>;
    }

    if (!permission.granted) {
        return (
            <ThemedView style={styles.center}>
                <ThemedText style={{ marginBottom: 10 }}>No access to camera</ThemedText>
                <ThemedText onPress={requestPermission} style={{ color: colors.blue }}>Grant Permission</ThemedText>
            </ThemedView>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />
            {scanned && (
                <View style={styles.overlay}>
                    <ThemedText style={styles.processing}>Processing...</ThemedText>
                </View>
            )}
            <View style={styles.frameContainer}>
                <View style={styles.frame} />
                <ThemedText style={styles.hint}>Align QR code within the frame</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    processing: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    frameContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    frame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: colors.blue,
        backgroundColor: 'transparent',
        marginBottom: spacing.m,
    },
    hint: {
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: spacing.s,
        borderRadius: spacing.s,
    },
});
