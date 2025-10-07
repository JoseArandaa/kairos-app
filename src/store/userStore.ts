import { StateCreator } from "zustand";
import { useStore } from "zustand";
import { createPersistedStore } from ".";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  clear: () => void;
}

const createUserSlice: StateCreator<UserState, [], []> = (set) => ({
  profile: null,
  setProfile: (profile) => set(() => ({ profile })),
  clear: () => set(() => ({ profile: null })),
});

export const userStore = createPersistedStore<UserState>("userStore", createUserSlice);

export function useUserStore<TSelected>(selector: (state: UserState) => TSelected): TSelected {
  return useStore(userStore, selector);
}
