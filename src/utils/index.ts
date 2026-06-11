import { Priority } from "../types/index";

export const priorityOrder: Record<Priority, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

export const sortByPriority = <T extends { priority: Priority }>(items: T[]): T[] => {
  return [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

export const sortByDueDate = <T extends { dueTimestamp?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    if (!a.dueTimestamp && !b.dueTimestamp) return 0;
    if (!a.dueTimestamp) return 1;
    if (!b.dueTimestamp) return -1;
    return new Date(a.dueTimestamp).getTime() - new Date(b.dueTimestamp).getTime();
  });
};

export function formatLabel(raw: string): string {
  const spaced = raw.replace(/[_-]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return String(err);
}
