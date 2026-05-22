import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  deleteMeasurement,
  initDatabase,
  insertGlucose,
  insertPressure,
  selectAllMeasurements,
} from '@/db/database';
import type {
  GlucoseInput,
  GlucoseMeasurement,
  GlucoseStats,
  HealthStats,
  Measurement,
  PressureInput,
  PressureMeasurement,
  PressureStats,
} from '@/types/health';

type UseMeasurementsResult = {
  measurements: Measurement[];
  stats: HealthStats;
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  addGlucose: (glucoseInput: GlucoseInput) => Promise<void>;
  addPressure: (pressureInput: PressureInput) => Promise<void>;
  removeMeasurement: (measurementId: number) => Promise<void>;
};

/**
 * Calcula la media de un array de números, redondeada a un decimal.
 * Devuelve null si el array está vacío para no propagar NaN a la UI.
 */
function meanOf(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const total = values.reduce((accumulator, value) => accumulator + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

function minOf(values: number[]): number | null {
  return values.length === 0 ? null : Math.min(...values);
}

function maxOf(values: number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

/**
 * Estadísticas de glucosa en mg/dL: media/min/max y la última lectura.
 */
function computeGlucoseStats(measurements: Measurement[]): GlucoseStats {
  const glucoseMeasurements = measurements.filter(
    (measurement): measurement is GlucoseMeasurement => measurement.type === 'glucose',
  );
  const values = glucoseMeasurements.map((measurement) => measurement.glucoseValue);
  return {
    count: glucoseMeasurements.length,
    mean: meanOf(values),
    min: minOf(values),
    max: maxOf(values),
    last: glucoseMeasurements[0] ?? null,
  };
}

/**
 * Estadísticas de presión arterial: medias y extremos por sistólica y
 * diastólica de forma independiente.
 */
function computePressureStats(measurements: Measurement[]): PressureStats {
  const pressureMeasurements = measurements.filter(
    (measurement): measurement is PressureMeasurement => measurement.type === 'pressure',
  );
  const systolicValues = pressureMeasurements.map((measurement) => measurement.systolic);
  const diastolicValues = pressureMeasurements.map(
    (measurement) => measurement.diastolic,
  );
  return {
    count: pressureMeasurements.length,
    meanSystolic: meanOf(systolicValues),
    meanDiastolic: meanOf(diastolicValues),
    minSystolic: minOf(systolicValues),
    maxSystolic: maxOf(systolicValues),
    minDiastolic: minOf(diastolicValues),
    maxDiastolic: maxOf(diastolicValues),
    last: pressureMeasurements[0] ?? null,
  };
}

/**
 * Hook personalizado que centraliza la gestión de las medidas de salud:
 * lista, alta, borrado y cómputo de estadísticas en memoria.
 *
 * Las stats se calculan en el cliente (no en SQL) para mantener la capa
 * de DB simple y porque el volumen de datos esperado (decenas o cientos
 * de filas) es perfectamente manejable así.
 */
export function useMeasurements(): UseMeasurementsResult {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const allMeasurements = await selectAllMeasurements();
      setMeasurements(allMeasurements);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error desconocido al leer las medidas',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        try {
          await initDatabase();
          if (isMounted) {
            await refresh();
          }
        } catch (error) {
          if (isMounted) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : 'No se pudo inicializar la base de datos',
            );
            setIsLoading(false);
          }
        }
      })();
      return () => {
        isMounted = false;
      };
    }, [refresh])
  );

  const addGlucose = useCallback(
    async (glucoseInput: GlucoseInput): Promise<void> => {
      await insertGlucose(glucoseInput);
      await refresh();
    },
    [refresh],
  );

  const addPressure = useCallback(
    async (pressureInput: PressureInput): Promise<void> => {
      await insertPressure(pressureInput);
      await refresh();
    },
    [refresh],
  );

  const removeMeasurement = useCallback(
    async (measurementId: number): Promise<void> => {
      await deleteMeasurement(measurementId);
      await refresh();
    },
    [refresh],
  );

  const stats = useMemo<HealthStats>(
    () => ({
      glucose: computeGlucoseStats(measurements),
      pressure: computePressureStats(measurements),
    }),
    [measurements],
  );

  return {
    measurements,
    stats,
    isLoading,
    errorMessage,
    refresh,
    addGlucose,
    addPressure,
    removeMeasurement,
  };
}
