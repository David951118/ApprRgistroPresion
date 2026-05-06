import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Palette } from '@/theme/colors';
import { useThemeColors } from '@/theme/useThemeColors';
import type { Measurement } from '@/types/health';

type MeasurementCardProps = {
  measurement: Measurement;
  onDelete?: (measurementId: number) => void;
  compact?: boolean;
};

/**
 * Devuelve la fecha epoch como `DD/MM HH:mm` en horario local.
 */
function formatTakenAt(takenAtMs: number): string {
  const date = new Date(takenAtMs);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month} · ${hours}:${minutes}`;
}

/**
 * Card visual de una medida de salud. Cada tipo (glucosa / presión)
 * usa su propio color de acento para distinguirse a primera vista.
 *
 * Componente reutilizable usado en la pantalla Inicio (medidas
 * recientes) y en Resumen (tabla últimas N).
 */
export function MeasurementCard({
  measurement,
  onDelete,
  compact = false,
}: MeasurementCardProps) {
  const palette = useThemeColors();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const accentColor =
    measurement.type === 'glucose' ? palette.glucose : palette.pressure;
  const softBackground =
    measurement.type === 'glucose' ? palette.glucoseSoft : palette.pressureSoft;
  const onSoftColor =
    measurement.type === 'glucose' ? palette.glucoseOn : palette.pressureOn;
  const iconName: keyof typeof Ionicons.glyphMap =
    measurement.type === 'glucose' ? 'water' : 'heart';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View
            style={[styles.typePill, { backgroundColor: softBackground }]}
          >
            <Ionicons name={iconName} size={12} color={onSoftColor} />
            <Text style={[styles.typePillText, { color: onSoftColor }]}>
              {measurement.type === 'glucose' ? 'Glucosa' : 'Presión'}
            </Text>
          </View>
          <Text style={styles.takenAt}>{formatTakenAt(measurement.takenAt)}</Text>
        </View>

        {measurement.type === 'glucose' ? (
          <View style={styles.valueRow}>
            <Text style={[styles.bigValue, { color: accentColor }]}>
              {measurement.glucoseValue}
            </Text>
            <Text style={styles.unit}>mg/dL</Text>
          </View>
        ) : (
          <View style={styles.valueRow}>
            <Text style={[styles.bigValue, { color: accentColor }]}>
              {measurement.systolic}
              <Text style={styles.bigSeparator}>/</Text>
              {measurement.diastolic}
            </Text>
            <Text style={styles.unit}>mmHg</Text>
            {measurement.pulse !== null && (
              <Text style={styles.pulseText}>· {measurement.pulse} bpm</Text>
            )}
          </View>
        )}

        {measurement.notes !== '' && !compact && (
          <Text style={styles.notes} numberOfLines={2}>
            {measurement.notes}
          </Text>
        )}

        {onDelete !== undefined && (
          <Pressable
            accessibilityLabel="Borrar medida"
            hitSlop={8}
            onPress={() => onDelete(measurement.id)}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
          >
            <Ionicons name="trash-outline" size={14} color={palette.dangerOn} />
            <Text style={styles.deleteButtonText}>Borrar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    card: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      marginVertical: 6,
      marginHorizontal: 12,
      flexDirection: 'row',
      overflow: 'hidden',
      shadowColor: palette.shadow,
      shadowOpacity: palette.scheme === 'dark' ? 0.35 : 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    cardCompact: {
      marginVertical: 4,
    },
    accentStripe: {
      width: 5,
    },
    body: {
      flex: 1,
      padding: 14,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    typePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    typePillText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    takenAt: {
      fontSize: 12,
      color: palette.textMuted,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: 8,
    },
    bigValue: {
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    bigSeparator: {
      color: palette.textMuted,
      fontWeight: '600',
    },
    unit: {
      fontSize: 14,
      color: palette.textSecondary,
      marginLeft: 6,
      fontWeight: '500',
    },
    pulseText: {
      fontSize: 13,
      color: palette.textMuted,
      marginLeft: 8,
    },
    notes: {
      fontSize: 13,
      color: palette.textSecondary,
      marginTop: 8,
    },
    deleteButton: {
      alignSelf: 'flex-end',
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: palette.dangerSoft,
    },
    deleteButtonPressed: {
      opacity: 0.6,
    },
    deleteButtonText: {
      color: palette.dangerOn,
      fontWeight: '600',
      fontSize: 12,
    },
  });
}
