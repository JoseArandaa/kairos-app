import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Barbell, Lightning, Clock } from "phosphor-react-native";
import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { CardContainer } from "../../components/common/CardContainer";
import { colors } from "../../theme/colors";
import type { GymStackNavigationProp, Workout } from "../../types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

function totalVolume(workout: Workout): number {
  return workout.exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.filter((s) => s.completed).reduce((a, s) => a + s.weight * s.reps, 0),
    0,
  );
}

export default function GymHomeScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const uid = useAuthStore((s) => s.uid);
  const activeWorkout = useGymStore((s) => s.activeWorkout);
  const recentWorkouts = useGymStore((s) => s.recentWorkouts);
  const isLoadingHistory = useGymStore((s) => s.isLoadingHistory);
  const error = useGymStore((s) => s.error);
  const startWorkout = useGymStore((s) => s.startWorkout);
  const loadRecentWorkouts = useGymStore((s) => s.loadRecentWorkouts);
  const loadActiveWorkout = useGymStore((s) => s.loadActiveWorkout);
  const clearError = useGymStore((s) => s.clearError);

  useEffect(() => {
    if (!uid) return;
    void loadActiveWorkout(uid);
    void loadRecentWorkouts(uid);
  }, [uid, loadActiveWorkout, loadRecentWorkouts]);

  const handleStart = () => {
    if (!uid) {
      console.warn("[Gym] No hay uid — usuario no autenticado");
      return;
    }
    const w = activeWorkout ?? startWorkout(uid);
    navigation.navigate("ActiveWorkout", { workoutId: w.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"] as Edge[]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.pageBg} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Gym</Text>

        {error && (
          <TouchableOpacity style={styles.errorBanner} onPress={clearError} activeOpacity={0.8}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Text style={styles.errorHint}>tap para cerrar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.9}>
          <Lightning size={22} color={colors.textOnDark} weight="fill" />
          <Text style={styles.startButtonText}>
            {activeWorkout ? "Continuar entrenamiento" : "Iniciar entrenamiento"}
          </Text>
        </TouchableOpacity>

        <CardContainer
          cardTitle="Historial"
          gradientColors={["#1a233a26", "#1a233a14"]}
          borderColor="#1a233a14"
          icon={<Barbell weight="fill" size={20} color={colors.navy} />}
          iconColor={colors.navy}
          detailsText=""
        >
          {isLoadingHistory && recentWorkouts.length === 0 ? (
            <ActivityIndicator style={styles.loader} color={colors.navy} />
          ) : recentWorkouts.length === 0 ? (
            <Text style={styles.empty}>Aún no hay entrenamientos completados.</Text>
          ) : (
            <View style={styles.historyList}>
              {recentWorkouts.map((w, i) => (
                <View
                  key={w.id}
                  style={[styles.workoutRow, i === recentWorkouts.length - 1 && styles.lastRow]}
                >
                  <View style={styles.workoutRowMain}>
                    <Text style={styles.workoutName}>{w.name}</Text>
                    <View style={styles.metaRow}>
                      <Clock size={12} color={colors.textMuted} />
                      <Text style={styles.workoutMeta}>
                        {formatDuration(w.durationSeconds)} · {w.exercises.length} ejercicios
                      </Text>
                    </View>
                  </View>
                  <View style={styles.workoutRowSide}>
                    <Text style={styles.workoutDate}>{formatDate(w.startedAt)}</Text>
                    <Text style={styles.workoutVolume}>{totalVolume(w).toLocaleString()} kg</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </CardContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 20,
    fontFamily: "Poppins_600SemiBold",
  },

  startButton: {
    marginTop: 24,
    backgroundColor: colors.navy,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: { color: colors.textOnDark, fontSize: 16, fontWeight: "600" },

  historyList: { marginTop: 4 },
  workoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  lastRow: { borderBottomWidth: 0 },
  workoutRowMain: { flex: 1 },
  workoutRowSide: { alignItems: "flex-end" },
  workoutName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  workoutMeta: { fontSize: 12, color: colors.textMuted },
  workoutDate: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  workoutVolume: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },

  loader: { marginVertical: 24 },
  empty: { textAlign: "center", color: colors.textMuted, paddingVertical: 24, fontSize: 14 },

  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  errorText: { color: colors.dangerText, fontSize: 13, fontWeight: "500" },
  errorHint: { color: colors.dangerText, fontSize: 11, marginTop: 2, opacity: 0.7 },
});
