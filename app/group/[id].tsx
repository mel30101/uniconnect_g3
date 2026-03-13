import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar , Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UCaldasTheme } from '../constants/Colors';
import { useGroups } from '../../hooks/useGroups';
import { styles } from './GroupDetailStyles';
import { useAuthStore } from '../../store/useAuthStore';    
import axios from 'axios'; 

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { fetchGroupDetail, loading } = useGroups();
    const [group, setGroup] = useState<any>(null);
    const [sendingRequest, setSendingRequest] = useState(false);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (id) {
            loadGroupDetail();
        }
    }, [id]);

    const loadGroupDetail = async () => {
        const data = await fetchGroupDetail(id);
        if (data) {
            setGroup(data);
        }
    };

    const handleJoinRequest = async () => {
        if (!user) return;
        
        setSendingRequest(true);
        try {
            await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/groups/${id}/requests`, {
                userId: user.uid, 
                userName: user.name,
            });
            Alert.alert("¡Solicitud enviada!", "El administrador del grupo revisará tu solicitud pronto.");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Hubo un problema al enviar la solicitud. Intenta de nuevo.");
            console.error(error);
        } finally {
            setSendingRequest(false);
        }
    };

    if (loading && !group) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={UCaldasTheme.azulOscuro} />
                <Text style={styles.loadingText}>Cargando detalles del grupo...</Text>
            </View>
        );
    }

    if (!group) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
                <Text style={styles.errorText}>No se encontró el grupo.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Asegúrate de usar la propiedad correcta (user.uid o user.id) según tu base de datos
    const isMember = group.members.some((member: any) => member.id === user?.uid);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
            />

            <View style={styles.headerNav}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
                    <Ionicons name="arrow-back" size={24} color={UCaldasTheme.azulOscuro} />
                </TouchableOpacity>
                <Text style={styles.headerNavTitle}>Detalles del Grupo</Text>
                <View style={{ width: 45 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Information Box */}
                <View style={styles.mainInfoCard}>
                    <View style={styles.groupHeader}>
                        <Text style={styles.groupName}>{group.name}</Text>

                        <View style={styles.subjectBox}>
                            <Ionicons name="book" size={16} color={UCaldasTheme.dorado} />
                            <Text style={styles.subjectName}>{group.subjectName}</Text>
                        </View>

                        <View style={styles.badgeWrapper}>
                            <View style={styles.adminBadge}>
                                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                                <Text style={styles.adminBadgeText}>Administrador</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 4. Descripción - Conditional Rendering */}
                {group.description && group.description.trim().length > 0 && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle-outline" size={20} color={UCaldasTheme.azulOscuro} />
                            <Text style={styles.sectionTitle}>Descripción</Text>
                        </View>
                        <Text style={styles.description}>
                            {group.description}
                        </Text>
                    </View>
                )}

                {/* 5. Lista de Miembros */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="people-outline" size={20} color={UCaldasTheme.azulOscuro} />
                        <Text style={styles.sectionTitle}>Miembros de la Comunidad</Text>
                    </View>
                    <View style={styles.membersList}>
                        {group.members.map((member: any) => (
                            <View key={member.id} style={styles.memberItem}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.avatarText}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <Text style={styles.memberRole}>
                                        {member.role === 'admin' ? 'Administrador del grupo' : 'Estudiante'}
                                    </Text>
                                </View>
                                {member.role === 'admin' && (
                                    <View style={styles.starCircle}>
                                        <Ionicons name="star" size={14} color="#fff" />
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
            {!isMember && (
                <View style={styles.footerContainer}>
                    <TouchableOpacity 
                        style={[styles.requestButton, sendingRequest && styles.requestButtonDisabled]} 
                        onPress={handleJoinRequest}
                        disabled={sendingRequest}
                    >
                        {sendingRequest ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.requestButtonText}>Solicitar unirme al grupo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
