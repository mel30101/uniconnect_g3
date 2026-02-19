import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  
  const handleGoogleLogin = async () => {
    // 1. Obtenemos la URL de Expo Go (dinámica para la docente)
    const expoUrl = Linking.createURL('/'); 
    
    // 2. Tu URL de ngrok (asegúrate de que el backend esté corriendo)
    const backendUrl = "https://lauran-plucky-shanae.ngrok-free.dev/auth/google";

    try {
      // 3. Abrimos la sesión de autenticación
      const result = await WebBrowser.openAuthSessionAsync(
        `${backendUrl}?redirect=${encodeURIComponent(expoUrl)}`,
        expoUrl
      );

      // 4. Procesamos el regreso a la app
      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const queryParams = parsed.queryParams;

        if (queryParams && queryParams.name) {
          console.log("¡Éxito! Usuario:", queryParams.name);
          alert(`Bienvenido, ${queryParams.name}`);
        }
      }
    } catch (error) {
      console.error("Error en el login:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UniConnect G3</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleGoogleLogin}
      >
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4285F4', // Azul Google
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})