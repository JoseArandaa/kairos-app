import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "../screens/profile/ProfileScreen";
import CalendarScreen from "../screens/calendar/CalendarScreen";
import GymScreen from "../screens/gym/GymScreen";
import WalletScreen from "../screens/wallet/WalletScreen";
import { CurvedTabBar } from "./CurvedTabBar";
import { TabParamList } from "../types";
import HomeStack from "./HomeStack";

const Tab = createBottomTabNavigator<TabParamList>();

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
      <Tab.Screen name="Gym" component={GymScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </View>
);

export default TabNavigator;
