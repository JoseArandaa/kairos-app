import type { RoutineExercise, Workout, WorkoutExercise } from "../types";
import { makeId } from ".";

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "long" });
}

export function exerciseVolume(ex: WorkoutExercise): number {
  return ex.sets.filter((s) => s.completed).reduce((acc, s) => acc + s.weight * s.reps, 0);
}

export function totalVolume(w: Workout): number {
  return w.exercises.reduce((acc, ex) => acc + exerciseVolume(ex), 0);
}

export function pickNewerWorkout(local: Workout | undefined, remote: Workout): Workout {
  if (!local) return remote;
  const localTime = new Date(local.updatedAt || local.startedAt).getTime();
  const remoteTime = new Date(remote.updatedAt || remote.startedAt).getTime();
  return localTime >= remoteTime ? local : remote;
}

export function routineExercisesToWorkoutExercises(
  routineExercises: RoutineExercise[],
): WorkoutExercise[] {
  return routineExercises.map((rx, idx) => ({
    id: makeId("we"),
    exerciseId: rx.exerciseId,
    exerciseName: rx.exerciseName,
    sets: [],
    order: idx,
    ...(rx.restSeconds !== undefined ? { restSeconds: rx.restSeconds } : {}),
  }));
}

export function findLastSetForExercise(
  exerciseId: string,
  workouts: Workout[],
): { weight: number; reps: number } | null {
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  for (const w of sorted) {
    const ex = w.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex || ex.sets.length === 0) continue;
    const completed = ex.sets.filter((s) => s.completed);
    const last = completed.at(-1) ?? ex.sets.at(-1);
    if (last) return { weight: last.weight, reps: last.reps };
  }
  return null;
}
