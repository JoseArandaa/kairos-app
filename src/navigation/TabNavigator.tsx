import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute, type RouteProp } from "@react-navigation/native";
import ProfileScreen from "../screens/profile/ProfileScreen";
import CalendarScreen from "../screens/calendar/CalendarScreen";
import WalletScreen from "../screens/wallet/WalletScreen";
import { CurvedTabBar } from "./CurvedTabBar";
import { TabParamList, GymStackParamList } from "../types";
import HomeStack from "./HomeStack";
import GymStack from "./GymStack";

const Tab = createBottomTabNavigator<TabParamList>();

const GYM_FOCUS_ROUTES: ReadonlySet<keyof GymStackParamList> = new Set([
  "ActiveWorkout",
  "ExerciseDetail",
  "RoutineDetail",
  "WorkoutDetail",
  "RoutineEditor",
]);

const gymTabOptions = ({ route }: { route: RouteProp<TabParamList, "Gym"> }) => {
  const focused = getFocusedRouteNameFromRoute(route) as keyof GymStackParamList | undefined;
  const shouldHide = focused !== undefined && GYM_FOCUS_ROUTES.has(focused);
  return {
    tabBarStyle: shouldHide ? { display: "none" as const } : undefined,
  };
};

const TabNavigator: React.FC = () => (
  <View style={{ flex: 1 }}>
    <Tab.Navigator
      id={undefined}
      initialRouteName="Home"
      tabBar={(props) => <CurvedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Gym" component={GymStack} options={gymTabOptions} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </View>
);

export default TabNavigator;
