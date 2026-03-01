import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { UCaldasTheme } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function WelcomeScreen() {
    const { user } = useAuth();
    const studentId = user?.uid; // <--- AQUÍ YA NO SERÁ UNDEFINED
    const userName = user?.name;

  return (
    <View style={styles.container}>

      <Image 
        source={{ uri: 'https://vectorseek.com/wp-content/uploads/2023/09/Universidad-de-Caldas-Logo-Vector.svg-.png' }}
        style={{ width: 100, height: 100, marginRight: 10 }}
      />
      <Text style={{ color: UCaldasTheme.azulOscuro, fontWeight: 'bold', fontSize: 24 }}>Universidad de Caldas</Text>
      <Text style={styles.userName}>{userName || 'Estudiante'}</Text>
      <Text style={styles.subtitle}>
        Explora las pestañas inferiores para configurar tu perfil o buscar compañeros.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a73e8' },
  userName: { fontSize: 20, color: '#333', marginVertical: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
});