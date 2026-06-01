import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { WorkoutHistoryRow } from "../../components/gym/WorkoutHistoryRow";
import { EmptyState } from "../../components/common/EmptyState";
import { cardStyle } from "../../theme/styles";
import { colors } from "../../theme/colors";
import type { GymStackNavigationProp } from "../../types";

export default function WorkoutHistoryScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const uid = useAuthStore((s) => s.uid);
  const recentWorkouts = useGymStore((s) => s.recentWorkouts);
  const isLoadingHistory = useGymStore((s) => s.isLoadingHistory);
  const loadRecentWorkouts = useGymStore((s) => s.loadRecentWorkouts);

  useEffect(() => {
    if (uid) void loadRecentWorkouts(uid);
  }, [uid, loadRecentWorkouts]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {isLoadingHistory && recentWorkouts.length === 0 ? (
          <ActivityIndicator style={styles.loader} color={colors.navy} />
        ) : recentWorkouts.length === 0 ? (
          <EmptyState
            title="Aún no hay entrenamientos"
            subtitle="Cuando finalices uno, va a aparecer acá."
            style={styles.empty}
          />
        ) : (
          <View style={styles.listCard}>
            {recentWorkouts.map((w, i, arr) => (
              <WorkoutHistoryRow
                key={w.id}
                workout={w}
                onPress={() => navigation.navigate("WorkoutDetail", { workoutId: w.id })}
                isLast={i === arr.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  content: { padding: 16, paddingBottom: 32 },

  listCard: { ...cardStyle, paddingHorizontal: 14 },

  loader: { marginVertical: 40 },
  empty: { paddingVertical: 60 },
});
