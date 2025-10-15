import { Habit } from "../types";

const getHabits = async () => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habit`);
  console.log(process.env.EXPO_PUBLIC_BACKEND_URL, response);
  return response.json();
};

const getHabit = async (id: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${id}`);
  return response.json();
};

const getHabitsByUserId = async (userId: string): Promise<Habit[]> => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habit/user/${userId}`);
  return response.json();
};

const getHabitByUserIdAndDate = async (userId: string, date: string): Promise<Habit[]> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/habit/user/${userId}/date/${date}`,
  );
  return response.json();
};

const createHabit = async (habit: Partial<Habit>) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habits`, {
    method: "POST",
    body: JSON.stringify(habit),
  });
  return response.json();
};

const updateHabit = async (id: string, habit: Partial<Habit>) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(habit),
  });
  return response.json();
};

const deleteHabit = async (id: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${id}`, {
    method: "DELETE",
  });
  return response.json();
};

export {
  getHabits,
  createHabit,
  getHabit,
  getHabitsByUserId,
  getHabitByUserIdAndDate,
  updateHabit,
  deleteHabit,
};
