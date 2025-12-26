// Écran de détail d'un élément (création ou modification)
// C'est ici qu'on ajoute ou modifie les informations d'un élément du coffre

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, TouchableOpacity, FlatList } from 'react-native';
import { ThemedView, ThemedText, ThemedButton, ThemedInput, useThemeColors } from '../components/ThemedComponents';
import { ThemedModal } from '../components/ThemedModal';
import { useVault } from '../context/VaultContext';
import { useSettings } from '../context/SettingsContext';
import { spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function DetailScreen({ route, navigation }) {
    // On récupère l'ID de l'élément depuis les paramètres de navigation
    const { itemId } = route.params || {};
    const { items, addItem, updateItem, deleteItem } = useVault();
    const { categories, groups } = useSettings();
    const colors = useThemeColors();

    // On cherche si l'élément existe déjà (pour savoir si c'est une modif ou une création)
    const existingItem = items.find(i => i.id === itemId);

    // Mode édition activé par défaut si c'est un nouvel élément
    const [isEditing, setIsEditing] = useState(!existingItem);
    // Garde en mémoire quels champs sensibles sont visibles
    const [visibleFields, setVisibleFields] = useState({});

    // États du formulaire
    const [title, setTitle] = useState(existingItem?.title || '');
    const [selectedCategory, setSelectedCategory] = useState(existingItem?.category || (categories[0]?.id || ''));
    const [selectedGroup, setSelectedGroup] = useState(existingItem?.sub_group || (groups[0]?.id || ''));
    const [fieldValues, setFieldValues] = useState({});

    // États des popups de sélection
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);

    // On récupère les champs de la catégorie sélectionnée
    const currentCategory = categories.find(c => c.id === selectedCategory || c.name === selectedCategory);
    const categoryFields = currentCategory?.fields || [];

    // Initialise les valeurs des champs depuis l'élément existant
    useEffect(() => {
        if (existingItem) {
            const values = {};
            categoryFields.forEach(field => {
                values[field.id] = existingItem[field.id] || '';
            });
            setFieldValues(values);
        } else {
            setFieldValues({});
        }
    }, [existingItem, selectedCategory]);

    // Met à jour la valeur d'un champ
    const handleFieldChange = (fieldId, value) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    };

    // Bascule la visibilité d'un champ sensible (mot de passe, etc.)
    const toggleFieldVisibility = (fieldId) => {
        setVisibleFields(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
    };

    // Sauvegarde l'élément (création ou mise à jour)
    const handleSave = async () => {
        if (!title) {
            Alert.alert('Erreur', 'Le titre est obligatoire');
            return;
        }

        const itemData = {
            title,
            category: selectedCategory,
            sub_group: selectedGroup,
            ...fieldValues,
        };

        let success;
        if (existingItem) {
            // On met à jour l'élément existant
            success = await updateItem(existingItem.id, itemData);
        } else {
            // On crée un nouvel élément
            success = await addItem(itemData);
        }

        if (success) {
            navigation.goBack();
        } else {
            Alert.alert('Erreur', 'Impossible de sauvegarder l\'élément');
        }
    };

    // Supprime l'élément après confirmation
    const handleDelete = () => {
        Alert.alert('Supprimer l\'élément', 'Êtes-vous sûr ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                onPress: async () => {
                    await deleteItem(existingItem.id);
                    navigation.goBack();
                }
            }
        ]);
    };

    // Fonctions utilitaires pour récupérer les noms et icônes
    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === id);
        return cat?.name || id || 'Sélectionner une catégorie';
    };

    const getGroupName = (id) => {
        const grp = groups.find(g => g.id === id);
        return grp?.name || id || 'Sélectionner un groupe';
    };

    const getGroupIcon = (id) => {
        const grp = groups.find(g => g.id === id);
        return grp?.icon || 'folder';
    };

    // Gère la sélection d'une catégorie
    const handleSelectCategory = (categoryId) => {
        setSelectedCategory(categoryId);
        setFieldValues({}); // On remet les champs à zéro car ils changent selon la catégorie
        setShowCategoryModal(false);
    };

    // Gère la sélection d'un groupe
    const handleSelectGroup = (groupId) => {
        setSelectedGroup(groupId);
        setShowGroupModal(false);
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* En-tête avec le titre et le bouton modifier */}
                <View style={styles.header}>
                    <ThemedText type="header">
                        {isEditing ? (existingItem ? 'Modifier l\'élément' : 'Nouvel élément') : title}
                    </ThemedText>
                    {!isEditing && (
                        <ThemedButton
                            title="Modifier"
                            variant="secondary"
                            onPress={() => setIsEditing(true)}
                            style={styles.editButton}
                        />
                    )}
                </View>

                {isEditing ? (
                    <>
                        {/* Champ pour le titre */}
                        <ThemedInput
                            label="Titre"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Entrez un titre"
                        />

                        {/* Sélecteur de catégorie */}
                        <View style={styles.fieldContainer}>
                            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Catégorie</ThemedText>
                            <TouchableOpacity
                                style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.card }]}
                                onPress={() => setShowCategoryModal(true)}
                            >
                                <View style={styles.selectorContent}>
                                    <Ionicons name={currentCategory?.icon || 'folder'} size={20} color={colors.text} />
                                    <ThemedText style={styles.selectorText}>{getCategoryName(selectedCategory)}</ThemedText>
                                </View>
                                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Sélecteur de groupe */}
                        <View style={styles.fieldContainer}>
                            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Groupe</ThemedText>
                            <TouchableOpacity
                                style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.card }]}
                                onPress={() => setShowGroupModal(true)}
                            >
                                <View style={styles.selectorContent}>
                                    <Ionicons name={getGroupIcon(selectedGroup)} size={20} color={colors.text} />
                                    <ThemedText style={styles.selectorText}>{getGroupName(selectedGroup)}</ThemedText>
                                </View>
                                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Titre de la section des champs de la catégorie */}
                        <ThemedText type="subHeader" style={styles.fieldsTitle}>
                            Champs {getCategoryName(selectedCategory)}
                        </ThemedText>

                        {/* Les champs de la catégorie sélectionnée */}
                        {categoryFields.map((field) => (
                            <View key={field.id} style={styles.fieldContainer}>
                                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>{field.name}</ThemedText>
                                <View style={styles.inputRow}>
                                    <ThemedInput
                                        value={fieldValues[field.id] || ''}
                                        onChangeText={(val) => handleFieldChange(field.id, val)}
                                        secureTextEntry={(field.type === 'password' || field.sensitive) && !visibleFields[field.id]}
                                        multiline={field.type === 'multiline'}
                                        keyboardType={field.type === 'number' ? 'numeric' : (field.type === 'date' ? 'default' : 'default')}
                                        style={[
                                            styles.fieldInput,
                                            field.type === 'multiline' && { height: 100, textAlignVertical: 'top' }
                                        ]}
                                        placeholder={
                                            field.type === 'date'
                                                ? 'JJ/MM/AAAA'
                                                : field.type === 'number'
                                                    ? 'Entrez un nombre'
                                                    : `Entrez ${field.name.toLowerCase()}`
                                        }
                                    />
                                    {/* Bouton pour afficher/masquer les champs sensibles */}
                                    {(field.type === 'password' || field.sensitive) && (
                                        <TouchableOpacity
                                            style={[styles.eyeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                                            onPress={() => toggleFieldVisibility(field.id)}
                                        >
                                            <Ionicons
                                                name={visibleFields[field.id] ? "eye" : "eye-off"}
                                                size={20}
                                                color={colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}

                        {/* Boutons d'action (Sauvegarder / Supprimer) */}
                        <View style={styles.actions}>
                            <ThemedButton title="Sauvegarder" onPress={handleSave} style={styles.actionButton} />
                            {existingItem && (
                                <ThemedButton
                                    title="Supprimer"
                                    onPress={handleDelete}
                                    style={styles.actionButton}
                                    textStyle={{ color: colors.danger }}
                                    variant="secondary"
                                />
                            )}
                        </View>
                    </>
                ) : (
                    // Mode affichage (lecture seule)
                    <View style={styles.details}>
                        <DetailRow label="Catégorie" value={getCategoryName(selectedCategory)} colors={colors} />
                        <DetailRow label="Groupe" value={getGroupName(selectedGroup)} colors={colors} />

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {categoryFields.map((field) => (
                            <DetailRow
                                key={field.id}
                                label={field.name}
                                value={fieldValues[field.id] || existingItem?.[field.id] || ''}
                                secure={(field.type === 'password' || field.sensitive) && !visibleFields[field.id]}
                                onToggle={(field.type === 'password' || field.sensitive) ? () => toggleFieldVisibility(field.id) : null}
                                colors={colors}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Popup de sélection de catégorie */}
            <ThemedModal visible={showCategoryModal} onClose={() => setShowCategoryModal(false)} size="medium">
                <ThemedText type="header" style={styles.modalTitle}>Choisir une Catégorie</ThemedText>

                <View style={styles.modalList}>
                    {categories.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.modalItem,
                                {
                                    backgroundColor: selectedCategory === item.id ? colors.blue : colors.card,
                                    borderColor: colors.border,
                                }
                            ]}
                            onPress={() => handleSelectCategory(item.id)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={24}
                                color={selectedCategory === item.id ? '#FFFFFF' : colors.text}
                            />
                            <ThemedText style={[
                                styles.modalItemText,
                                { color: selectedCategory === item.id ? '#FFFFFF' : colors.text }
                            ]}>
                                {item.name}
                            </ThemedText>
                            {selectedCategory === item.id && (
                                <View style={styles.checkMark}>
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedButton
                    title="Annuler"
                    variant="secondary"
                    onPress={() => setShowCategoryModal(false)}
                />
            </ThemedModal>

            {/* Popup de sélection de groupe */}
            <ThemedModal visible={showGroupModal} onClose={() => setShowGroupModal(false)} size="medium">
                <ThemedText type="header" style={styles.modalTitle}>Choisir un Groupe</ThemedText>

                <View style={styles.modalList}>
                    {groups.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.modalItem,
                                {
                                    backgroundColor: selectedGroup === item.id ? colors.blue : colors.card,
                                    borderColor: colors.border,
                                }
                            ]}
                            onPress={() => handleSelectGroup(item.id)}
                        >
                            <Ionicons
                                name={item.icon || 'folder'}
                                size={24}
                                color={selectedGroup === item.id ? '#FFFFFF' : colors.text}
                            />
                            <ThemedText style={[
                                styles.modalItemText,
                                { color: selectedGroup === item.id ? '#FFFFFF' : colors.text }
                            ]}>
                                {item.name}
                            </ThemedText>
                            {selectedGroup === item.id && (
                                <View style={styles.checkMark}>
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedButton
                    title="Annuler"
                    variant="secondary"
                    onPress={() => setShowGroupModal(false)}
                />
            </ThemedModal>
        </ThemedView>
    );
}

// Composant pour afficher une ligne de détail (en mode lecture)
const DetailRow = ({ label, value, secure, onToggle, colors }) => {
    if (!value) return null;
    return (
        <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
            <View style={styles.valueContainer}>
                <ThemedText style={styles.value}>
                    {secure ? '••••••••' : value}
                </ThemedText>
                {onToggle && (
                    <TouchableOpacity onPress={onToggle} style={styles.eyeIcon}>
                        <Ionicons
                            name={secure ? "eye-off" : "eye"}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// Les styles de l'écran
const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.m },
    // En-tête avec le titre
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.l
    },
    editButton: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m
    },
    // Conteneur de champ
    fieldContainer: {
        marginBottom: spacing.m,
    },
    label: {
        fontSize: 14,
        marginBottom: spacing.s,
    },
    // Sélecteur (catégorie / groupe)
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: borderRadius.m,
        padding: spacing.m,
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s,
    },
    selectorText: {
        fontSize: 16,
    },
    // Ligne de saisie avec bouton œil
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.s,
    },
    fieldInput: {
        flex: 1,
        marginBottom: 0,
    },
    eyeButton: {
        width: 48,
        height: 48,
        borderWidth: 1,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Séparateur horizontal
    divider: {
        height: 1,
        marginVertical: spacing.l
    },
    fieldsTitle: {
        marginBottom: spacing.m,
    },
    // Boutons d'action en bas
    actions: {
        marginTop: spacing.l,
        gap: spacing.m
    },
    actionButton: {
        width: '100%'
    },
    // Mode affichage (lecture)
    details: {
        gap: spacing.m
    },
    row: {
        marginBottom: spacing.m
    },
    rowLabel: {
        fontSize: 12,
        marginBottom: 4
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    value: {
        fontSize: 16,
        flex: 1,
    },
    eyeIcon: {
        padding: spacing.s,
    },
    // Styles des popups
    modalTitle: {
        marginBottom: spacing.l,
        textAlign: 'center',
    },
    modalList: {
        marginBottom: spacing.m,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        marginBottom: spacing.s,
        gap: spacing.m,
    },
    modalItemText: {
        fontSize: 16,
        flex: 1,
    },
    checkMark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
