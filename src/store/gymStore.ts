import { StateCreator } from "zustand";
import { useStore } from "zustand";
import { createPersistedStore } from ".";
import type {
  Exercise,
  Routine,
  RoutineTemplate,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "../types";
import {
  upsertWorkout,
  fetchRecentWorkouts,
  fetchActiveWorkout,
  upsertRoutine,
  deleteRoutine as deleteRoutineDoc,
  fetchRoutines,
} from "../services/gym";
import { getErrorMessage, makeId } from "../utils";
import { pickNewerWorkout, routineExercisesToWorkoutExercises } from "../utils/workout";

export interface GymState {
  activeWorkout: Workout | null;
  recentWorkouts: Workout[];
  routines: Routine[];
  isLoadingHistory: boolean;
  isLoadingRoutines: boolean;
  isFinishing: boolean;
  error: string | null;
  restEndsAt: string | null;
  restDurationSeconds: number;
  restDefaultSeconds: number;
  pendingSyncIds: string[];
  pendingCancelled: Workout[];
  pendingRoutineOps: Record<string, "save" | "delete">;
  isOnline: boolean;
  isSyncing: boolean;

  // Return null (and start nothing) when a workout is already active.
  startWorkout: (_userId: string, _name?: string) => Workout | null;
  startWorkoutFromTemplate: (_userId: string, _template: RoutineTemplate) => Workout | null;
  startWorkoutFromRoutine: (_userId: string, _routine: Routine) => Workout | null;
  addExerciseToWorkout: (_workoutId: string, _exercise: Exercise) => void;
  setExerciseRest: (
    _workoutId: string,
    _workoutExerciseId: string,
    _seconds: number | null,
  ) => void;
  renameWorkout: (_workoutId: string, _name: string) => Promise<void>;
  editWorkoutSet: (
    _workoutId: string,
    _workoutExerciseId: string,
    _setId: string,
    _partial: Partial<Pick<WorkoutSet, "weight" | "reps" | "completed">>,
  ) => void;
  addWorkoutSet: (
    _workoutId: string,
    _workoutExerciseId: string,
    _weight: number,
    _reps: number,
  ) => void;
  removeWorkoutSet: (_workoutId: string, _workoutExerciseId: string, _setId: string) => void;
  setWorkoutDuration: (_workoutId: string, _seconds: number) => void;
  finishWorkout: (_durationSeconds?: number) => Promise<void>;
  cancelWorkout: () => Promise<void>;
  startRest: (_seconds?: number) => void;
  adjustRest: (_deltaSeconds: number) => void;
  skipRest: () => void;
  setRestDefault: (_seconds: number) => void;
  loadRecentWorkouts: (_userId: string) => Promise<void>;
  loadActiveWorkout: (_userId: string) => Promise<void>;
  loadRoutines: (_userId: string) => Promise<void>;
  saveRoutine: (_routine: Routine) => Promise<void>;
  removeRoutine: (_routineId: string) => Promise<void>;
  setOnline: (_isOnline: boolean) => void;
  retryPendingSyncs: () => Promise<void>;
  clearError: () => void;
}

function applyWorkoutUpdate(
  state: GymState,
  workoutId: string,
  updater: (_w: Workout) => Workout,
): { workout: Workout; patch: Partial<GymState> } | null {
  if (state.activeWorkout?.id === workoutId) {
    const workout = updater(state.activeWorkout);
    return { workout, patch: { activeWorkout: workout } };
  }
  const idx = state.recentWorkouts.findIndex((w) => w.id === workoutId);
  if (idx === -1) return null;
  const workout = updater(state.recentWorkouts[idx]);
  const next = [...state.recentWorkouts];
  next[idx] = workout;
  return { workout, patch: { recentWorkouts: next } };
}

const WRITE_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms = WRITE_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Sin respuesta del servidor")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const createGymSlice: StateCreator<GymState, [], []> = (set, get) => {
  const inFlight = new Map<string, Promise<void>>();

  const enqueueSync = (workoutId: string) => {
    set((s) =>
      s.pendingSyncIds.includes(workoutId)
        ? s
        : { pendingSyncIds: [...s.pendingSyncIds, workoutId] },
    );
  };

  const dequeueSync = (workoutId: string) => {
    set((s) => ({
      pendingSyncIds: s.pendingSyncIds.filter((id) => id !== workoutId),
      pendingCancelled: s.pendingCancelled.filter((w) => w.id !== workoutId),
    }));
  };

  const tryUpsert = async (workout: Workout): Promise<boolean> => {
    if (!get().isOnline) return false;
    try {
      await withTimeout(upsertWorkout(workout));
      if (get().error) set({ error: null });
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err) });
      return false;
    }
  };

  const lookupWorkout = (workoutId: string): Workout | undefined => {
    const s = get();
    return s.activeWorkout?.id === workoutId
      ? s.activeWorkout
      : (s.recentWorkouts.find((w) => w.id === workoutId) ??
          s.pendingCancelled.find((w) => w.id === workoutId));
  };

  const routineInFlight = new Map<string, Promise<void>>();

  const runRoutineSync = async (id: string) => {
    const op = get().pendingRoutineOps[id];
    if (!op || !get().isOnline) return;
    const routine = get().routines.find((r) => r.id === id);
    try {
      if (op === "save") {
        if (routine) await withTimeout(upsertRoutine(routine));
      } else {
        await withTimeout(deleteRoutineDoc(id));
      }
      if (get().pendingRoutineOps[id] !== op) return;
      // Edited again while in flight: stay pending so the newer version syncs next time.
      if (op === "save" && get().routines.find((r) => r.id === id) !== routine) return;
      set((s) => {
        const { [id]: _done, ...rest } = s.pendingRoutineOps;
        void _done;
        return { pendingRoutineOps: rest };
      });
    } catch (err) {
      set({ error: getErrorMessage(err) });
    }
  };

  const syncRoutine = (id: string): Promise<void> => {
    const promise = (routineInFlight.get(id) ?? Promise.resolve()).then(() => runRoutineSync(id));
    routineInFlight.set(id, promise);
    void promise.finally(() => {
      if (routineInFlight.get(id) === promise) routineInFlight.delete(id);
    });
    return promise;
  };

  const serializeUpsert = (workoutId: string, explicit?: Workout): Promise<void> => {
    const prev = inFlight.get(workoutId) ?? Promise.resolve();
    const promise = prev
      .catch(() => {})
      .then(async () => {
        const workout = explicit ?? lookupWorkout(workoutId);
        if (!workout) {
          dequeueSync(workoutId);
          return;
        }
        const ok = await tryUpsert(workout);
        if (ok) dequeueSync(workoutId);
        else enqueueSync(workoutId);
      });
    inFlight.set(workoutId, promise);
    void promise.finally(() => {
      if (inFlight.get(workoutId) === promise) inFlight.delete(workoutId);
    });
    return promise;
  };

  const mutateWorkout = async (
    workoutId: string,
    updater: (_w: Workout) => Workout,
  ): Promise<Workout | null> => {
    const stampedUpdater = (w: Workout): Workout => ({
      ...updater(w),
      updatedAt: new Date().toISOString(),
    });
    const result = applyWorkoutUpdate(get(), workoutId, stampedUpdater);
    if (!result) return null;
    set(result.patch);
    await serializeUpsert(workoutId);
    return result.workout;
  };

  const createAndPersistWorkout = (
    userId: string,
    opts: { name: string; exercises: WorkoutExercise[] },
  ): Workout | null => {
    if (get().activeWorkout) return null;
    const now = new Date().toISOString();
    const workout: Workout = {
      id: makeId("wo"),
      userId,
      name: opts.name,
      status: "active",
      exercises: opts.exercises,
      startedAt: now,
      updatedAt: now,
    };
    set({ activeWorkout: workout, error: null });
    void serializeUpsert(workout.id);
    return workout;
  };

  return {
    activeWorkout: null,
    recentWorkouts: [],
    routines: [],
    isLoadingHistory: false,
    isLoadingRoutines: false,
    isFinishing: false,
    error: null,
    restEndsAt: null,
    restDurationSeconds: 0,
    restDefaultSeconds: 60,
    pendingSyncIds: [],
    pendingCancelled: [],
    pendingRoutineOps: {},
    isOnline: true,
    isSyncing: false,

    startWorkout: (userId, name) =>
      createAndPersistWorkout(userId, { name: name ?? "Workout", exercises: [] }),

    startWorkoutFromTemplate: (userId, template) =>
      createAndPersistWorkout(userId, {
        name: template.name,
        exercises: routineExercisesToWorkoutExercises(template.exercises),
      }),

    startWorkoutFromRoutine: (userId, routine) =>
      createAndPersistWorkout(userId, {
        name: routine.name,
        exercises: routineExercisesToWorkoutExercises(routine.exercises),
      }),

    addExerciseToWorkout: (workoutId, exercise) => {
      void mutateWorkout(workoutId, (w) => {
        const newExercise: WorkoutExercise = {
          id: makeId("we"),
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: [],
          order: w.exercises.length,
        };
        return { ...w, exercises: [...w.exercises, newExercise] };
      });
    },

    setExerciseRest: (workoutId, workoutExerciseId, seconds) => {
      void mutateWorkout(workoutId, (w) => ({
        ...w,
        exercises: w.exercises.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex;
          if (seconds === null) {
            const { restSeconds: _r, ...rest } = ex;
            void _r;
            return rest;
          }
          return { ...ex, restSeconds: Math.max(10, Math.min(600, Math.round(seconds))) };
        }),
      }));
    },

    renameWorkout: async (workoutId, name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const state = get();
      const current =
        state.activeWorkout?.id === workoutId
          ? state.activeWorkout
          : state.recentWorkouts.find((w) => w.id === workoutId);
      if (!current || current.name === trimmed) return;
      await mutateWorkout(workoutId, (w) => ({ ...w, name: trimmed }));
    },

    editWorkoutSet: (workoutId, workoutExerciseId, setId, partial) => {
      void mutateWorkout(workoutId, (w) => ({
        ...w,
        exercises: w.exercises.map((ex) =>
          ex.id === workoutExerciseId
            ? {
                ...ex,
                sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...partial } : s)),
              }
            : ex,
        ),
      }));
    },

    addWorkoutSet: (workoutId, workoutExerciseId, weight, reps) => {
      const newSet: WorkoutSet = {
        id: makeId("set"),
        weight,
        reps,
        completed: false,
      };
      void mutateWorkout(workoutId, (w) => ({
        ...w,
        exercises: w.exercises.map((ex) =>
          ex.id === workoutExerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex,
        ),
      }));
    },

    removeWorkoutSet: (workoutId, workoutExerciseId, setId) => {
      void mutateWorkout(workoutId, (w) => ({
        ...w,
        exercises: w.exercises
          .map((ex) =>
            ex.id === workoutExerciseId
              ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
              : ex,
          )
          .filter((ex) => ex.id !== workoutExerciseId || ex.sets.length > 0)
          .map((ex, idx) => ({ ...ex, order: idx })),
      }));
    },

    setWorkoutDuration: (workoutId, seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return;
      void mutateWorkout(workoutId, (w) => {
        const completedAt = new Date(
          new Date(w.startedAt).getTime() + seconds * 1000,
        ).toISOString();
        return { ...w, durationSeconds: Math.round(seconds), completedAt };
      });
    },

    finishWorkout: async (durationSeconds) => {
      const active = get().activeWorkout;
      if (!active) return;
      const startMs = new Date(active.startedAt).getTime();
      const dur =
        typeof durationSeconds === "number" && durationSeconds >= 0
          ? Math.round(durationSeconds)
          : Math.round((Date.now() - startMs) / 1000);
      const completedAt = new Date(startMs + dur * 1000).toISOString();
      const cleanedExercises = active.exercises
        .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.completed) }))
        .filter((ex) => ex.sets.length > 0)
        .map((ex, idx) => ({ ...ex, order: idx }));
      const finished: Workout = {
        ...active,
        exercises: cleanedExercises,
        status: "completed",
        completedAt,
        durationSeconds: dur,
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({
        activeWorkout: null,
        recentWorkouts: [finished, ...s.recentWorkouts],
        isFinishing: false,
        restEndsAt: null,
        restDurationSeconds: 0,
        error: null,
      }));
      await serializeUpsert(finished.id);
    },

    cancelWorkout: async () => {
      const active = get().activeWorkout;
      if (!active) return;
      const cancelled: Workout = {
        ...active,
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({
        activeWorkout: null,
        restEndsAt: null,
        restDurationSeconds: 0,
        pendingCancelled: [...s.pendingCancelled, cancelled],
      }));
      await serializeUpsert(cancelled.id);
    },

    loadRecentWorkouts: async (userId) => {
      set({ isLoadingHistory: true, error: null });
      try {
        const remote = await fetchRecentWorkouts(userId);
        set((s) => {
          const merged = remote.map((rw) => {
            const local = s.recentWorkouts.find((w) => w.id === rw.id);
            if (!local) return rw;
            if (s.pendingSyncIds.includes(rw.id)) return local;
            return pickNewerWorkout(local, rw);
          });
          const localOnlyPending = s.recentWorkouts.filter(
            (w) => s.pendingSyncIds.includes(w.id) && !remote.find((rw) => rw.id === w.id),
          );
          return {
            recentWorkouts: [...localOnlyPending, ...merged],
            isLoadingHistory: false,
          };
        });
      } catch (err) {
        set({ error: getErrorMessage(err), isLoadingHistory: false });
      }
    },

    loadActiveWorkout: async (userId) => {
      const idAtStart = get().activeWorkout?.id;
      try {
        const remote = await fetchActiveWorkout(userId);
        const state = get();
        const local = state.activeWorkout;
        if (remote && state.pendingCancelled.some((w) => w.id === remote.id)) return;
        if (
          remote &&
          (state.pendingSyncIds.includes(remote.id) ||
            inFlight.has(remote.id) ||
            state.recentWorkouts.some((w) => w.id === remote.id && w.status !== "active"))
        ) {
          return;
        }
        // A different workout was started while we were fetching: the fetch is stale.
        if (local && local.id !== idAtStart) return;
        if (local && (state.pendingSyncIds.includes(local.id) || inFlight.has(local.id))) return;
        if (!remote) {
          set({ activeWorkout: null });
          return;
        }
        if (!local || local.id !== remote.id) {
          set({ activeWorkout: remote });
          return;
        }
        set({ activeWorkout: pickNewerWorkout(local, remote) });
      } catch (err) {
        set({ error: getErrorMessage(err) });
      }
    },

    loadRoutines: async (userId) => {
      set({ isLoadingRoutines: true, error: null });
      try {
        const remote = await fetchRoutines(userId);
        set((s) => {
          const ops = s.pendingRoutineOps;
          const kept = remote
            .filter((r) => ops[r.id] !== "delete")
            .map((r) => (ops[r.id] === "save" ? (s.routines.find((l) => l.id === r.id) ?? r) : r));
          const localOnly = s.routines.filter(
            (r) => ops[r.id] === "save" && !remote.some((x) => x.id === r.id),
          );
          return { routines: [...localOnly, ...kept], isLoadingRoutines: false };
        });
      } catch (err) {
        set({ error: getErrorMessage(err), isLoadingRoutines: false });
      }
    },

    saveRoutine: async (routine) => {
      set((s) => {
        const existing = s.routines.findIndex((r) => r.id === routine.id);
        const next = [...s.routines];
        if (existing >= 0) {
          next[existing] = routine;
        } else {
          next.unshift(routine);
        }
        return {
          routines: next,
          pendingRoutineOps: { ...s.pendingRoutineOps, [routine.id]: "save" },
          error: null,
        };
      });
      await syncRoutine(routine.id);
    },

    removeRoutine: async (routineId) => {
      set((s) => ({
        routines: s.routines.filter((r) => r.id !== routineId),
        pendingRoutineOps: { ...s.pendingRoutineOps, [routineId]: "delete" },
        error: null,
      }));
      await syncRoutine(routineId);
    },

    startRest: (seconds) => {
      const duration = seconds ?? get().restDefaultSeconds;
      if (duration <= 0) {
        set({ restEndsAt: null, restDurationSeconds: 0 });
        return;
      }
      const endsAt = new Date(Date.now() + duration * 1000).toISOString();
      set({ restEndsAt: endsAt, restDurationSeconds: duration });
    },

    adjustRest: (deltaSeconds) => {
      const { restEndsAt, restDurationSeconds } = get();
      if (!restEndsAt) return;
      const newEnd = new Date(new Date(restEndsAt).getTime() + deltaSeconds * 1000);
      if (newEnd.getTime() <= Date.now()) {
        set({ restEndsAt: null, restDurationSeconds: 0 });
        return;
      }
      set({
        restEndsAt: newEnd.toISOString(),
        restDurationSeconds: Math.max(1, restDurationSeconds + deltaSeconds),
      });
    },

    skipRest: () => set({ restEndsAt: null, restDurationSeconds: 0 }),

    setRestDefault: (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return;
      set({ restDefaultSeconds: Math.round(seconds) });
    },

    setOnline: (isOnline) => {
      const wasOnline = get().isOnline;
      set({ isOnline });
      const s = get();
      if (
        !wasOnline &&
        isOnline &&
        (s.pendingSyncIds.length > 0 || Object.keys(s.pendingRoutineOps).length > 0)
      ) {
        void get().retryPendingSyncs();
      }
    },

    retryPendingSyncs: async () => {
      if (get().isSyncing) return;
      const ids = [...get().pendingSyncIds];
      const routineIds = Object.keys(get().pendingRoutineOps);
      if (ids.length === 0 && routineIds.length === 0) return;
      set({ isSyncing: true, error: null });

      for (const id of routineIds) await syncRoutine(id);

      for (const id of ids) {
        if (!get().isOnline) break;
        await serializeUpsert(id);
        if (get().pendingSyncIds.includes(id)) break;
      }
      set({ isSyncing: false });
    },

    clearError: () => set({ error: null }),
  };
};

export const gymStore = createPersistedStore<GymState>("gymStore", createGymSlice, {
  partialize: (state) => ({
    activeWorkout: state.activeWorkout,
    recentWorkouts: state.recentWorkouts,
    routines: state.routines,
    restEndsAt: state.restEndsAt,
    restDurationSeconds: state.restDurationSeconds,
    restDefaultSeconds: state.restDefaultSeconds,
    pendingSyncIds: state.pendingSyncIds,
    pendingCancelled: state.pendingCancelled,
    pendingRoutineOps: state.pendingRoutineOps,
  }),
});

export function useGymStore<TSelected>(selector: (state: GymState) => TSelected): TSelected {
  return useStore(gymStore, selector);
}
