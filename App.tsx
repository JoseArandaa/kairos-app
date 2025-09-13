import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import AuthScreen from "./src/screens/auth/AuthScreen";
import TabNavigator from "./src/navigation/TabNavigator";
import { useAuth } from "./src/hooks/useAuth";
import { AuthStackParamList } from "./src/types";

const Stack = createStackNavigator<AuthStackParamList>();

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; //TODO: add a loading screen here
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        id={undefined}
      >
        {user ? (
          <Stack.Screen name="Auth" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
