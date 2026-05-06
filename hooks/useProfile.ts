import { useCallback, useEffect, useState } from 'react';

import { initDatabase, selectProfile, upsertProfile } from '@/db/database';
import type { Profile, ProfileInput } from '@/types/health';

type UseProfileResult = {
  profile: Profile | null;
  isLoading: boolean;
  errorMessage: string | null;
  saveProfile: (profileInput: ProfileInput) => Promise<void>;
  refresh: () => Promise<void>;
};

/**
 * Hook personalizado que centraliza la lectura y escritura del perfil
 * único de la app. Mantiene el estado en memoria para que cualquier
 * pantalla que lo use se rerenderice tras un cambio.
 *
 * Las pantallas no deben tocar `db/database.ts` directamente: pasan
 * siempre por este hook.
 */
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const fetchedProfile = await selectProfile();
      setProfile(fetchedProfile);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error desconocido al leer el perfil',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
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
  }, [refresh]);

  const saveProfile = useCallback(
    async (profileInput: ProfileInput): Promise<void> => {
      await upsertProfile(profileInput);
      await refresh();
    },
    [refresh],
  );

  return { profile, isLoading, errorMessage, saveProfile, refresh };
}
