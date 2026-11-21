import AsyncStorage from "@react-native-async-storage/async-storage";
// Usamos vanilla para poder usar Zustand fuera de un componente React
import { createStore } from "zustand/vanilla";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { StateCreator } from "zustand";

interface PersistedStoreOptions<TState> {
  partialize?: (_state: TState) => Partial<TState>;
  version?: number;
  migrate?: (_persisted: unknown, _version: number) => TState | Promise<TState>;
}

export function createPersistedStore<TState extends object>(
  name: string,
  createState: StateCreator<TState, [], []>,
  options: PersistedStoreOptions<TState> = {},
) {
  return createStore<TState>()(
    devtools(
      persist(createState, {
        name,
        storage: createJSONStorage(() => AsyncStorage),
        ...(options.partialize ? { partialize: options.partialize } : {}),
        ...(options.version !== undefined ? { version: options.version } : {}),
        ...(options.migrate ? { migrate: options.migrate } : {}),
      }),
      { name: `${name}-devtools`, host: "localhost", port: 8000 },
    ),
  );
}

export type RootStore = {
  // Placeholder for potential root-level helpers or references
};
