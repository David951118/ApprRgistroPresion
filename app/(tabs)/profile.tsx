import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LabeledInput } from '@/components/LabeledInput';
import { useProfile } from '@/hooks/useProfile';
import type { Palette } from '@/theme/colors';
import { useThemeColors } from '@/theme/useThemeColors';
import type { ProfileInput } from '@/types/health';

type FormState = {
  name: string;
  ageText: string;
  weightText: string;
  heightText: string;
};

const emptyFormState: FormState = {
  name: '',
  ageText: '',
  weightText: '',
  heightText: '',
};

/**
 * Pantalla de Perfil: la primera vez actúa como registro inicial,
 * después como pantalla de edición. El texto del título y del botón
 * cambian según exista o no perfil. Reutiliza `LabeledInput` (mismo
 * componente que usa la pantalla de Nueva medida).
 */
export default function ProfileScreen() {
  const palette = useThemeColors();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { profile, isLoading, errorMessage, saveProfile } = useProfile();
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Cuando se carga el perfil desde la DB, prellena el formulario.
  useEffect(() => {
    if (profile !== null) {
      setFormState({
        name: profile.name,
        ageText: String(profile.age),
        weightText: String(profile.weightKg),
        heightText: String(profile.heightCm),
      });
    }
  }, [profile]);

  const isFirstTime = profile === null;

  const handleFieldChange = (fieldName: keyof FormState) => (newValue: string) => {
    setFormState((previousState) => ({ ...previousState, [fieldName]: newValue }));
  };

  /**
   * Valida los datos del formulario. Devuelve el `ProfileInput` listo
   * para guardar o `null` si hay algún error de entrada.
   */
  const validateAndBuildInput = (): ProfileInput | null => {
    const trimmedName = formState.name.trim();
    const parsedAge = Number.parseInt(formState.ageText, 10);
    const parsedWeight = Number.parseFloat(formState.weightText.replace(',', '.'));
    const parsedHeight = Number.parseFloat(formState.heightText.replace(',', '.'));

    if (trimmedName.length === 0) {
      setValidationMessage('El nombre es obligatorio.');
      return null;
    }
    if (Number.isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 130) {
      setValidationMessage('Introduce una edad válida.');
      return null;
    }
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 400) {
      setValidationMessage('Introduce un peso válido en kg.');
      return null;
    }
    if (Number.isNaN(parsedHeight) || parsedHeight <= 0 || parsedHeight > 260) {
      setValidationMessage('Introduce una altura válida en cm.');
      return null;
    }

    setValidationMessage(null);
    return {
      name: trimmedName,
      age: parsedAge,
      weightKg: parsedWeight,
      heightCm: parsedHeight,
    };
  };

  const handleSave = async (): Promise<void> => {
    const profileInput = validateAndBuildInput();
    if (profileInput === null) {
      return;
    }
    try {
      setIsSaving(true);
      await saveProfile(profileInput);
      Alert.alert('Perfil guardado', 'Tus datos se han guardado correctamente.');
    } catch (error) {
      Alert.alert(
        'No se pudo guardar',
        error instanceof Error ? error.message : 'Error desconocido',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && profile === null) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator size="large" color={palette.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={[palette.primaryGradientStart, palette.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.avatarCircle}>
              <Ionicons
                name={isFirstTime ? 'person-add' : 'person'}
                size={28}
                color={palette.primaryOn}
              />
            </View>
            <Text style={styles.headerTitle}>
              {isFirstTime ? 'Bienvenido' : `Hola, ${profile?.name ?? ''}`}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isFirstTime
                ? 'Completa tus datos para personalizar la app.'
                : 'Puedes actualizar tus datos cuando quieras.'}
            </Text>
          </LinearGradient>

          {errorMessage !== null && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <View style={styles.formBlock}>
            <LabeledInput
              label="Nombre"
              value={formState.name}
              onChangeText={handleFieldChange('name')}
              placeholder="Ej: María"
            />
            <LabeledInput
              label="Edad (años)"
              value={formState.ageText}
              onChangeText={handleFieldChange('ageText')}
              placeholder="Ej: 42"
              keyboardType="number-pad"
            />
            <LabeledInput
              label="Peso (kg)"
              value={formState.weightText}
              onChangeText={handleFieldChange('weightText')}
              placeholder="Ej: 68.5"
              keyboardType="decimal-pad"
            />
            <LabeledInput
              label="Altura (cm)"
              value={formState.heightText}
              onChangeText={handleFieldChange('heightText')}
              placeholder="Ej: 170"
              keyboardType="decimal-pad"
            />

            {validationMessage !== null && (
              <Text style={styles.validationText}>{validationMessage}</Text>
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
                  name={isFirstTime ? 'sparkles' : 'checkmark'}
                  size={18}
                  color={palette.primaryOn}
                />
                <Text style={styles.saveButtonText}>
                  {isSaving
                    ? 'Guardando...'
                    : isFirstTime
                      ? 'Crear perfil'
                      : 'Guardar cambios'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
      padding: 16,
      paddingBottom: 40,
    },
    headerCard: {
      borderRadius: 20,
      padding: 22,
      marginBottom: 20,
      shadowColor: palette.primary,
      shadowOpacity: palette.scheme === 'dark' ? 0.5 : 0.25,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
    },
    avatarCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    headerTitle: {
      color: palette.primaryOn,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    headerSubtitle: {
      color: palette.primaryOn,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4,
      opacity: 0.9,
    },
    formBlock: {
      backgroundColor: 'transparent',
    },
    saveButtonWrapper: {
      marginTop: 18,
      borderRadius: 14,
      shadowColor: palette.primary,
      shadowOpacity: palette.scheme === 'dark' ? 0.5 : 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 15,
      borderRadius: 14,
    },
    saveButtonPressed: {
      opacity: 0.9,
    },
    saveButtonText: {
      color: palette.primaryOn,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.2,
    },
    errorText: {
      color: palette.danger,
      fontSize: 13,
      marginBottom: 8,
    },
    validationText: {
      color: palette.danger,
      fontSize: 13,
      marginTop: 8,
    },
  });
}
