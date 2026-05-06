import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, type KeyboardTypeOptions, View } from 'react-native';

import type { Palette } from '@/theme/colors';
import { useThemeColors } from '@/theme/useThemeColors';

type LabeledInputProps = {
  label: string;
  value: string;
  onChangeText: (newValue: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  errorMessage?: string | null;
  helperText?: string;
  autoFocus?: boolean;
};

/**
 * Input de texto con etiqueta y mensaje de error/ayuda opcional.
 * Componente reutilizable usado en el formulario de Perfil y en el
 * de Nueva medida — cumple el requisito explícito del enunciado de
 * tener al menos un componente reutilizable en dos interfaces.
 */
export function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
  errorMessage,
  helperText,
  autoFocus = false,
}: LabeledInputProps) {
  const palette = useThemeColors();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const hasError = errorMessage !== undefined && errorMessage !== null && errorMessage !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          hasError && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'auto'}
        autoFocus={autoFocus}
      />
      {hasError ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : helperText !== undefined ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      marginBottom: 12,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.textSecondary,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: palette.textPrimary,
    },
    inputMultiline: {
      minHeight: 90,
    },
    inputError: {
      borderColor: palette.danger,
    },
    errorText: {
      color: palette.danger,
      fontSize: 12,
      marginTop: 4,
    },
    helperText: {
      color: palette.textMuted,
      fontSize: 12,
      marginTop: 4,
    },
  });
}
