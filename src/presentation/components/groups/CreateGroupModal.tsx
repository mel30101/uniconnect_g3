import React, { useState } from 'react';
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UCaldasTheme } from '@/app/constants/Colors';
import { useGroups } from '../../hooks/useGroups';
import { Collapsible } from '../common/Collapsible';
import { styles } from './CreateGroupModalStyles';

interface CreateGroupModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateGroupModal = ({ visible, onClose, onSuccess }: CreateGroupModalProps) => {
    const { createGroup, userSubjects, loading } = useGroups();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);

    const handleCreate = async () => {
        if (!name.trim()) {
            alert('Por favor, ingresa un nombre para el grupo.');
            return;
        }
        if (name.length < 3) {
            alert('El nombre debe tener al menos 3 caracteres.');
            return;
        }
        if (!selectedSubject) {
            alert('Por favor, selecciona una materia.');
            return;
        }

        const result = await createGroup(name, selectedSubject.id, description);
        if (result) {
            setName('');
            setDescription('');
            setSelectedSubject(null);
            onSuccess();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            {Platform.OS === 'web' ? (
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior="height"
                        style={styles.modalContainer}
                    >
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>Crear Nuevo Grupo</Text>
                                <Text style={styles.subtitle}>Define tu comunidad de estudio</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={UCaldasTheme.negro} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <View style={styles.form}>
                                <Text style={styles.label}>Nombre del Grupo *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Estudio Cálculo I"
                                    value={name}
                                    onChangeText={setName}
                                    maxLength={30}
                                />

                                <Text style={styles.label}>Descripción</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="¿De qué trata el grupo?"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />

                                <Text style={styles.label}>Asocia una Materia *</Text>
                                <View style={styles.selectorWrapper}>
                                    <Collapsible
                                        title={selectedSubject ? selectedSubject.name : "Selecciona una materia..."}
                                    >
                                        <View style={styles.chipsContainer}>
                                            {userSubjects.length > 0 ? (
                                                userSubjects.map((subject) => (
                                                    <TouchableOpacity
                                                        key={subject.id}
                                                        onPress={() => setSelectedSubject(subject)}
                                                        style={[
                                                            styles.chip,
                                                            selectedSubject?.id === subject.id && styles.chipActive,
                                                        ]}
                                                    >
                                                        <Text style={[
                                                            styles.chipText,
                                                            selectedSubject?.id === subject.id && styles.chipTextActive,
                                                        ]}>
                                                            {subject.name}
                                                        </Text>
                                                        {selectedSubject?.id === subject.id && (
                                                            <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginLeft: 6 }} />
                                                        )}
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <Text style={styles.emptyText}>No tienes materias registradas en tu perfil.</Text>
                                            )}
                                        </View>
                                    </Collapsible>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.disabledButton]}
                                onPress={handleCreate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.submitButtonText}>Crear Grupo</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            ) : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.modalContainer}
                        >
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.title}>Crear Nuevo Grupo</Text>
                                    <Text style={styles.subtitle}>Define tu comunidad de estudio</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={UCaldasTheme.negro} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                <View style={styles.form}>
                                    <Text style={styles.label}>Nombre del Grupo *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ej: Estudio Cálculo I"
                                        value={name}
                                        onChangeText={setName}
                                        maxLength={30}
                                    />

                                    <Text style={styles.label}>Descripción</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="¿De qué trata el grupo?"
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={3}
                                    />

                                    <Text style={styles.label}>Asocia una Materia *</Text>
                                    <View style={styles.selectorWrapper}>
                                        <Collapsible
                                            title={selectedSubject ? selectedSubject.name : "Selecciona una materia..."}
                                        >
                                            <View style={styles.chipsContainer}>
                                                {userSubjects.length > 0 ? (
                                                    userSubjects.map((subject) => (
                                                        <TouchableOpacity
                                                            key={subject.id}
                                                            onPress={() => setSelectedSubject(subject)}
                                                            style={[
                                                                styles.chip,
                                                                selectedSubject?.id === subject.id && styles.chipActive,
                                                            ]}
                                                        >
                                                            <Text style={[
                                                                styles.chipText,
                                                                selectedSubject?.id === subject.id && styles.chipTextActive,
                                                            ]}>
                                                                {subject.name}
                                                            </Text>
                                                            {selectedSubject?.id === subject.id && (
                                                                <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginLeft: 6 }} />
                                                            )}
                                                        </TouchableOpacity>
                                                    ))
                                                ) : (
                                                    <Text style={styles.emptyText}>No tienes materias registradas en tu perfil.</Text>
                                                )}
                                            </View>
                                        </Collapsible>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.disabledButton]}
                                    onPress={handleCreate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={styles.submitButtonText}>Crear Grupo</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </Modal>
    );
};
