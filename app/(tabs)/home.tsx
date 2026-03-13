import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { EventCard } from '../../components/EventCard';
import { useAuthStore } from '../../store/useAuthStore';
import { getValidSortedEvents } from '../../utils/dateUtils';
import { UCaldasTheme } from '../constants/Colors';
import { UniversityEvent } from '../constants/mockEvents';

export default function WelcomeScreen() {
    const user = useAuthStore((state) => state.user);
    const userName = user?.name;

    const [events, setEvents] = useState<UniversityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get<UniversityEvent[]>(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/events`);
            const sortedEvents = getValidSortedEvents(response.data);
            setEvents(sortedEvents);
        } catch (error) {
            console.error("Error cargando los eventos desde la BD:", error);
        } finally {
            setLoading(false); 
        }
    };

    const renderEventItem = ({ item }: { item: UniversityEvent }) => (
      <EventCard event={item} />
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.originalHeader}>
          {events.length === 0 && (
            <Image 
              source={{ uri: 'https://vectorseek.com/wp-content/uploads/2023/09/Universidad-de-Caldas-Logo-Vector.svg-.png' }}
              style={{ width: 100, height: 100, marginRight: 10 }}
            />
          )}
          <Text style={{ color: UCaldasTheme.azulOscuro, fontWeight: 'bold', fontSize: 24 }}>
            Universidad de Caldas
          </Text>
          <Text style={styles.subtitle}>
            Bienvenido a UniConnect, 
          </Text>
          <Text style={styles.userName}>{userName || 'Estudiante'}</Text>
        </View>

        {events.length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsTitle}>Eventos Universitarios</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color={UCaldasTheme.azulOscuro} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={events} 
                keyExtractor={(item) => item.id}
                renderItem={renderEventItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 40 },
  originalHeader: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a73e8' },
  userName: { fontSize: 20, color: '#333', marginVertical: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  eventsSection: { flex: 1 }, 
  eventsTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, alignSelf: 'flex-start' },
  listContent: { paddingBottom: 20 },
});