import { useGroupDetail } from '@/src/presentation/hooks/useGroupDetail';
import { useSearchStudents } from "@/src/presentation/hooks/useSearchStudents";
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, Platform } from 'react-native';
import { UCaldasTheme } from '../constants/Colors';
import { styles } from './GroupDetailStyles';
import { AddMemberModal } from '../../src/presentation/components/groups/AddMemberModal';
import { GroupInfo } from '../../src/presentation/components/groups/GroupInfo';
import { MembersList } from '../../src/presentation/components/groups/MembersList';
import { PendingRequests } from '../../src/presentation/components/groups/PendingRequests';

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const groupActions = useGroupDetail(id!);
    const { group, requests, loading, isAdmin, isMember, user } = groupActions;

    const [sendingRequest, setSendingRequest] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    
    const { users: availableStudents, performSearch } = useSearchStudents(user?.uid);

    useEffect(() => {
        if (isAdmin && id) groupActions.fetchRequests();
    }, [isAdmin, id]);

    const handleJoinRequest = async () => {
        setSendingRequest(true);
        const success = await groupActions.joinGroup();
        setSendingRequest(false);
        if (success) router.back();
    };

    const handleLeaveGroup = () => {
        if (Platform.OS === 'web') {
            if (window.confirm("¿Estás seguro de que quieres salir del grupo?")) {
                groupActions.leaveGroup().then((success: boolean) => {
                    if (success) router.replace('/(tabs)/home');
                });
            }
        } else {
            Alert.alert("Salir del grupo", "¿Estás seguro de que quieres salir?", [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sí, salir", style: "destructive", 
                    onPress: async () => {
                        const success = await groupActions.leaveGroup();
                        if (success) router.replace('/(tabs)/home');
                    } 
                }
            ]);
        }
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
                
                <GroupInfo group={group} isAdmin={isAdmin} />
                
                {isMember && (
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: UCaldasTheme.azulOscuro, marginTop: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]} 
                        onPress={() => router.push(`/group/chat/${id}`)}
                    >
                        <Ionicons name="chatbubbles-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Ingresar al Chat del Grupo</Text>
                    </TouchableOpacity>
                )}
                
                <MembersList 
                    group={group} 
                    isAdmin={isAdmin} 
                    isMember={isMember} 
                    user={user} 
                    groupActions={groupActions} 
                />

                {isAdmin && requests.length > 0 && (
                    <PendingRequests requests={requests} processRequest={groupActions.processRequest} />
                )}

                {isMember && !isAdmin && (
                    <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
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

            <AddMemberModal 
                visible={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                group={group} 
                requests={requests}
                availableStudents={availableStudents}
                performSearch={performSearch}
                addMemberToGroup={groupActions.addMemberToGroup}
            />
        </SafeAreaView>
    );
}