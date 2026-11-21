import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Barbell, Lightning, ListChecks, CaretRight } from "phosphor-react-native";
import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { CardContainer } from "../../components/common/CardContainer";
import { EmptyState } from "../../components/common/EmptyState";
import { SoftActionButton } from "../../components/common/SoftActionButton";
import { EditDurationModal } from "../../components/gym/EditDurationModal";
import { WorkoutHistoryRow } from "../../components/gym/WorkoutHistoryRow";
import { mockRoutineTemplates } from "../../data/MockRoutineTemplates";
import { primaryShadow } from "../../theme/styles";
import { colors } from "../../theme/colors";
import type { GymStackNavigationProp, Routine, RoutineTemplate } from "../../types";

const STALE_WORKOUT_THRESHOLD_MS = 5 * 60 * 60 * 1000;

export default function GymHomeScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const uid = useAuthStore((s) => s.uid);
  const activeWorkout = useGymStore((s) => s.activeWorkout);
  const recentWorkouts = useGymStore((s) => s.recentWorkouts);
  const routines = useGymStore((s) => s.routines);
  const isLoadingHistory = useGymStore((s) => s.isLoadingHistory);
  const error = useGymStore((s) => s.error);
  const startWorkout = useGymStore((s) => s.startWorkout);
  const loadActiveWorkout = useGymStore((s) => s.loadActiveWorkout);
  const loadRecentWorkouts = useGymStore((s) => s.loadRecentWorkouts);
  const loadRoutines = useGymStore((s) => s.loadRoutines);
  const finishWorkout = useGymStore((s) => s.finishWorkout);
  const clearError = useGymStore((s) => s.clearError);

  const [staleDurationOpen, setStaleDurationOpen] = useState(false);
  const promptedWorkoutIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    void loadActiveWorkout(uid);
    void loadRecentWorkouts(uid);
    void loadRoutines(uid);
  }, [uid, loadActiveWorkout, loadRecentWorkouts, loadRoutines]);

  useEffect(() => {
    if (!activeWorkout) return;
    if (promptedWorkoutIdRef.current === activeWorkout.id) return;
    const elapsedMs = Date.now() - new Date(activeWorkout.startedAt).getTime();
    if (elapsedMs < STALE_WORKOUT_THRESHOLD_MS) return;
    promptedWorkoutIdRef.current = activeWorkout.id;

    const hours = Math.floor(elapsedMs / 3600000);
    const mins = Math.floor((elapsedMs % 3600000) / 60000);
    const elapsedLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    Alert.alert(
      "¿Te olvidaste de finalizar?",
      `Tu entrenamiento "${activeWorkout.name}" sigue activo desde hace ${elapsedLabel}. ¿Querés ajustar la duración real y guardarlo?`,
      [
        { text: "Seguir entrenando", style: "cancel" },
        {
          text: "Finalizar como está",
          onPress: () => {
            void finishWorkout();
          },
        },
        {
          text: "Editar duración",
          onPress: () => setStaleDurationOpen(true),
        },
      ],
    );
  }, [activeWorkout, finishWorkout]);

  const handleStart = () => {
    if (!uid) {
      console.warn("[Gym] No hay uid — usuario no autenticado");
      return;
    }
    const w = activeWorkout ?? startWorkout(uid);
    if (!w) return;
    navigation.navigate("ActiveWorkout", { workoutId: w.id });
  };

  const openDetail = (entry: Routine | RoutineTemplate) => {
    navigation.navigate("RoutineDetail", {
      kind: entry.isBuiltIn ? "template" : "routine",
      id: entry.id,
    });
  };

  const quickStartList: (Routine | RoutineTemplate)[] = [
    ...routines.slice(0, 3),
    ...mockRoutineTemplates.slice(0, Math.max(0, 3 - routines.length)),
  ];

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
          cardTitle="Rutinas"
          gradientColors={["#1a233a26", "#1a233a14"]}
          borderColor="#1a233a14"
          icon={<ListChecks weight="fill" size={20} color={colors.navy} />}
          iconColor={colors.navy}
          detailsText="Ver todas"
          onViewDetails={() => navigation.navigate("Routines")}
        >
          {quickStartList.length === 0 ? (
            <EmptyState title="No hay rutinas disponibles." style={styles.empty} />
          ) : (
            <View style={styles.routinesList}>
              {quickStartList.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.routineRow}
                  onPress={() => openDetail(entry)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver detalle de ${entry.name}`}
                >
                  <View style={styles.routineRowMain}>
                    <Text style={styles.routineName}>{entry.name}</Text>
                    <Text style={styles.routineMeta}>
                      {entry.exercises.length} ejercicios
                      {entry.isBuiltIn ? " · Plantilla" : ""}
                    </Text>
                  </View>
                  <CaretRight size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <SoftActionButton
            label="Crear rutina"
            onPress={() => navigation.navigate("RoutineEditor", undefined)}
            size="md"
            style={styles.createRoutineBtn}
          />
        </CardContainer>

        <CardContainer
          cardTitle="Historial"
          gradientColors={["#1a233a26", "#1a233a14"]}
          borderColor="#1a233a14"
          icon={<Barbell weight="fill" size={20} color={colors.navy} />}
          iconColor={colors.navy}
          detailsText={recentWorkouts.length > 5 ? "Ver todo" : ""}
          onViewDetails={
            recentWorkouts.length > 5 ? () => navigation.navigate("WorkoutHistory") : undefined
          }
        >
          {isLoadingHistory && recentWorkouts.length === 0 ? (
            <ActivityIndicator style={styles.loader} color={colors.navy} />
          ) : recentWorkouts.length === 0 ? (
            <EmptyState title="Aún no hay entrenamientos completados." style={styles.empty} />
          ) : (
            <View>
              {recentWorkouts.slice(0, 5).map((w, i, arr) => (
                <WorkoutHistoryRow
                  key={w.id}
                  workout={w}
                  onPress={() => navigation.navigate("WorkoutDetail", { workoutId: w.id })}
                  isLast={i === arr.length - 1}
                />
              ))}
            </View>
          )}
        </CardContainer>
      </ScrollView>

      {activeWorkout && (
        <EditDurationModal
          visible={staleDurationOpen}
          initialSeconds={Math.floor(
            (Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000,
          )}
          onClose={() => setStaleDurationOpen(false)}
          onSave={(seconds) => {
            void finishWorkout(seconds);
          }}
          title="¿Cuánto entrenaste?"
          hint="Ajustá la duración real para guardarlo en el historial."
          saveLabel="Guardar y finalizar"
        />
      )}
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
    ...primaryShadow,
  },
  startButtonText: { color: colors.textOnDark, fontSize: 16, fontWeight: "600" },

  routinesList: { marginTop: 4 },
  routineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  routineRowMain: { flex: 1 },
  routineName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 2 },
  routineMeta: { fontSize: 12, color: colors.textMuted },

  createRoutineBtn: { marginTop: 8 },

  loader: { marginVertical: 24 },
  empty: { paddingVertical: 24 },

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
