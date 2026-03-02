import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        
        {/* 1. Pasamos el texto primero para que quede a la izquierda */}
        <ThemedText type="defaultSemiBold" style={{ color: '#111827' }}>
            {title}
        </ThemedText>

        {/* 2. Dejamos el ícono de segundo para que quede a la derecha */}
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color="#374151" 
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // <--- CLAVE: Esto empuja el texto a la izq. y la flecha a la der.
    paddingVertical: 12, // <--- Le di un poco más de área para que sea más fácil tocarlo con el dedo
    paddingHorizontal: 8, // <--- Un ligero padding lateral
    borderBottomWidth: 1, // <--- Opcional: una línea sutil separadora
    borderBottomColor: '#e5e7eb', // <--- Opcional: color de la línea
  },
  content: {
    marginTop: 6,
    paddingHorizontal: 8, // Alineamos el contenido con el título
  },
});