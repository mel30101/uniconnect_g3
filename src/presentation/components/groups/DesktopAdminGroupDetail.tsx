import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './DesktopAdminGroupDetailStyles';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/presentation/store/useAuthStore';
import { getOrCreateChat } from '@/src/di/container';
import { AddMemberModal } from './AddMemberModal';

// --- Tarjetas de Estadísticas ---
function StatCard({ title, value, subValue, subColor, icon, iconColor, bgColor }: any) {
    return (
        <View style={styles.statCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.statTitle}>{title}</Text>
                <Text style={styles.statValue}>{value}</Text>
                {subValue && <Text style={[styles.statSub, { color: subColor || '#708ab5' }]}>{subValue}</Text>}
            </View>
            <View style={[styles.statIconWrapper, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>
        </View>
    );
}

// --- Tarjeta de Solicitudes Recientes ---
function RecentRequestsCard() {
    return (
        <View style={styles.rightCard}>
            <View style={styles.rightCardHeader}>
                <Text style={styles.rightCardTitle}>Solicitudes Recientes</Text>
                <View style={[styles.badge, { backgroundColor: '#f0f4ff' }]}><Text style={[styles.badgeText, { color: '#708ab5' }]}>0</Text></View>
            </View>

            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Ionicons name="document-text-outline" size={32} color="#e5eeff" style={{ marginBottom: 10 }} />
                <Text style={{ color: '#708ab5', fontSize: 13, textAlign: 'center' }}>No hay solicitudes pendientes por el momento.</Text>
            </View>
        </View>
    );
}

// --- Tarjeta de Abandonar Grupo ---
function AbandonGroupCard() {
    return (
        <View style={styles.abandonCard}>
            <View style={{ marginBottom: 15 }}>
                <Text style={styles.abandonTitle}>Abandonar Grupo</Text>
                <Text style={styles.abandonSub}>Salir de esta comunidad. Debes tranferir la administración.</Text>
            </View>
            <TouchableOpacity style={styles.abandonBtn}>
                <Text style={styles.abandonBtnText}>Abandonar Grupo</Text>
            </TouchableOpacity>
        </View>
    );
}

export function DesktopAdminGroupDetail({ 
    groupActions, 
    id,
    availableStudents,
    performSearch 
}: { 
    groupActions: any, 
    id: string,
    availableStudents?: any[],
    performSearch?: (search: string, selectedMaterias: string[]) => Promise<void> | void
}) {
    const { group, loading, addMemberToGroup, removeMember } = groupActions;
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    if (loading) return <Text>Cargando administración...</Text>;

    const openGroupChat = () => {
        router.push(`/group/chat/${id}`);
    };

    const openChat = async (member: any) => {
        if (!user?.uid || !member.id) return;
        const chatId = await getOrCreateChat.execute(user.uid, member.id, user.name ?? "usuario", member.name);
        router.push({ pathname: "/chat/[chatId]", params: { chatId } });
    };

    const confirmRemove = (member: any) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`¿Eliminar a ${member.name} del grupo?`)) {
                removeMember(member.id);
            }
        } else {
            Alert.alert("Eliminar miembro", `¿Eliminar a ${member.name} del grupo?`, [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => removeMember(member.id) }
            ]);
        }
    };

    const membersList = [...(group?.members || [])].sort((a: any, b: any) => {
        // Administrador primero
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        // Luego orden alfabético
        return (a.name || '').localeCompare(b.name || '');
    });

    return (
        <View style={styles.container}>
            {/* Sidebar */}
            <View style={styles.sidebar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#708ab5" />
                    <Text style={styles.backText}>Volver a Mis Grupos</Text>
                </TouchableOpacity>

                <View style={styles.groupInfoSidebar}>
                    <Text style={styles.sidebarGroupName}>{group?.name || 'Administración'}</Text>
                    <Text style={styles.sidebarSubject}>Portal Administrativo</Text>
                </View>

                <View style={styles.menu}>
                    <Text style={styles.menuSectionTitle}>PRINCIPAL</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.back()}>
                        <Ionicons name="grid-outline" size={20} color="#708ab5" />
                        <Text style={styles.menuText}>Dashboard General</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]}>
                        <Ionicons name="flask-outline" size={20} color="#B8860B" />
                        <Text style={[styles.menuText, styles.menuTextActive]}>{group?.name || 'Grupo'}</Text>
                    </TouchableOpacity>

                    <Text style={[styles.menuSectionTitle, { marginTop: 20 }]}>HERRAMIENTAS</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="document-text-outline" size={20} color="#708ab5" />
                        <Text style={styles.menuText}>Solicitudes</Text>
                        <View style={[styles.menuBadge, { backgroundColor: '#f0f4ff' }]}><Text style={[styles.menuBadgeText, { color: '#708ab5' }]}>0</Text></View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={openGroupChat}>
                        <Ionicons name="chatbubbles-outline" size={20} color="#708ab5" />
                        <Text style={styles.menuText}>Chat Grupal</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contenido principal */}
            <ScrollView style={styles.mainContentScrollView} contentContainerStyle={styles.mainContent}>

                {/* Top Header Row */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View>
                            <View style={styles.titleRow}>
                                <Text style={styles.pageTitle}>{group?.name}</Text>
                                <View style={styles.statusBadge}><Text style={styles.statusText}>ACTIVO</Text></View>
                            </View>
                            <Text style={styles.pageSubtitle}>{group?.subjectName || 'Facultad de Ingeniería'} - Gestión de proyectos y miembros del grupo.</Text>
                        </View>
                        <TouchableOpacity style={styles.primaryButton} onPress={() => setAddModalVisible(true)}>
                            <Ionicons name="add" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                            <Text style={styles.primaryButtonText}>Nuevo Miembro</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Content Layout */}
                <View style={styles.contentLayout}>

                    {/* Left Column */}
                    <View style={styles.leftColumn}>

                        {/* 3 Stat Cards Row */}
                        <View style={styles.statsRow}>
                            <StatCard
                                title="Total Miembros"
                                value={membersList.length.toString()}
                                icon="people" iconColor="#002147" bgColor="#f0f4ff"
                            />
                            <StatCard
                                title="Solicitudes Pendientes"
                                value="0"
                                subValue="Todo al día" subColor="#1e8e3e"
                                icon="checkmark-circle-outline" iconColor="#1e8e3e" bgColor="#e6f4ea"
                            />
                        </View>

                        {/* Miembros List */}
                        <View style={styles.tableCard}>
                            <View style={styles.tableHeaderSection}>
                                <Text style={styles.tableTitle}>Listado de Miembros</Text>
                            </View>

                            <View style={styles.tableColHeader}>
                                <Text style={[styles.colHeaderText, { flex: 2 }]}>NOMBRE</Text>
                                <Text style={[styles.colHeaderText, { flex: 1 }]}>ROL</Text>
                                <Text style={[styles.colHeaderText, { flex: 1 }]}>ESTADO</Text>
                                <Text style={[styles.colHeaderText, { width: 80, textAlign: 'center' }]}>ACCIONES</Text>
                            </View>

                            {membersList.length === 0 ? (
                                <Text style={{ padding: 20, textAlign: 'center', color: '#708ab5' }}>No hay miembros aún.</Text>
                            ) : (
                                membersList.map((member: any, index: number) => {
                                    // Use actual data
                                    const role = member.role === 'admin' ? 'Administrador' : 'Estudiante';
                                    const isAdmin = member.role === 'admin';
                                    const initials = member.name ? member.name.substring(0, 2).toUpperCase() : 'U';

                                    return (
                                        <View key={member.id || index} style={styles.tableRow}>
                                            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={styles.rowAvatar}><Text style={styles.rowAvatarText}>{initials}</Text></View>
                                                <Text style={styles.rowName}>{member.name || 'Usuario'}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <View style={isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeStudent}>
                                                    <Text style={isAdmin ? styles.roleTextAdmin : styles.roleTextStudent}>{role}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <View style={styles.statusBadgeActive}>
                                                    <Text style={styles.statusTextActive}>Activo</Text>
                                                </View>
                                            </View>
                                            <View style={{ width: 80, flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                                                {isAdmin ? (
                                                    <Ionicons name="star" size={20} color="#B8860B" />
                                                ) : (
                                                    <>
                                                        <TouchableOpacity onPress={() => openChat(member)}>
                                                            <Ionicons name="chatbox-ellipses" size={20} color="#708ab5" />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => confirmRemove(member)}>
                                                            <Ionicons name="trash-outline" size={20} color="#d93025" />
                                                        </TouchableOpacity>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })
                            )}

                            <View style={styles.tableFooter}>
                                <Text style={styles.footerText}>Mostrando {membersList.length} miembros</Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={styles.pageBtn}><Text style={styles.pageBtnText}>Anterior</Text></View>
                                    <View style={styles.pageBtn}><Text style={styles.pageBtnText}>Siguiente</Text></View>
                                </View>
                            </View>

                            {/* Botón Chat Grupal Extra debajo de la tabla */}
                            <TouchableOpacity style={styles.extraChatBtn} onPress={openGroupChat}>
                                <Ionicons name="chatbubbles" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                                <Text style={styles.extraChatBtnText}>Abrir Chat Grupal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Right Column (Control Panel) */}
                    <View style={styles.rightColumn}>
                        <RecentRequestsCard />
                        <AbandonGroupCard />
                    </View>
                </View>
            </ScrollView>



            <AddMemberModal
                visible={isAddModalVisible}
                onClose={() => setAddModalVisible(false)}
                group={group}
                availableStudents={availableStudents}
                performSearch={performSearch}
                addMemberToGroup={addMemberToGroup}
            />
        </View>
    );
}

