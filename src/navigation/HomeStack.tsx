import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/home/HomeScreen";
import HabitsScreen from "../screens/habits/HabitsScreen";
import AddHabitScreen from "../screens/habits/AddHabitScreen";
import { HomeStackParamList } from "../types";

const Stack = createStackNavigator<HomeStackParamList>();

interface HomeNavigatorProps {
  id?: string;
  children?: React.ReactNode;
}

const HomeNavigator: React.FC<HomeNavigatorProps> = ({ id, children }) => {
  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{ headerShown: false }}
      // @ts-ignore
      id={id}
    >
      {children}
    </Stack.Navigator>
  );
};

const HomeStack: React.FC = () => {
  return (
    <HomeNavigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: "Inicio" }} />
      <Stack.Screen
        name="HabitsScreen"
        component={HabitsScreen}
        options={{
          headerShown: true,
          title: "My Habits",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={{
          headerShown: false,
        }}
      />
    </HomeNavigator>
  );
};

export default HomeStack;
