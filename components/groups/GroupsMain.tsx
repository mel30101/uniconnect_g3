import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { UCaldasTheme } from '../../app/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { groupsStyles as styles } from './GroupsStyles';

export default function GroupsMain() {
    const [activeTab, setActiveTab] = useState<'miembro' | 'admin'>('miembro');

    return (
        <View style={styles.container}>
            {/* Tab Switcher */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'miembro' && styles.activeTabItem]}
                    onPress={() => setActiveTab('miembro')}
                >
                    <Text style={[styles.tabText, activeTab === 'miembro' && styles.activeTabText]}>
                        Mis Grupos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'admin' && styles.activeTabItem]}
                    onPress={() => setActiveTab('admin')}
                >
                    <Text style={[styles.tabText, activeTab === 'admin' && styles.activeTabText]}>
                        Admin
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'miembro' ? (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="people-outline" size={80} color={UCaldasTheme.azulOscuro} />
                        <Text style={styles.placeholderTitle}>Grupos seguidos</Text>
                        <Text style={styles.placeholderSubtitle}>
                            Aquí verás las comunidades de estudio a las que perteneces.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="shield-checkmark-outline" size={80} color={UCaldasTheme.azulOscuro} />
                        <Text style={styles.placeholderTitle}>Gestión de grupos</Text>
                        <Text style={styles.placeholderSubtitle}>
                            Aquí aparecerán los grupos que has creado.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
