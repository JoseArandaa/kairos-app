import { type RoutineTemplate, type RoutineExercise } from "../types";
import { findExerciseById } from "./MockExercises";

// Helper para crear RoutineExercise a partir de un id de ejercicio mock.
function rx(
  exerciseId: string,
  targetSets: number,
  targetReps: number,
  order: number,
): RoutineExercise {
  const ex = findExerciseById(exerciseId);
  if (!ex) {
    throw new Error(`[MockRoutineTemplates] Exercise no encontrado: ${exerciseId}`);
  }
  return {
    id: `rx-${exerciseId}-${order}`,
    exerciseId,
    exerciseName: ex.name,
    targetSets,
    targetReps,
    order,
  };
}

export const mockRoutineTemplates: RoutineTemplate[] = [
  // ── PPL (Push / Pull / Legs) ─────────────────────────────────────────────
  {
    id: "tpl-ppl-push",
    name: "PPL · Push",
    description: "Día de empuje: pecho, hombros y tríceps.",
    category: "ppl",
    isBuiltIn: true,
    exercises: [
      rx("ex-bench-press", 4, 8, 0),
      rx("ex-incline-bench", 3, 10, 1),
      rx("ex-ohp", 3, 8, 2),
      rx("ex-lateral-raise", 3, 12, 3),
      rx("ex-tricep-pushdown", 3, 12, 4),
    ],
  },
  {
    id: "tpl-ppl-pull",
    name: "PPL · Pull",
    description: "Día de tracción: espalda y bíceps.",
    category: "ppl",
    isBuiltIn: true,
    exercises: [
      rx("ex-deadlift", 3, 5, 0),
      rx("ex-pullup", 4, 8, 1),
      rx("ex-barbell-row", 3, 8, 2),
      rx("ex-seated-row", 3, 10, 3),
      rx("ex-barbell-curl", 3, 10, 4),
      rx("ex-hammer-curl", 3, 12, 5),
    ],
  },
  {
    id: "tpl-ppl-legs",
    name: "PPL · Legs",
    description: "Día de pierna: cuádriceps, isquios y glúteos.",
    category: "ppl",
    isBuiltIn: true,
    exercises: [
      rx("ex-squat", 4, 6, 0),
      rx("ex-rdl", 3, 8, 1),
      rx("ex-leg-press", 3, 10, 2),
      rx("ex-leg-curl", 3, 12, 3),
      rx("ex-leg-extension", 3, 12, 4),
      rx("ex-calf-raise", 4, 15, 5),
    ],
  },

  // ── Upper / Lower ────────────────────────────────────────────────────────
  {
    id: "tpl-ul-upper",
    name: "Upper / Lower · Upper",
    description: "Día superior completo.",
    category: "upper_lower",
    isBuiltIn: true,
    exercises: [
      rx("ex-bench-press", 4, 8, 0),
      rx("ex-barbell-row", 4, 8, 1),
      rx("ex-ohp", 3, 8, 2),
      rx("ex-lat-pulldown", 3, 10, 3),
      rx("ex-db-curl", 3, 10, 4),
      rx("ex-skullcrusher", 3, 10, 5),
    ],
  },
  {
    id: "tpl-ul-lower",
    name: "Upper / Lower · Lower",
    description: "Día inferior completo.",
    category: "upper_lower",
    isBuiltIn: true,
    exercises: [
      rx("ex-squat", 4, 6, 0),
      rx("ex-rdl", 3, 8, 1),
      rx("ex-leg-press", 3, 10, 2),
      rx("ex-hip-thrust", 3, 10, 3),
      rx("ex-calf-raise", 4, 15, 4),
      rx("ex-plank", 3, 45, 5),
    ],
  },

  // ── Full Body ────────────────────────────────────────────────────────────
  {
    id: "tpl-fb-a",
    name: "Full Body A",
    description: "Sesión de cuerpo completo para 2-3 veces por semana.",
    category: "full_body",
    isBuiltIn: true,
    exercises: [
      rx("ex-squat", 3, 8, 0),
      rx("ex-bench-press", 3, 8, 1),
      rx("ex-barbell-row", 3, 8, 2),
      rx("ex-ohp", 3, 10, 3),
      rx("ex-plank", 3, 30, 4),
    ],
  },
];

export function findTemplateById(id: string): RoutineTemplate | undefined {
  return mockRoutineTemplates.find((t) => t.id === id);
}
