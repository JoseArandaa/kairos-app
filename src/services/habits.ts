import { Habit, HabitForHome } from "../types";

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

const getHabitsAndCheckinsByUserIdAndDate = async (
  userId: string,
  date: string,
): Promise<HabitForHome[]> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/habit/get-habits-and-checkins-by-userid-and-date/?userId=${userId}&date=${date}`,
  );
  const data = await response.json();
  return data.data;
};

const createHabit = async (habit: Partial<Habit>) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/habit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(habit),
  });
  const data = await response.json();
  console.log("data", data);
  return data.data;
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
  getHabitsAndCheckinsByUserIdAndDate,
  updateHabit,
  deleteHabit,
};
