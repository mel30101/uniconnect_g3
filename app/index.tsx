import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router'; // Hook para la navegación en Expo Router
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UCaldasTheme } from './constants/Colors';
import { useAuth } from './context/AuthContext';

export default function LoginScreen() {
  const { setUser } = useAuth();
  const [authError, setAuthError] = useState(false);
  const router = useRouter(); // Inicializamos el router

  const handleGoogleLogin = async () => {
    const expoUrl = Linking.createURL('/'); 
    const backendUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/google`;

    try {
      // Abrimos la sesión de autenticación
      const result = await WebBrowser.openAuthSessionAsync(
        `${backendUrl}?redirect=${encodeURIComponent(expoUrl)}`,
        expoUrl
      );

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);

        // 1. Manejo de error de dominio institucional
        if (queryParams && queryParams.error === 'domain_not_allowed') {
          setAuthError(true);
        } 
        
        // 2. Manejo de éxito: Verificamos que lleguen los datos necesarios (uid y name)
        else if (queryParams && queryParams.uid) {
          setUser({ 
            uid: queryParams.uid as string, 
            name: queryParams.name as string 
          });
          router.replace("/(tabs)/home");
        }
      }
    } catch (error) {
      console.error("Error en el login:", error);
      Alert.alert("Error", "Ocurrió un problema al intentar conectar con el servidor.");
    }
  };

  // Interfaz para mostrar cuando el correo no es @ucaldas.edu.co
  if (authError) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: '#d32f2f' }]}>Acceso Denegado</Text>
        <Text style={styles.subtitle}>
          Debes usar obligatoriamente tu correo institucional de @ucaldas.edu.co para ingresar.
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: UCaldasTheme.azulOscuro }]} 
          onPress={() => setAuthError(false)}
        >
          <Text style={styles.buttonText}>Volver a intentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Interfaz principal de Login
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image 
        source={{ uri: 'https://vectorseek.com/wp-content/uploads/2023/09/Universidad-de-Caldas-Logo-Vector.svg-.png' }} 
        style={{ width: 250, height: 250, marginBottom: 10 }}
        resizeMode="contain"
      />
      <Text style={{ color: UCaldasTheme.azulOscuro, fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        UniConnect G3
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#1a73e8' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 30, 
    textAlign: 'center', 
    marginTop: 10 
  },
  button: { 
    backgroundColor: '#4285F4', 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 10,
    elevation: 3 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});