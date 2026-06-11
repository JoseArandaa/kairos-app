import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import GymHomeScreen from "../screens/gym/GymHomeScreen";
import ActiveWorkoutScreen from "../screens/gym/ActiveWorkoutScreen";
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
  </Stack.Navigator>
);

export default GymStack;
