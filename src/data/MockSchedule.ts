import { TimeSlot } from "../types";
import { createTime } from "../utils/createMockTime";

export const mockScheduleData: TimeSlot[] = [
  {
    id: "1",
    time: createTime(8, 0),
    label: "Wake Up",
    isActive: false,
  },
  {
    id: "2",
    time: createTime(9, 0),
    label: "Morning Routine",
    isActive: true,
  },
  {
    id: "3",
    time: createTime(10, 0),
    label: "Work Session",
    isActive: false,
  },
  {
    id: "4",
    time: createTime(12, 0),
    label: "Lunch Break",
    isActive: false,
  },
  {
    id: "5",
    time: createTime(14, 0),
    label: "Team Meeting",
    isActive: false,
  },
  {
    id: "6",
    time: createTime(16, 30),
    label: "Gym Time",
    isActive: false,
  },
  {
    id: "7",
    time: createTime(19, 0),
    label: "Dinner",
    isActive: false,
  },
  {
    id: "8",
    time: createTime(22, 0),
    label: "Wind Down",
    isActive: false,
  },
];
