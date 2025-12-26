import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedView, ThemedText, ThemedButton } from '../components/ThemedComponents';
import { useVault } from '../context/VaultContext';
import { spacing } from '../theme';

export default function ImportExportScreen() {
    const { getExportData, importVault } = useVault();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await getExportData();
            if (!data) {
                Alert.alert('Error', 'No data to export');
                return;
            }

            const fileUri = FileSystem.documentDirectory + 'vaultx_backup.json';
            await FileSystem.writeAsStringAsync(fileUri, data);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Success', 'Backup saved to ' + fileUri);
            }
        } catch (e) {
            Alert.alert('Error', 'Export failed: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setLoading(true);

            const content = await FileSystem.readAsStringAsync(file.uri);
            const success = await importVault(content);

            if (success) {
                Alert.alert('Success', 'Vault imported successfully');
            } else {
                Alert.alert('Error', 'Import failed. Invalid file or password mismatch.');
            }
        } catch (e) {
            Alert.alert('Error', 'Import failed: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="header" style={styles.title}>Data Management</ThemedText>
            <ThemedText style={styles.description}>
                Backup your vault to a JSON file or restore from an existing backup.
                Warning: Importing will overwrite your current vault.
            </ThemedText>

            <View style={styles.actions}>
                <ThemedButton
                    title="Export to JSON"
                    onPress={handleExport}
                    loading={loading}
                    style={styles.button}
                />
                <ThemedButton
                    title="Import from JSON"
                    onPress={handleImport}
                    loading={loading}
                    variant="secondary"
                    style={styles.button}
                />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.l,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: spacing.m,
    },
    description: {
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    actions: {
        gap: spacing.m,
    },
    button: {
        width: '100%',
    },
});
