import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Lightning } from "phosphor-react-native";
import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { EditDurationModal } from "../../components/gym/EditDurationModal";
import { primaryShadow } from "../../theme/styles";
import { colors } from "../../theme/colors";
import type { GymStackNavigationProp } from "../../types";

const STALE_WORKOUT_THRESHOLD_MS = 5 * 60 * 60 * 1000;

export default function GymHomeScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const uid = useAuthStore((s) => s.uid);
  const activeWorkout = useGymStore((s) => s.activeWorkout);
  const error = useGymStore((s) => s.error);
  const startWorkout = useGymStore((s) => s.startWorkout);
  const loadActiveWorkout = useGymStore((s) => s.loadActiveWorkout);
  const finishWorkout = useGymStore((s) => s.finishWorkout);
  const clearError = useGymStore((s) => s.clearError);

  const [staleDurationOpen, setStaleDurationOpen] = useState(false);
  const promptedWorkoutIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    void loadActiveWorkout(uid);
  }, [uid, loadActiveWorkout]);

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
