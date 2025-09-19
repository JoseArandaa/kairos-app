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
