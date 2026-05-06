/**
 * Paleta de colores de la app, con variantes para modo claro y oscuro.
 *
 * El acento principal es un índigo vibrante; cada tipo de medida tiene
 * además su propio color (cian para glucosa, rosa para presión arterial)
 * para que se distingan a primera vista en cards y estadísticas.
 */

export type Palette = {
  scheme: 'light' | 'dark';

  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  primary: string;
  primaryPressed: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  primaryOn: string;          // texto sobre primary

  glucose: string;
  glucoseSoft: string;        // fondo suave coloreado
  glucoseOn: string;          // texto sobre glucoseSoft

  pressure: string;
  pressureSoft: string;
  pressureOn: string;

  danger: string;
  dangerSoft: string;
  dangerOn: string;

  success: string;
  shadow: string;
  overlay: string;
};

export const lightPalette: Palette = {
  scheme: 'light',

  background: '#f7f7fc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  border: '#e5e7eb',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',

  primary: '#6366f1',
  primaryPressed: '#4f46e5',
  primaryGradientStart: '#6366f1',
  primaryGradientEnd: '#a855f7',
  primaryOn: '#ffffff',

  glucose: '#0891b2',
  glucoseSoft: '#cffafe',
  glucoseOn: '#0e7490',

  pressure: '#e11d48',
  pressureSoft: '#ffe4e6',
  pressureOn: '#9f1239',

  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  dangerOn: '#991b1b',

  success: '#10b981',
  shadow: '#0f172a',
  overlay: 'rgba(15, 23, 42, 0.4)',
};

export const darkPalette: Palette = {
  scheme: 'dark',

  background: '#0b0b16',
  surface: '#181826',
  surfaceElevated: '#23233a',
  border: '#33334a',

  textPrimary: '#f3f4f6',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',

  primary: '#818cf8',
  primaryPressed: '#6366f1',
  primaryGradientStart: '#818cf8',
  primaryGradientEnd: '#c084fc',
  primaryOn: '#0b0b16',

  glucose: '#22d3ee',
  glucoseSoft: '#0e3b46',
  glucoseOn: '#67e8f9',

  pressure: '#fb7185',
  pressureSoft: '#3f1525',
  pressureOn: '#fda4af',

  danger: '#f87171',
  dangerSoft: '#3f1414',
  dangerOn: '#fca5a5',

  success: '#34d399',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.55)',
};
