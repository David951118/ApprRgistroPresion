import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useThemeColors } from '@/theme/useThemeColors';

/**
 * Layout raíz de la app: Stack que contiene las Tabs y la pantalla
 * `measurement/new` (modal). Lee la paleta del tema actual para que
 * el header se adapte a modo claro / oscuro.
 */
export default function RootLayout() {
  const palette = useThemeColors();

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.primary },
          headerTintColor: palette.primaryOn,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="measurement/new"
          options={{ title: 'Nueva medida', presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style={palette.scheme === 'dark' ? 'light' : 'light'} />
    </>
  );
}
