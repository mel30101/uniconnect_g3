import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar, Alert, Modal, TextInput, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UCaldasTheme } from '../constants/Colors';
import { getOrCreateChat } from '@/src/di/container';
import { useGroupDetail } from '@/src/presentation/hooks/useGroupDetail';
import { styles } from './GroupDetailStyles';
import { useAuthStore } from '@/src/presentation/store/useAuthStore';
import { useSearchStudents } from "@/src/presentation/hooks/useSearchStudents";

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const {
        group,
        setGroup,
        requests,
        loading,
        isAdmin,
        isMember,
        user,
        fetchDetail,
        fetchRequests,
        joinGroup,
        processRequest,
        transferAdmin,
        removeMember,
        addMemberToGroup,
        leaveGroup,
    } = useGroupDetail(id!);

    const [sendingRequest, setSendingRequest] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const {
        users: availableStudents,
        loading: searchLoading,
        performSearch
    } = useSearchStudents(user?.uid);

    useEffect(() => {
        if (isAdmin && id) fetchRequests();
    }, [isAdmin, id]);

    useEffect(() => {
        if (showAddModal && group?.subjectId) {
            performSearch("", [group.subjectId]);
        }
    }, [showAddModal, group?.subjectId]);

    const handleJoinRequest = async () => {
        setSendingRequest(true);
        const success = await joinGroup();
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
                                    <Text style={styles.memberRole}>{member.role === 'admin' ? 'Administrador' : 'Estudiante'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                                    {member.role === 'admin' && (
                                        <View style={styles.starCircle}>
                                            <Ionicons name="star" size={14} color="#fff" />
                                        </View>
                                    )}
                                    {isAdmin && member.id !== user?.uid && (
                                        <TouchableOpacity onPress={() => {
                                            Alert.alert(
                                                "Ceder cargo",
                                                `¿Estás seguro de que deseas cederle el cargo de administrador a ${member.name}?`,
                                                [
                                                    { text: "Cancelar", style: "cancel" },
                                                    {
                                                        text: "Aceptar",
                                                        style: "destructive",
                                                        onPress: async () => {
                                                            const success = await transferAdmin(member.id);
                                                            if (success) router.back();
                                                        }
                                                    }
                                                ]
                                            );
                                        }}>
                                            <Ionicons name="key-outline" size={22} color={UCaldasTheme.dorado} />
                                        </TouchableOpacity>
                                    )}
                                    {isAdmin && member.role !== 'admin' && (
                                        <TouchableOpacity onPress={() => {
                                            Alert.alert(
                                                "Eliminar miembro",
                                                `¿Estás seguro de que quieres eliminar a ${member.name} del grupo?`,
                                                [
                                                    { text: "Cancelar", style: "cancel" },
                                                    {
                                                        text: "Eliminar",
                                                        style: "destructive",
                                                        onPress: async () => {
                                                            await removeMember(member.id);
                                                        }
                                                    }
                                                ]
                                            );
                                        }}>
                                            <Ionicons name="trash-outline" size={22} color="#F44336" />
                                        </TouchableOpacity>
                                    )}
                                    {isMember && member.id !== user?.uid && (
                                        <TouchableOpacity onPress={async () => {
                                            if (!user?.uid || !member.id) return;
                                            const chatId = await getOrCreateChat.execute(user.uid, member.id, user.name ?? "usuario", member.name);
                                            router.push({ pathname: "/chat/[chatId]", params: { chatId } });
                                        }}>
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
                                    <TouchableOpacity
                                        onPress={() => {
                                            router.push({
                                                pathname: "/group/member-profile/[userId]",
                                                params: { userId: req.userId, userName: req.userName }
                                            });
                                        }}
                                    >
                                        <Text style={{ fontWeight: 'bold', color: UCaldasTheme.azulOscuro, textDecorationLine: 'underline' }}>
                                            {req.userName}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.memberName}></Text>
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={async () => {
                                            await processRequest(req.id, 'accepted');
                                        }}>
                                            <Text style={styles.actionButtonText}>Aceptar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F44336', marginLeft: 10 }]} onPress={() => processRequest(req.id, 'rejected')}>
                                            <Text style={styles.actionButtonText}>Rechazar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                {isMember && !isAdmin && (
                    <TouchableOpacity
                        style={styles.leaveButton}
                        onPress={() => {
                            Alert.alert(
                                "Salir del grupo",
                                "¿Estás seguro de que quieres salir de este grupo de estudio?",
                                [
                                    { text: "Cancelar", style: "cancel" },
                                    {
                                        text: "Sí, salir",
                                        style: "destructive",
                                        onPress: async () => {
                                            const success = await leaveGroup();
                                            if (success) {
                                                router.replace('/(tabs)/home');
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salirme del grupo</Text>
                    </TouchableOpacity>
                )}

                {isAdmin && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#4CAF50', marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', marginRight: 8 }}>Añadir miembro</Text>
                        <Ionicons name="add-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                )}

                <Modal visible={showAddModal} animationType="slide">
                    <SafeAreaView style={{ flex: 1, padding: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={28} color={UCaldasTheme.azulOscuro} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 15 }}>Buscar Compañeros</Text>
                        </View>

                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por nombre..."
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                performSearch(text, [group.subjectId]);
                            }}
                        />

                        <FlatList
                            data={availableStudents}
                            keyExtractor={(item) => item.uid}
                            renderItem={({ item }) => {
                                const isAlreadyInGroup = group?.members?.some((m: any) => m.id === item.uid);
                                return (
                                    <View style={[styles.memberItem, { opacity: isAlreadyInGroup ? 0.6 : 1 }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
                                            {isAlreadyInGroup && (
                                                <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
                                                    Ya es miembro
                                                </Text>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            disabled={isAlreadyInGroup}
                                            onPress={async () => {
                                                const success = await addMemberToGroup(item.uid);
                                                if (success) {
                                                    Alert.alert("Éxito", "Estudiante añadido");
                                                    setShowAddModal(false);
                                                }
                                            }}
                                            style={{
                                                backgroundColor: isAlreadyInGroup ? '#BDBDBD' : UCaldasTheme.azulOscuro,
                                                paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                {isAlreadyInGroup ? "Miembro" : "Añadir"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            }}
                        />
                    </SafeAreaView>
                </Modal>
            </ScrollView>
            {!isMember && (
                <View style={styles.footerContainer}>
                    <TouchableOpacity style={[styles.requestButton, sendingRequest && styles.requestButtonDisabled]} onPress={handleJoinRequest} disabled={sendingRequest}>
                        {sendingRequest ? <ActivityIndicator color="#fff" /> : (
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