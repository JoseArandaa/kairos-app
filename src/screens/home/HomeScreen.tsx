import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { FinanceCard } from "../../components/FinanceCard";
import { HabitsCard } from "../../components/HabitsCard";
import { MonthlyGoalCard } from "../../components/MonthlyGoalCard";
import { OpenTaskCard } from "../../components/OpenTaskCard";
import { ScheduleCard } from "../../components/ScheduleCard";
import { TodayFocusCard } from "../../components/TodayFocusCard";
import { auth } from "../../services/firebase";
import { HomeScreenProps } from "../../types";

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const name = auth.currentUser?.displayName?.trim() || "there";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"] as Edge[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#1a233a" />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Hello {name}!</Text>

        <TodayFocusCard />
        <MonthlyGoalCard />

        <ScheduleCard />
        <OpenTaskCard />

        <HabitsCard />

        <FinanceCard />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContainer: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a233a",
    textAlign: "left",
    marginTop: 20,
    fontFamily: "Poppins_600SemiBold",
  },
});

export default HomeScreen;
