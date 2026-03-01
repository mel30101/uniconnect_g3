import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    // Usamos un View normal con fondo transparente
    <View style={{ backgroundColor: 'transparent' }}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          // Forzamos a que la flechita sea oscura para que contraste con tu tarjeta blanca
          color="#374151" 
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        {/* Forzamos el color del texto a oscuro */}
        <ThemedText type="defaultSemiBold" style={{ color: '#111827' }}>
            {title}
        </ThemedText>
      </TouchableOpacity>
      
      {/* Usamos un View normal para el contenido */}
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8, 
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});