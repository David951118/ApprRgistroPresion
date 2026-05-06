import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useThemeColors } from '@/theme/useThemeColors';

/**
 * Layout de Tabs con tres pestañas (Inicio / Resumen / Perfil).
 * Usa la paleta del tema actual para que tabs y headers cambien con
 * el modo claro/oscuro del sistema.
 */
export default function TabLayout() {
  const palette = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        headerStyle: { backgroundColor: palette.primary },
        headerTintColor: palette.primaryOn,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Resumen',
          tabBarLabel: 'Resumen',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
