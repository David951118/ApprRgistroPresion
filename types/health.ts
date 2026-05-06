/**
 * Tipos de dominio de la app de seguimiento de salud personal.
 * Se mantienen aislados del esquema SQLite para que las pantallas y los
 * componentes no dependan directamente de la capa de persistencia.
 */

export type MeasurementType = 'glucose' | 'pressure';

export const measurementTypeOptions: readonly MeasurementType[] = [
  'glucose',
  'pressure',
] as const;

export const measurementTypeLabels: Record<MeasurementType, string> = {
  glucose: 'Glucosa en sangre',
  pressure: 'Presión arterial',
};

/**
 * Perfil del usuario. Solo existe una fila en la tabla, identificada por id = 1.
 */
export type Profile = {
  id: 1;
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  updatedAt: number;
};

/** Datos que llegan desde el formulario de Perfil. */
export type ProfileInput = Omit<Profile, 'id' | 'updatedAt'>;

export type GlucoseMeasurement = {
  id: number;
  type: 'glucose';
  glucoseValue: number;        // mg/dL
  notes: string;
  takenAt: number;             // epoch ms
};

export type PressureMeasurement = {
  id: number;
  type: 'pressure';
  systolic: number;            // mmHg
  diastolic: number;           // mmHg
  pulse: number | null;        // bpm — opcional
  notes: string;
  takenAt: number;
};

/**
 * Unión discriminada por `type`. Permite a TypeScript saber qué campos
 * están disponibles según el tipo concreto de la medida.
 */
export type Measurement = GlucoseMeasurement | PressureMeasurement;

/** Datos de entrada para crear una nueva medida de glucosa. */
export type GlucoseInput = {
  glucoseValue: number;
  notes: string;
  takenAt: number;
};

/** Datos de entrada para crear una nueva medida de presión arterial. */
export type PressureInput = {
  systolic: number;
  diastolic: number;
  pulse: number | null;
  notes: string;
  takenAt: number;
};

export type GlucoseStats = {
  count: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  last: GlucoseMeasurement | null;
};

export type PressureStats = {
  count: number;
  meanSystolic: number | null;
  meanDiastolic: number | null;
  minSystolic: number | null;
  maxSystolic: number | null;
  minDiastolic: number | null;
  maxDiastolic: number | null;
  last: PressureMeasurement | null;
};

export type HealthStats = {
  glucose: GlucoseStats;
  pressure: PressureStats;
};
