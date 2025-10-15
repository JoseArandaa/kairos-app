import { HabitCheckin } from "../types";

const getHabitCheckins = async () => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habit-checkin`);
  console.log(process.env.EXPO_PUBLIC_BACKEND_URL, response);
  return response.json();
};

const getHabitCheckin = async (id: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habit-checkin/${id}`);
  return response.json();
};

const getHabitCheckinsByUserId = async (userId: string): Promise<HabitCheckin[]> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/habit-checkin/user/${userId}`,
  );
  return response.json();
};

const createHabitCheckin = async (habit: Partial<HabitCheckin>) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habit-checkin`, {
    method: "POST",
    body: JSON.stringify(habit),
  });
  return response.json();
};

const updateHabitCheckin = async (id: string, habit: Partial<HabitCheckin>) => {
  console.log("sas", habit);
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habit-checkin/${id}`, {
    method: "PUT",
    body: JSON.stringify(habit),
  });
  return response.json();
};

const deleteHabitCheckin = async (id: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habit-checkin/${id}`, {
    method: "DELETE",
  });
  return response.json();
};

export {
  getHabitCheckins,
  createHabitCheckin,
  getHabitCheckin,
  getHabitCheckinsByUserId,
  updateHabitCheckin,
  deleteHabitCheckin,
};
