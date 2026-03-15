import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { UCaldasTheme } from '../constants/Colors';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/presentation/store/useAuthStore';
import { ApiProfileRepository } from '@/src/data/repositories/ApiProfileRepository';

export default function TabLayout() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const syncProfile = async () => {
      if (user?.uid && !user.careerId) {
        try {
          const profileRepo = new ApiProfileRepository();
          const profile = await profileRepo.getProfile(user.uid);
          if (profile) {
            setUser({ ...user, ...profile } as any);
          }
        } catch (error) {
          console.error("Error syncing profile in layout:", error);
        }
      }
    };
    syncProfile();
  }, [user?.uid, user?.careerId]);

  return (
    <Tabs
      screenOptions={{
        // 1. Estilo global del encabezado para todas las pestañas
        headerStyle: {
          backgroundColor: UCaldasTheme.azulOscuro,
          elevation: 0, // Quita la sombra en Android
          shadowOpacity: 0, // Quita la sombra en iOS
        },
        headerTintColor: UCaldasTheme.blanco,
        headerTitleAlign: 'left',

        // 2. Insertar el Logo y el nombre de la Universidad
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: 'https://www.ucaldas.edu.co/portal/wp-content/uploads/2023/06/Logo_80_anos_Universidad_de_Caldas_Blanco.png' }}
              style={{ width: 70, height: 50, marginRight: 10 }}
              resizeMode="contain"
            />
            <Text style={{ color: UCaldasTheme.blanco, fontSize: 18, fontWeight: 'bold' }}>
              UniConnect G3
            </Text>
          </View>
        ),
      }}
    >
      {/* Pestaña de Inicio */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
        }}
      />

      {/* Pestaña de Buscar */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />

      {/* Pestaña de Mis Grupos */}
      <Tabs.Screen
        name="mis-grupos"
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />


      {/* Pestaña de Chats*/}
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
        }}
      />

      {/* Pestaña de Perfil - AQUÍ QUITAMOS EL HEADER DUPLICADO */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>


  );
}