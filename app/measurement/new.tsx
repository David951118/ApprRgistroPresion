import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LabeledInput } from '@/components/LabeledInput';
import { useMeasurements } from '@/hooks/useMeasurements';
import type { Palette } from '@/theme/colors';
import { useThemeColors } from '@/theme/useThemeColors';
import {
  measurementTypeLabels,
  measurementTypeOptions,
  type MeasurementType,
} from '@/types/health';

type FormState = {
  glucoseText: string;
  systolicText: string;
  diastolicText: string;
  pulseText: string;
  notes: string;
};

const emptyFormState: FormState = {
  glucoseText: '',
  systolicText: '',
  diastolicText: '',
  pulseText: '',
  notes: '',
};

/**
 * Pantalla de alta de una nueva medida. Vive en el Stack raíz (fuera
 * de las Tabs) y se abre como modal haciendo
 * `router.push('/measurement/new')`.
 *
 * Reutiliza `LabeledInput` (también usado en Perfil). Según el tipo
 * seleccionado se muestran campos distintos: glucosa pide un valor;
 * presión pide sistólica, diastólica y un pulso opcional.
 */
export default function NewMeasurementScreen() {
  const router = useRouter();
  const palette = useThemeColors();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { addGlucose, addPressure } = useMeasurements();
  const [selectedType, setSelectedType] = useState<MeasurementType>('glucose');
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleFieldChange =
    (fieldName: keyof FormState) =>
    (newValue: string): void => {
      setFormState((previousState) => ({ ...previousState, [fieldName]: newValue }));
    };

  const parseDecimal = (rawValue: string): number =>
    Number.parseFloat(rawValue.replace(',', '.'));

  /**
   * Valida y persiste la medida seleccionada en la DB. Si todo va bien
   * vuelve a la pantalla anterior; si hay errores los muestra inline.
   */
  const handleSave = async (): Promise<void> => {
    const takenAt = Date.now();
    setValidationMessage(null);

    try {
      setIsSaving(true);
      if (selectedType === 'glucose') {
        const glucoseValue = parseDecimal(formState.glucoseText);
        if (Number.isNaN(glucoseValue) || glucoseValue <= 0 || glucoseValue > 1000) {
          setValidationMessage('Introduce un valor válido de glucosa (mg/dL).');
          return;
        }
        await addGlucose({
          glucoseValue,
          notes: formState.notes.trim(),
          takenAt,
        });
      } else {
        const systolic = Number.parseInt(formState.systolicText, 10);
        const diastolic = Number.parseInt(formState.diastolicText, 10);
        if (Number.isNaN(systolic) || systolic <= 0 || systolic > 300) {
          setValidationMessage('Introduce una sistólica válida (mmHg).');
          return;
        }
        if (Number.isNaN(diastolic) || diastolic <= 0 || diastolic > 250) {
          setValidationMessage('Introduce una diastólica válida (mmHg).');
          return;
        }
        if (diastolic >= systolic) {
          setValidationMessage(
            'La sistólica debe ser mayor que la diastólica.',
          );
          return;
        }
        const pulseRaw = formState.pulseText.trim();
        let pulse: number | null = null;
        if (pulseRaw.length > 0) {
          const parsedPulse = Number.parseInt(pulseRaw, 10);
          if (Number.isNaN(parsedPulse) || parsedPulse <= 0 || parsedPulse > 250) {
            setValidationMessage('El pulso (bpm) no es válido.');
            return;
          }
          pulse = parsedPulse;
        }
        await addPressure({
          systolic,
          diastolic,
          pulse,
          notes: formState.notes.trim(),
          takenAt,
        });
      }
      router.back();
    } catch (error) {
      Alert.alert(
        'No se pudo guardar',
        error instanceof Error ? error.message : 'Error desconocido',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Resuelve el color de acento del tipo activo para colorear el botón
  // y el chip seleccionado.
  const accentColor =
    selectedType === 'glucose' ? palette.glucose : palette.pressure;
  const accentSoft =
    selectedType === 'glucose' ? palette.glucoseSoft : palette.pressureSoft;
  const accentOn =
    selectedType === 'glucose' ? palette.glucoseOn : palette.pressureOn;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Tipo de medida</Text>
        <View style={styles.typeRow}>
          {measurementTypeOptions.map((typeOption) => {
            const isSelected = typeOption === selectedType;
            const optionAccent =
              typeOption === 'glucose' ? palette.glucose : palette.pressure;
            const optionSoft =
              typeOption === 'glucose' ? palette.glucoseSoft : palette.pressureSoft;
            const optionOn =
              typeOption === 'glucose' ? palette.glucoseOn : palette.pressureOn;
            return (
              <Pressable
                key={typeOption}
                style={[
                  styles.typeChip,
                  isSelected && {
                    backgroundColor: optionSoft,
                    borderColor: optionAccent,
                  },
                ]}
                onPress={() => {
                  setSelectedType(typeOption);
                  setValidationMessage(null);
                }}
              >
                <Ionicons
                  name={typeOption === 'glucose' ? 'water' : 'heart'}
                  size={18}
                  color={isSelected ? optionOn : palette.textMuted}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    isSelected && { color: optionOn, fontWeight: '700' },
                  ]}
                >
                  {measurementTypeLabels[typeOption]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.fieldsBlock,
            { borderColor: accentSoft, backgroundColor: palette.surface },
          ]}
        >
          {selectedType === 'glucose' ? (
            <LabeledInput
              label="Valor de glucosa"
              value={formState.glucoseText}
              onChangeText={handleFieldChange('glucoseText')}
              placeholder="Ej: 105"
              keyboardType="decimal-pad"
              helperText="Introduce el valor en mg/dL"
            />
          ) : (
            <>
              <LabeledInput
                label="Sistólica (alta)"
                value={formState.systolicText}
                onChangeText={handleFieldChange('systolicText')}
                placeholder="Ej: 120"
                keyboardType="number-pad"
                helperText="mmHg"
              />
              <LabeledInput
                label="Diastólica (baja)"
                value={formState.diastolicText}
                onChangeText={handleFieldChange('diastolicText')}
                placeholder="Ej: 80"
                keyboardType="number-pad"
                helperText="mmHg"
              />
              <LabeledInput
                label="Pulso (opcional)"
                value={formState.pulseText}
                onChangeText={handleFieldChange('pulseText')}
                placeholder="Ej: 72"
                keyboardType="number-pad"
                helperText="bpm — déjalo vacío si no lo mediste"
              />
            </>
          )}

          <LabeledInput
            label="Notas (opcional)"
            value={formState.notes}
            onChangeText={handleFieldChange('notes')}
            placeholder="Antes/después de comer, en reposo, ..."
            multiline
          />
        </View>

        {validationMessage !== null && (
          <Text style={styles.errorText}>{validationMessage}</Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.saveButtonWrapper,
            (pressed || isSaving) && styles.saveButtonPressed,
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <LinearGradient
            colors={[palette.primaryGradientStart, palette.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButton}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={palette.primaryOn}
            />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Guardando...' : 'Guardar medida'}
            </Text>
          </LinearGradient>
        </Pressable>

        <Text style={[styles.tipText, { color: accentColor }]}>
          {selectedType === 'glucose'
            ? '💧 Recomendado: medir 2h después de comer.'
            : '❤️ Recomendado: en reposo y sentado.'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(palette: Palette) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 48,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    typeRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    typeChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: palette.border,
      backgroundColor: palette.surface,
    },
    typeChipText: {
      color: palette.textSecondary,
      fontWeight: '500',
      fontSize: 13,
      textAlign: 'center',
    },
    fieldsBlock: {
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
    },
    errorText: {
      color: palette.danger,
      fontSize: 13,
      marginTop: 12,
    },
    saveButtonWrapper: {
      marginTop: 22,
      borderRadius: 14,
      shadowColor: palette.primary,
      shadowOpacity: palette.scheme === 'dark' ? 0.55 : 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 14,
    },
    saveButtonPressed: {
      opacity: 0.9,
    },
    saveButtonText: {
      color: palette.primaryOn,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.3,
    },
    tipText: {
      marginTop: 14,
      fontSize: 13,
      textAlign: 'center',
      fontWeight: '500',
    },
  });
}
