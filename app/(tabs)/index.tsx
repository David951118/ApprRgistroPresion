import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeasurementCard } from '@/components/MeasurementCard';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useProfile } from '@/hooks/useProfile';
import type { Palette } from '@/theme/colors';
import { useThemeColors } from '@/theme/useThemeColors';
import type { Measurement } from '@/types/health';

const RECENT_LIMIT = 5;

/**
 * Pantalla principal: saluda al usuario, explica el propósito de la
 * app y muestra las últimas medidas registradas con un botón
 * destacado para añadir una nueva. La acción "Añadir medida" abre
 * la pantalla `measurement/new` del Stack raíz como modal.
 */
export default function HomeScreen() {
  const router = useRouter();
  const palette = useThemeColors();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { profile } = useProfile();
  const { measurements, isLoading, errorMessage, refresh, removeMeasurement } =
    useMeasurements();

  const recentMeasurements = measurements.slice(0, RECENT_LIMIT);

  const handleAddMeasurement = useCallback(() => {
    router.push('/measurement/new');
  }, [router]);

  const confirmAndDelete = useCallback(
    (measurementId: number) => {
      Alert.alert('Borrar medida', '¿Seguro que quieres borrar esta medida?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => {
            void removeMeasurement(measurementId);
          },
        },
      ]);
    },
    [removeMeasurement],
  );

  const renderMeasurement = useCallback(
    ({ item }: { item: Measurement }) => (
      <MeasurementCard measurement={item} onDelete={confirmAndDelete} />
    ),
    [confirmAndDelete],
  );

  if (isLoading && measurements.length === 0 && profile === null) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator size="large" color={palette.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom']}>
      <FlatList
        data={recentMeasurements}
        keyExtractor={(measurement) => String(measurement.id)}
        renderItem={renderMeasurement}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={palette.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <LinearGradient
              colors={[palette.primaryGradientStart, palette.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Text style={styles.heroEyebrow}>HOLA</Text>
              <Text style={styles.heroTitle}>
                {profile !== null ? profile.name : 'Completa tu perfil'}
              </Text>
              <Text style={styles.heroSubtitle}>
                Registra aquí tu <Text style={styles.heroSubtitleBold}>azúcar en sangre</Text>{' '}
                y tu <Text style={styles.heroSubtitleBold}>presión arterial</Text>. En la
                pestaña Resumen verás estadísticas y tus últimos días.
              </Text>
            </LinearGradient>

            {errorMessage !== null && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Últimas medidas</Text>
              {recentMeasurements.length > 0 && (
                <Text style={styles.sectionHint}>
                  {recentMeasurements.length} más recientes
                </Text>
              )}
            </View>

            {recentMeasurements.length === 0 && (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="pulse-outline"
                  size={40}
                  color={palette.primary}
                />
                <Text style={styles.emptyTitle}>Aún no hay medidas</Text>
                <Text style={styles.emptyText}>
                  Pulsa el botón de abajo para registrar la primera lectura.
                </Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />

      <Pressable
        accessibilityLabel="Añadir nueva medida"
        style={({ pressed }) => [styles.fabWrapper, pressed && styles.fabPressed]}
        onPress={handleAddMeasurement}
      >
        <LinearGradient
          colors={[palette.primaryGradientStart, palette.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add-circle" size={22} color={palette.primaryOn} />
          <Text style={styles.fabText}>Añadir medida</Text>
        </LinearGradient>
      </Pressable>
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
    listContent: {
      paddingVertical: 8,
    },
    headerWrapper: {
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    heroCard: {
      borderRadius: 20,
      padding: 22,
      shadowColor: palette.primary,
      shadowOpacity: palette.scheme === 'dark' ? 0.5 : 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    heroEyebrow: {
      color: palette.primaryOn,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.5,
      opacity: 0.85,
    },
    heroTitle: {
      color: palette.primaryOn,
      fontSize: 28,
      fontWeight: '800',
      marginTop: 4,
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      color: palette.primaryOn,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 12,
      opacity: 0.92,
    },
    heroSubtitleBold: {
      fontWeight: '700',
    },
    sectionTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 22,
      marginBottom: 4,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.textPrimary,
      letterSpacing: -0.3,
    },
    sectionHint: {
      fontSize: 12,
      color: palette.textMuted,
    },
    emptyCard: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      paddingVertical: 28,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: palette.scheme === 'dark' ? 1 : 0,
      borderColor: palette.border,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.textPrimary,
      marginTop: 10,
    },
    emptyText: {
      color: palette.textSecondary,
      fontSize: 13,
      marginTop: 6,
      textAlign: 'center',
    },
    errorText: {
      color: palette.danger,
      fontSize: 13,
      marginTop: 12,
      paddingHorizontal: 4,
    },
    footerSpacer: {
      height: 100,
    },
    fabWrapper: {
      position: 'absolute',
      bottom: 16,
      left: 24,
      right: 24,
      borderRadius: 28,
      shadowColor: palette.primary,
      shadowOpacity: palette.scheme === 'dark' ? 0.6 : 0.4,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    fab: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 28,
      gap: 8,
    },
    fabPressed: {
      opacity: 0.9,
    },
    fabText: {
      color: palette.primaryOn,
      fontWeight: '700',
      fontSize: 15,
      letterSpacing: 0.3,
    },
  });
}
