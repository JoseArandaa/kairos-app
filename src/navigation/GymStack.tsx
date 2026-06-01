import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import GymHomeScreen from "../screens/gym/GymHomeScreen";
import ActiveWorkoutScreen from "../screens/gym/ActiveWorkoutScreen";
import ExerciseDetailScreen from "../screens/gym/ExerciseDetailScreen";
import WorkoutDetailScreen from "../screens/gym/WorkoutDetailScreen";
import { GymStackParamList } from "../types";

const Stack = createStackNavigator<GymStackParamList>();

const GymStack: React.FC = () => (
  <Stack.Navigator
    initialRouteName="GymHome"
    screenOptions={{ headerShown: false }}
    // @ts-ignore
    id={undefined}
  >
    <Stack.Screen name="GymHome" component={GymHomeScreen} options={{ title: "Gym" }} />
    <Stack.Screen
      name="ActiveWorkout"
      component={ActiveWorkoutScreen}
      options={{ headerShown: true, title: "Workout", headerBackTitle: "Back" }}
    />
    <Stack.Screen
      name="ExerciseDetail"
      component={ExerciseDetailScreen}
      options={{ headerShown: true, title: "Ejercicio", headerBackTitle: "Back" }}
    />
    <Stack.Screen
      name="WorkoutDetail"
      component={WorkoutDetailScreen}
      options={{ headerShown: true, title: "Entrenamiento", headerBackTitle: "Back" }}
    />
  </Stack.Navigator>
);

export default GymStack;
