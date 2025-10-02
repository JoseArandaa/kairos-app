import AsyncStorage from "@react-native-async-storage/async-storage";
// Usamos vanilla para poder usar Zustand fuera de un componente React
import { createStore } from "zustand/vanilla";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { StateCreator } from "zustand";

export function createPersistedStore<TState extends object>(
  name: string,
  createState: StateCreator<TState, [], []>,
) {
  return createStore<TState>()(
    // Usamos devtools para poder ver el estado en el navegador
    devtools(
      // Usamos persist para poder persistir el estado en el dispositivo
      // Web: localStorage
      // Android: AsyncStorage
      // iOS: AsyncStorage
      persist(createState, {
        name,
        storage: createJSONStorage(() => AsyncStorage),
        // Usamos createJSONStorage para poder persistir el estado en el dispositivo
        // Web: localStorage
        // Android: AsyncStorage
        // iOS: AsyncStorage
      }),
      { name: `${name}-devtools`, host: "localhost", port: 8000 },
    ),
  );
}

export type RootStore = {
  // Placeholder for potential root-level helpers or references
};
