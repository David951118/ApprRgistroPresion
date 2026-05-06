import * as SQLite from 'expo-sqlite';

import type {
  GlucoseInput,
  Measurement,
  PressureInput,
  Profile,
  ProfileInput,
} from '@/types/health';

const DATABASE_NAME = 'health.db';

/**
 * Conexión perezosa a la DB: se abre la primera vez que se necesita
 * para no bloquear el arranque de la app.
 */
let databaseInstance: SQLite.SQLiteDatabase | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInstance === null) {
    databaseInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return databaseInstance;
}

/**
 * Crea las tablas `profile` y `measurements` si todavía no existen.
 * Se llama una vez al arrancar (lo invocan los hooks `useProfile` y
 * `useMeasurements`). Es idempotente.
 */
export async function initDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS profile (
      id        INTEGER PRIMARY KEY CHECK (id = 1),
      name      TEXT    NOT NULL,
      age       INTEGER NOT NULL,
      weightKg  REAL    NOT NULL,
      heightCm  REAL    NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS measurements (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      type          TEXT    NOT NULL CHECK (type IN ('glucose','pressure')),
      glucoseValue  REAL,
      systolic      INTEGER,
      diastolic     INTEGER,
      pulse         INTEGER,
      notes         TEXT    NOT NULL DEFAULT '',
      takenAt       INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_measurements_takenAt ON measurements (takenAt DESC);
  `);
}

// ---------- Perfil ----------

/**
 * Devuelve el perfil único o null si todavía no se ha registrado.
 */
export async function selectProfile(): Promise<Profile | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Profile>(
    'SELECT * FROM profile WHERE id = 1',
  );
  return row ?? null;
}

/**
 * Inserta o actualiza el perfil único. SQLite trata el `id = 1` con
 * `INSERT OR REPLACE` para que la pantalla pueda usar el mismo método
 * tanto para registro inicial como para edición.
 */
export async function upsertProfile(profileInput: ProfileInput): Promise<void> {
  const database = await getDatabase();
  const updatedAt = Date.now();
  await database.runAsync(
    `INSERT OR REPLACE INTO profile (id, name, age, weightKg, heightCm, updatedAt)
     VALUES (1, ?, ?, ?, ?, ?)`,
    [
      profileInput.name,
      profileInput.age,
      profileInput.weightKg,
      profileInput.heightCm,
      updatedAt,
    ],
  );
}

// ---------- Medidas ----------

/**
 * Fila plana tal y como la devuelve SQLite. Tiene todas las columnas
 * porque es una tabla compartida por glucosa y presión.
 */
type MeasurementRow = {
  id: number;
  type: 'glucose' | 'pressure';
  glucoseValue: number | null;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  notes: string;
  takenAt: number;
};

/**
 * Convierte una fila plana en el tipo discriminado `Measurement`.
 * Aísla del resto de la app la peculiaridad de tener columnas nulables
 * para los campos que solo aplican a un tipo concreto.
 */
function mapRowToMeasurement(row: MeasurementRow): Measurement {
  if (row.type === 'glucose') {
    return {
      id: row.id,
      type: 'glucose',
      glucoseValue: row.glucoseValue ?? 0,
      notes: row.notes,
      takenAt: row.takenAt,
    };
  }
  return {
    id: row.id,
    type: 'pressure',
    systolic: row.systolic ?? 0,
    diastolic: row.diastolic ?? 0,
    pulse: row.pulse,
    notes: row.notes,
    takenAt: row.takenAt,
  };
}

/**
 * Devuelve todas las medidas, de la más reciente a la más antigua.
 */
export async function selectAllMeasurements(): Promise<Measurement[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<MeasurementRow>(
    'SELECT * FROM measurements ORDER BY takenAt DESC',
  );
  return rows.map(mapRowToMeasurement);
}

/**
 * Inserta una medida de glucosa.
 */
export async function insertGlucose(glucoseInput: GlucoseInput): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO measurements
       (type, glucoseValue, systolic, diastolic, pulse, notes, takenAt)
     VALUES ('glucose', ?, NULL, NULL, NULL, ?, ?)`,
    [glucoseInput.glucoseValue, glucoseInput.notes, glucoseInput.takenAt],
  );
  return result.lastInsertRowId;
}

/**
 * Inserta una medida de presión arterial. `pulse` es opcional.
 */
export async function insertPressure(pressureInput: PressureInput): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO measurements
       (type, glucoseValue, systolic, diastolic, pulse, notes, takenAt)
     VALUES ('pressure', NULL, ?, ?, ?, ?, ?)`,
    [
      pressureInput.systolic,
      pressureInput.diastolic,
      pressureInput.pulse,
      pressureInput.notes,
      pressureInput.takenAt,
    ],
  );
  return result.lastInsertRowId;
}

/**
 * Borra una medida por id. No-op si no existe.
 */
export async function deleteMeasurement(measurementId: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM measurements WHERE id = ?', [
    measurementId,
  ]);
}
