import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UCaldasTheme } from '../constants/Colors';
import { getOrCreateChat } from '../../services/chatService';
import { useGroups } from '../../hooks/useGroups';
import { styles } from './GroupDetailStyles';
import { useAuthStore } from '../../store/useAuthStore';

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { fetchGroupDetail, fetchRequests, joinGroup, processRequest, requests, loading } = useGroups();

    const [group, setGroup] = useState<any>(null);
    const [sendingRequest, setSendingRequest] = useState(false);
    const user = useAuthStore((state) => state.user);

    const isAdmin = group?.members?.some((m: any) => m.id === user?.uid && m.role === 'admin');
    const isMember = group?.members?.some((m: any) => m.id === user?.uid);

    useEffect(() => {
        if (id) fetchGroupDetail(id).then(data => data && setGroup(data));
    }, [id]);

    useEffect(() => {
        if (isAdmin && id) fetchRequests(id);
    }, [isAdmin, id]);

    const handleJoinRequest = async () => {
        setSendingRequest(true);
        const success = await joinGroup(id!);
        if (success) router.back();
        setSendingRequest(false);
    };

    if (loading && !group) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={UCaldasTheme.azulOscuro} />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
    );

    if (!group) return (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
            <Text style={styles.errorText}>No se encontró el grupo.</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.headerNav}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
                    <Ionicons name="arrow-back" size={24} color={UCaldasTheme.azulOscuro} />
                </TouchableOpacity>
                <Text style={styles.headerNavTitle}>Detalles del Grupo</Text>
                <View style={{ width: 45 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.mainInfoCard}>
                    <View style={styles.groupHeader}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <View style={styles.subjectBox}>
                            <Ionicons name="book" size={16} color={UCaldasTheme.dorado} />
                            <Text style={styles.subjectName}>{group.subjectName}</Text>
                        </View>
                        <View style={styles.badgeWrapper}>
                            {isAdmin && (
                                <View style={styles.adminBadge}>
                                    <Ionicons name="shield-checkmark" size={14} color="#fff" />
                                    <Text style={styles.adminBadgeText}>Administrador</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {group.description && group.description.trim().length > 0 && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle-outline" size={20} color={UCaldasTheme.azulOscuro} />
                            <Text style={styles.sectionTitle}>Descripción</Text>
                        </View>
                        <Text style={styles.description}>{group.description}</Text>
                    </View>
                )}

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="people-outline" size={20} color={UCaldasTheme.azulOscuro} />
                        <Text style={styles.sectionTitle}>Miembros de la Comunidad</Text>
                    </View>
                    <View style={styles.membersList}>
                        {group.members.map((member: any) => (
                            <View key={member.id} style={styles.memberItem}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <Text style={styles.memberRole}>{member.role === 'admin' ? 'Administrador del grupo' : 'Estudiante'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
                                    {member.role === 'admin' && (
                                        <View style={[styles.starCircle, { marginRight: member.id !== user?.uid ? 10 : 0 }]}><Ionicons name="star" size={14} color="#fff" /></View>
                                    )}
                                    {isMember && member.id !== user?.uid && (
                                        <TouchableOpacity
                                            onPress={async () => {
                                                if (!user?.uid || !member.id) return;
                                                const chatId = await getOrCreateChat(user.uid, member.id, user.name ?? "usuario", member.name);
                                                router.push({ pathname: "/chat/[chatId]", params: { chatId } });
                                            }}
                                        >
                                            <Ionicons name="chatbubble-ellipses" size={24} color={UCaldasTheme.azulOscuro} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {isAdmin && requests.length > 0 && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="notifications-outline" size={20} color={UCaldasTheme.azulOscuro} />
                            <Text style={styles.sectionTitle}>Solicitudes Pendientes</Text>
                        </View>
                        {requests.map((req) => (
                            <View key={req.id} style={styles.memberItem}>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{req.userName}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={async () => {
                                            const success = await processRequest(id!, req.id, 'accepted');
                                            if (success) {
                                                fetchGroupDetail(id!).then(data => data && setGroup(data));
                                            }
                                        }}>
                                            <Text style={styles.actionButtonText}>Aceptar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F44336', marginLeft: 10 }]} onPress={() => processRequest(id!, req.id, 'rejected')}>
                                            <Text style={styles.actionButtonText}>Rechazar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {!isMember && (
                <View style={styles.footerContainer}>
                    <TouchableOpacity style={[styles.requestButton, sendingRequest && styles.requestButtonDisabled]} onPress={handleJoinRequest} disabled={sendingRequest}>
                        {sendingRequest ? <ActivityIndicator color="#fff" /> : (
                            <><Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.requestButtonText}>Solicitar unirme al grupo</Text></>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}