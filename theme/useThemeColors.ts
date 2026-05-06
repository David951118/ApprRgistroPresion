import { useColorScheme } from 'react-native';

import { darkPalette, lightPalette, type Palette } from '@/theme/colors';

/**
 * Hook que devuelve la paleta correspondiente al esquema de colores
 * activo del sistema operativo. Si el usuario tiene activado el modo
 * oscuro en iOS / Android, la app cambia automáticamente al `darkPalette`.
 */
export function useThemeColors(): Palette {
  const systemColorScheme = useColorScheme();
  return systemColorScheme === 'dark' ? darkPalette : lightPalette;
}
