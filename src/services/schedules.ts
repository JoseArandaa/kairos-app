import { Schedule } from "../types";

const getSchedules = async () => {
  const response = await fetch(`${process.env.BACKEND_URL}/schedules`);
  return response.json();
};

const getSchedule = async (id: string) => {
  const response = await fetch(`${process.env.BACKEND_URL}/schedules/${id}`);
  return response.json();
};

const getSchedulesByUserId = async (userId: string): Promise<Schedule[]> => {
  const response = await fetch(`${process.env.BACKEND_URL}/schedule/user/${userId}`);
  return response.json();
};

const createSchedule = async (schedule: Partial<Schedule>) => {
  const response = await fetch(`${process.env.BACKEND_URL}/schedules`, {
    method: "POST",
    body: JSON.stringify(schedule),
  });
  return response.json();
};

const updateSchedule = async (id: string, schedule: Partial<Schedule>) => {
  const response = await fetch(`${process.env.BACKEND_URL}/schedules/${id}`, {
    method: "PUT",
    body: JSON.stringify(schedule),
  });
  return response.json();
};

const deleteSchedule = async (id: string) => {
  const response = await fetch(`${process.env.BACKEND_URL}/schedules/${id}`, {
    method: "DELETE",
  });
  return response.json();
};

export {
  getSchedules,
  createSchedule,
  getSchedule,
  getSchedulesByUserId,
  updateSchedule,
  deleteSchedule,
};
