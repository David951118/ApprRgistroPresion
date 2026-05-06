import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeasurementCard } from '@/components/MeasurementCard';
import { StatTile } from '@/components/StatTile';
import { useMeasurements } from '@/hooks/useMeasurements';
import type { Palette } from '@/theme/colors';
import { useThemeColors } from '@/theme/useThemeColors';

const TABLE_LIMIT = 10;

/**
 * Renderiza un número con un decimal cuando aplica; si es null
 * (todavía no hay datos), muestra un guion para no romper el layout.
 */
function formatNumber(value: number | null): string {
  if (value === null) {
    return '—';
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/**
 * Pantalla de resumen: bloque de stats por tipo de medida y tabla con
 * las últimas N lecturas (mezcladas glucosa y presión, ordenadas por
 * fecha descendente).
 */
export default function SummaryScreen() {
  const palette = useThemeColors();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { measurements, stats, isLoading, errorMessage, refresh } = useMeasurements();

  const lastMeasurements = measurements.slice(0, TABLE_LIMIT);

  if (isLoading && measurements.length === 0) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator size="large" color={palette.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={palette.primary}
          />
        }
      >
        {errorMessage !== null && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <View style={styles.blockHeader}>
          <Ionicons name="water" size={18} color={palette.glucose} />
          <Text style={styles.blockTitle}>Glucosa en sangre</Text>
        </View>
        <View style={styles.tilesRow}>
          <StatTile
            label="Lecturas"
            value={String(stats.glucose.count)}
            accentColor={palette.glucose}
          />
          <StatTile
            label="Media"
            value={formatNumber(stats.glucose.mean)}
            unit="mg/dL"
            accentColor={palette.glucose}
          />
        </View>
        <View style={styles.tilesRow}>
          <StatTile
            label="Mínima"
            value={formatNumber(stats.glucose.min)}
            unit="mg/dL"
            accentColor={palette.glucose}
          />
          <StatTile
            label="Máxima"
            value={formatNumber(stats.glucose.max)}
            unit="mg/dL"
            accentColor={palette.glucose}
          />
        </View>

        <View style={styles.blockHeader}>
          <Ionicons name="heart" size={18} color={palette.pressure} />
          <Text style={styles.blockTitle}>Presión arterial</Text>
        </View>
        <View style={styles.tilesRow}>
          <StatTile
            label="Lecturas"
            value={String(stats.pressure.count)}
            accentColor={palette.pressure}
          />
          <StatTile
            label="Media"
            value={
              stats.pressure.meanSystolic !== null && stats.pressure.meanDiastolic !== null
                ? `${formatNumber(stats.pressure.meanSystolic)}/${formatNumber(stats.pressure.meanDiastolic)}`
                : '—'
            }
            unit="mmHg"
            accentColor={palette.pressure}
          />
        </View>
        <View style={styles.tilesRow}>
          <StatTile
            label="Sistólica mín/máx"
            value={
              stats.pressure.minSystolic !== null && stats.pressure.maxSystolic !== null
                ? `${stats.pressure.minSystolic}–${stats.pressure.maxSystolic}`
                : '—'
            }
            unit="mmHg"
            accentColor={palette.pressure}
          />
          <StatTile
            label="Diastólica mín/máx"
            value={
              stats.pressure.minDiastolic !== null && stats.pressure.maxDiastolic !== null
                ? `${stats.pressure.minDiastolic}–${stats.pressure.maxDiastolic}`
                : '—'
            }
            unit="mmHg"
            accentColor={palette.pressure}
          />
        </View>

        <View style={styles.blockHeader}>
          <Ionicons name="time-outline" size={18} color={palette.primary} />
          <Text style={styles.blockTitle}>Últimas lecturas</Text>
        </View>
        {lastMeasurements.length === 0 ? (
          <Text style={styles.emptyText}>
            Todavía no hay medidas. Añade alguna desde la pestaña Inicio.
          </Text>
        ) : (
          lastMeasurements.map((measurement) => (
            <MeasurementCard
              key={measurement.id}
              measurement={measurement}
              compact
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: palette.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
    },
    scrollContent: {
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    blockHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 18,
      marginBottom: 6,
      paddingHorizontal: 8,
    },
    blockTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: palette.textPrimary,
      letterSpacing: -0.3,
    },
    tilesRow: {
      flexDirection: 'row',
    },
    emptyText: {
      color: palette.textMuted,
      fontSize: 13,
      paddingHorizontal: 12,
      paddingTop: 4,
    },
    errorText: {
      color: palette.danger,
      fontSize: 13,
      paddingHorizontal: 12,
      marginBottom: 8,
    },
  });
}
