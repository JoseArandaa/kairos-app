import { StateCreator } from "zustand";
import { useStore } from "zustand";
import { createPersistedStore } from ".";
import type { Exercise, Workout, WorkoutExercise, WorkoutSet } from "../types";
import { upsertWorkout, fetchRecentWorkouts, fetchActiveWorkout } from "../services/gym";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface GymState {
  activeWorkout: Workout | null;
  recentWorkouts: Workout[];
  isLoadingHistory: boolean;
  isFinishing: boolean;
  error: string | null;

  startWorkout: (_userId: string, _name?: string) => Workout;
  addExerciseToActive: (_exercise: Exercise) => void;
  addSet: (_workoutExerciseId: string, _weight: number, _reps: number) => void;
  toggleSetCompleted: (_workoutExerciseId: string, _setId: string) => void;
  removeSet: (_workoutExerciseId: string, _setId: string) => void;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  loadRecentWorkouts: (_userId: string) => Promise<void>;
  loadActiveWorkout: (_userId: string) => Promise<void>;
  clearError: () => void;
}

const createGymSlice: StateCreator<GymState, [], []> = (set, get) => ({
  activeWorkout: null,
  recentWorkouts: [],
  isLoadingHistory: false,
  isFinishing: false,
  error: null,

  startWorkout: (userId, name) => {
    const now = new Date().toISOString();
    const workout: Workout = {
      id: makeId("wo"),
      userId,
      name: name ?? "Workout",
      status: "active",
      exercises: [],
      startedAt: now,
    };
    set({ activeWorkout: workout, error: null });
    void upsertWorkout(workout).catch((err) =>
      set({ error: `No se pudo guardar en Firestore: ${(err as Error).message}` }),
    );
    return workout;
  },

  addExerciseToActive: (exercise) => {
    const active = get().activeWorkout;
    if (!active) return;
    const newExercise: WorkoutExercise = {
      id: makeId("we"),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [],
      order: active.exercises.length,
    };
    const updated: Workout = {
      ...active,
      exercises: [...active.exercises, newExercise],
    };
    set({ activeWorkout: updated });
    void upsertWorkout(updated).catch((err) => set({ error: (err as Error).message }));
  },

  addSet: (workoutExerciseId, weight, reps) => {
    const active = get().activeWorkout;
    if (!active) return;
    const newSet: WorkoutSet = {
      id: makeId("set"),
      weight,
      reps,
      completed: true,
    };
    const updated: Workout = {
      ...active,
      exercises: active.exercises.map((ex) =>
        ex.id === workoutExerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex,
      ),
    };
    set({ activeWorkout: updated });
    void upsertWorkout(updated).catch((err) => set({ error: (err as Error).message }));
  },

  toggleSetCompleted: (workoutExerciseId, setId) => {
    const active = get().activeWorkout;
    if (!active) return;
    const updated: Workout = {
      ...active,
      exercises: active.exercises.map((ex) =>
        ex.id === workoutExerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
            }
          : ex,
      ),
    };
    set({ activeWorkout: updated });
    void upsertWorkout(updated).catch((err) => set({ error: (err as Error).message }));
  },

  removeSet: (workoutExerciseId, setId) => {
    const active = get().activeWorkout;
    if (!active) return;
    const updated: Workout = {
      ...active,
      exercises: active.exercises.map((ex) =>
        ex.id === workoutExerciseId ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) } : ex,
      ),
    };
    set({ activeWorkout: updated });
    void upsertWorkout(updated).catch((err) => set({ error: (err as Error).message }));
  },

  finishWorkout: async () => {
    const active = get().activeWorkout;
    if (!active) return;
    const completedAt = new Date().toISOString();
    const durationSeconds = Math.round(
      (new Date(completedAt).getTime() - new Date(active.startedAt).getTime()) / 1000,
    );
    const finished: Workout = {
      ...active,
      status: "completed",
      completedAt,
      durationSeconds,
    };
    set({ isFinishing: true, error: null });
    try {
      await upsertWorkout(finished);
      set((s) => ({
        activeWorkout: null,
        recentWorkouts: [finished, ...s.recentWorkouts],
        isFinishing: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isFinishing: false });
    }
  },

  cancelWorkout: async () => {
    const active = get().activeWorkout;
    if (!active) return;
    const cancelled: Workout = { ...active, status: "cancelled" };
    try {
      await upsertWorkout(cancelled);
    } catch (err) {
      set({ error: (err as Error).message });
    }
    set({ activeWorkout: null });
  },

  loadRecentWorkouts: async (userId) => {
    set({ isLoadingHistory: true, error: null });
    try {
      const workouts = await fetchRecentWorkouts(userId);
      set({ recentWorkouts: workouts, isLoadingHistory: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoadingHistory: false });
    }
  },

  loadActiveWorkout: async (userId) => {
    try {
      const workout = await fetchActiveWorkout(userId);
      set({ activeWorkout: workout });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  clearError: () => set({ error: null }),
});

export const gymStore = createPersistedStore<GymState>("gymStore", createGymSlice, {
  partialize: (state) => ({
    activeWorkout: state.activeWorkout,
    recentWorkouts: state.recentWorkouts,
  }),
});

export function useGymStore<TSelected>(selector: (state: GymState) => TSelected): TSelected {
  return useStore(gymStore, selector);
}
