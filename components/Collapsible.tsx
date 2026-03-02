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
        
        <ThemedText type="defaultSemiBold" style={{ color: '#111827' }}>
            {title}
        </ThemedText>

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
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    paddingHorizontal: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb', 
  },
  content: {
    marginTop: 6,
    paddingHorizontal: 8, 
  },
});