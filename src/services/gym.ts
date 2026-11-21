import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Routine, Workout } from "../types";

const WORKOUTS_COLLECTION = "workouts";
const ROUTINES_COLLECTION = "routines";

interface WorkoutDoc extends Omit<Workout, "startedAt" | "completedAt" | "updatedAt"> {
  startedAt: Timestamp;
  completedAt?: Timestamp;
  updatedAt: Timestamp;
}

const stripUndefined = <T>(value: T): T => JSON.parse(JSON.stringify(value));

function toFirestore(workout: Workout): WorkoutDoc {
  const { startedAt, completedAt, updatedAt, ...rest } = workout;
  const doc: WorkoutDoc = {
    ...stripUndefined(rest),
    startedAt: Timestamp.fromDate(new Date(startedAt)),
    updatedAt: Timestamp.fromDate(new Date(updatedAt)),
  };
  if (completedAt) {
    doc.completedAt = Timestamp.fromDate(new Date(completedAt));
  }
  return doc;
}

function fromFirestore(data: WorkoutDoc): Workout {
  return {
    ...data,
    startedAt: data.startedAt.toDate().toISOString(),
    completedAt: data.completedAt?.toDate().toISOString(),
    // Legacy docs may not have updatedAt — fall back to startedAt
    updatedAt: data.updatedAt
      ? data.updatedAt.toDate().toISOString()
      : data.startedAt.toDate().toISOString(),
  };
}

export async function upsertWorkout(workout: Workout): Promise<void> {
  await setDoc(doc(db, WORKOUTS_COLLECTION, workout.id), toFirestore(workout));
}

export async function fetchRecentWorkouts(userId: string, count: number = 20): Promise<Workout[]> {
  const q = query(
    collection(db, WORKOUTS_COLLECTION),
    where("userId", "==", userId),
    where("status", "==", "completed"),
    orderBy("startedAt", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.data() as WorkoutDoc));
}

export async function fetchActiveWorkout(userId: string): Promise<Workout | null> {
  const q = query(
    collection(db, WORKOUTS_COLLECTION),
    where("userId", "==", userId),
    where("status", "==", "active"),
    orderBy("startedAt", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return fromFirestore(snap.docs[0].data() as WorkoutDoc);
}

interface RoutineDoc extends Omit<Routine, "createdAt" | "updatedAt"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function routineToFirestore(routine: Routine): RoutineDoc {
  const { createdAt, updatedAt, ...rest } = routine;
  return {
    ...stripUndefined(rest),
    createdAt: Timestamp.fromDate(new Date(createdAt)),
    updatedAt: Timestamp.fromDate(new Date(updatedAt)),
  };
}

function routineFromFirestore(data: RoutineDoc): Routine {
  return {
    ...data,
    createdAt: data.createdAt.toDate().toISOString(),
    updatedAt: data.updatedAt.toDate().toISOString(),
  };
}

export async function upsertRoutine(routine: Routine): Promise<void> {
  await setDoc(doc(db, ROUTINES_COLLECTION, routine.id), routineToFirestore(routine));
}

export async function deleteRoutine(routineId: string): Promise<void> {
  await deleteDoc(doc(db, ROUTINES_COLLECTION, routineId));
}

export async function fetchRoutines(userId: string): Promise<Routine[]> {
  const q = query(
    collection(db, ROUTINES_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => routineFromFirestore(d.data() as RoutineDoc));
}
