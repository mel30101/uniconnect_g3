import React, { useEffect, useState } from 'react';
import { ScrollView, SafeAreaView, Text, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { UCaldasTheme } from '../../constants/Colors';
import { ProfileInfoRead } from '../../../components/profile/ProfileInfoRead';
import { ProfileAcademicRead } from '../../../components/profile/ProfileAcademicRead';

// IMPORTANTE: Importa Firebase para buscar el correo de Santiago
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase'; // Ajusta esta ruta a tu archivo de configuración de Firebase

export default function MemberProfileView() {
    // 1. Recibimos el userId y ahora también el userName
    const { userId, userName } = useLocalSearchParams<{ userId: string, userName: string }>();
    
    // Fíjate que YA NO extraemos 'user' de aquí, porque ese 'user' eres tú (Melody)
    const { profileData, careers, sections, loading: profileLoading } = useProfile(userId);

    // 2. Estado para guardar el correo real de Santiago
    const [targetEmail, setTargetEmail] = useState('Cargando correo...');

    // 3. Buscamos el correo de Santiago en tu base de datos
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                // Buscamos el documento del usuario en la colección 'users'
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setTargetEmail(userDoc.data().email);
                } else {
                    setTargetEmail('Correo no encontrado');
                }
            } catch (error) {
                console.log("Error buscando correo:", error);
                setTargetEmail('Error al cargar correo');
            }
        };
        if (userId) fetchUserEmail();
    }, [userId]);

    if (profileLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={UCaldasTheme.azulOscuro} />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <Stack.Screen options={{ title: 'Perfil del Estudiante', headerShown: true }} />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                
                {/* AQUÍ MOSTRAMOS EL NOMBRE DEL SOLICITANTE */}
                <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold', 
                    color: UCaldasTheme.azulOscuro, 
                    marginBottom: 25,
                    textAlign: 'center'
                }}>
                    {userName || 'Estudiante'}
                </Text>

                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                    Información General
                </Text>
                
                {/* Engañamos al componente pasándole un objeto 'user' creado por nosotros
                  con el correo que acabamos de consultar de la base de datos 
                */}
                <ProfileInfoRead 
                    user={{ email: targetEmail }} 
                    profileData={profileData} 
                    careers={careers} 
                />

                <View style={{ height: 20 }} />

                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                    Trayectoria Académica
                </Text>
                
                <ProfileAcademicRead 
                    profileData={profileData} 
                    sections={sections} 
                />

            </ScrollView>
        </SafeAreaView>
    );
}