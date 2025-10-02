import { StateCreator } from "zustand";
import { useStore } from "zustand";
import { createPersistedStore } from ".";

export interface AuthState {
  status: "idle" | "authenticated" | "unauthenticated";
  refreshToken: string | null;
  uid: string | null;
  email: string | null;
  displayName: string | null;
  setAuthFromFirebase: (payload: {
    uid: string;
    refreshToken: string | null;
    email: string | null;
    displayName: string | null;
  }) => void;
  clearAuth: () => void;
}

const createAuthSlice: StateCreator<AuthState, [], []> = (set) => ({
  status: "idle",
  refreshToken: null,
  uid: null,
  email: null,
  displayName: null,
  setAuthFromFirebase: ({ uid, refreshToken, email, displayName }) =>
    set(() => ({
      status: "authenticated",
      uid,
      refreshToken: refreshToken ?? null,
      email,
      displayName,
    })),
  clearAuth: () =>
    set(() => ({
      status: "unauthenticated",
      uid: null,
      refreshToken: null,
      email: null,
      displayName: null,
    })),
});

export const authStore = createPersistedStore<AuthState>("authStore", createAuthSlice);

export function useAuthStore<TSelected>(selector: (state: AuthState) => TSelected): TSelected {
  return useStore(authStore, selector);
}
