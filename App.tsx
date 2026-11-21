import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthScreen from "./src/screens/auth/AuthScreen";
import TabNavigator from "./src/navigation/TabNavigator";
import { useAuth } from "./src/hooks/useAuth";
import { useNetworkSync } from "./src/hooks/useNetworkSync";
import { SyncStatusBanner } from "./src/components/common/SyncStatusBanner";
import { AuthStackParamList } from "./src/types";

const Stack = createStackNavigator<AuthStackParamList>();

const App: React.FC = () => {
  const { user, loading } = useAuth();
  useNetworkSync();

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
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
        {user && <SyncStatusBanner />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
