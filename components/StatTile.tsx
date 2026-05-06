import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Palette } from '@/theme/colors';
import { useThemeColors } from '@/theme/useThemeColors';

type StatTileProps = {
  label: string;
  value: string;
  unit?: string;
  /**
   * Color de acento del tile. Si se proporciona, se aplica al valor y a
   * la franja superior (típicamente glucose o pressure de la paleta).
   */
  accentColor?: string;
};

/**
 * Bloque visual con etiqueta y valor grande. Se usa en la pantalla
 * Resumen para mostrar las estadísticas (count, media, mínimo, máximo).
 */
export function StatTile({ label, value, unit, accentColor }: StatTileProps) {
  const palette = useThemeColors();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const valueColor = accentColor ?? palette.textPrimary;

  return (
    <View style={styles.tile}>
      {accentColor !== undefined && (
        <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
      )}
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {unit !== undefined && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    tile: {
      flex: 1,
      minWidth: 120,
      backgroundColor: palette.surface,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 14,
      margin: 4,
      shadowColor: palette.shadow,
      shadowOpacity: palette.scheme === 'dark' ? 0.3 : 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: palette.scheme === 'dark' ? 1 : 0,
      borderColor: palette.border,
    },
    accentDot: {
      width: 24,
      height: 4,
      borderRadius: 2,
      marginBottom: 8,
    },
    label: {
      fontSize: 11,
      color: palette.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      fontWeight: '600',
      marginBottom: 4,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    value: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    unit: {
      fontSize: 12,
      color: palette.textMuted,
      marginLeft: 4,
      fontWeight: '500',
    },
  });
}
