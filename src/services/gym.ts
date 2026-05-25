import {
  collection,
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
import type { Workout } from "../types";

const WORKOUTS_COLLECTION = "workouts";

interface WorkoutDoc extends Omit<Workout, "startedAt" | "completedAt"> {
  startedAt: Timestamp;
  completedAt?: Timestamp;
}

function toFirestore(workout: Workout): WorkoutDoc {
  const { startedAt, completedAt, ...rest } = workout;
  const doc: WorkoutDoc = {
    ...rest,
    startedAt: Timestamp.fromDate(new Date(startedAt)),
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
