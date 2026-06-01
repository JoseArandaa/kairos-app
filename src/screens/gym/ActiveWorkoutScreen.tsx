import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets, type Edge } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Check, Barbell, Timer } from "phosphor-react-native";
import { useGymStore } from "../../store/gymStore";
import { ExerciseBlock } from "../../components/gym/ExerciseBlock";
import { EditTitleModal } from "../../components/gym/EditTitleModal";
import { RestTimerBanner } from "../../components/gym/RestTimerBanner";
import { RestTimerFullScreen } from "../../components/gym/RestTimerFullScreen";
import { RestSettingsModal } from "../../components/gym/RestSettingsModal";
import { ExercisePickerModal } from "../../components/gym/ExercisePickerModal";
import { EmptyState } from "../../components/common/EmptyState";
import { SoftActionButton } from "../../components/common/SoftActionButton";
import { useEditableHeaderTitle } from "../../hooks/useEditableHeaderTitle";
import { findLastSetForExercise } from "../../utils/workout";
import { primaryShadow } from "../../theme/styles";
import { colors } from "../../theme/colors";
import type { GymStackNavigationProp } from "../../types";

export default function ActiveWorkoutScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const activeWorkout = useGymStore((s) => s.activeWorkout);
  const recentWorkouts = useGymStore((s) => s.recentWorkouts);
  const addExerciseToWorkout = useGymStore((s) => s.addExerciseToWorkout);
  const addWorkoutSet = useGymStore((s) => s.addWorkoutSet);
  const editWorkoutSet = useGymStore((s) => s.editWorkoutSet);
  const removeWorkoutSet = useGymStore((s) => s.removeWorkoutSet);
  const startRest = useGymStore((s) => s.startRest);
  const finishWorkout = useGymStore((s) => s.finishWorkout);
  const cancelWorkout = useGymStore((s) => s.cancelWorkout);
  const renameWorkout = useGymStore((s) => s.renameWorkout);
  const restEndsAt = useGymStore((s) => s.restEndsAt);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [titleEditOpen, setTitleEditOpen] = useState(false);
  const [restFullOpen, setRestFullOpen] = useState(false);
  const [restSettingsOpen, setRestSettingsOpen] = useState(false);

  const workoutName = activeWorkout?.name ?? "";

  const openTitleEdit = useCallback(() => setTitleEditOpen(true), []);
  useEditableHeaderTitle(workoutName, openTitleEdit);

  useLayoutEffect(() => {
    if (!activeWorkout) return;
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (restEndsAt) setRestFullOpen(true);
            else setRestSettingsOpen(true);
          }}
          style={styles.headerRightBtn}
          activeOpacity={0.7}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={restEndsAt ? "Abrir cronómetro de descanso" : "Configurar descanso"}
        >
          <Timer size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, activeWorkout, restEndsAt]);

  if (!activeWorkout) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"] as Edge[]}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay entrenamiento activo.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleFinish = async () => {
    if (activeWorkout.exercises.length === 0) {
      Alert.alert("Entrenamiento vacío", "Añade al menos un ejercicio para poder finalizar.", [
        { text: "Entendido" },
      ]);
      return;
    }
    const hasAnyCompletedSet = activeWorkout.exercises.some((ex) =>
      ex.sets.some((s) => s.completed),
    );
    if (!hasAnyCompletedSet) {
      Alert.alert(
        "Sin series completadas",
        "Registra al menos una serie completada antes de finalizar.",
        [{ text: "Entendido" }],
      );
      return;
    }
    const incompleteCount = activeWorkout.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => !s.completed).length,
      0,
    );
    const finalize = () => {
      navigation.goBack();
      void finishWorkout();
    };
    if (incompleteCount > 0) {
      const label =
        incompleteCount === 1 ? "1 serie sin completar" : `${incompleteCount} series sin completar`;
      Alert.alert(
        "Finalizar entrenamiento",
        `${label} ${incompleteCount === 1 ? "será eliminada" : "serán eliminadas"} del registro. ¿Continuar?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Finalizar", onPress: finalize },
        ],
      );
      return;
    }
    finalize();
  };

  const handleCancel = () => {
    Alert.alert("Cancelar entrenamiento", "Se perderán los datos no guardados.", [
      { text: "Volver", style: "cancel" },
      {
        text: "Cancelar entreno",
        style: "destructive",
        onPress: async () => {
          await cancelWorkout();
          navigation.goBack();
        },
      },
    ]);
  };

  const footerBottom = insets.bottom + 12;
  const footerHeight = 60;
  const restBannerBottom = footerBottom + footerHeight + 8;
  const scrollBottomPadding = footerBottom + footerHeight + (restEndsAt ? 90 : 20);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        {activeWorkout.exercises.length === 0 ? (
          <EmptyState
            icon={<Barbell size={48} color={colors.border} weight="duotone" />}
            title="Aún no hay ejercicios"
            subtitle="Añade tu primer ejercicio para empezar."
            style={styles.emptyState}
          />
        ) : (
          activeWorkout.exercises.map((ex) => (
            <ExerciseBlock
              key={ex.id}
              workoutId={activeWorkout.id}
              exercise={ex}
              onAddSet={() => {
                const lastInThis = ex.sets[ex.sets.length - 1];
                const fallback = lastInThis
                  ? { weight: lastInThis.weight, reps: lastInThis.reps }
                  : findLastSetForExercise(ex.exerciseId, recentWorkouts);
                addWorkoutSet(activeWorkout.id, ex.id, fallback?.weight ?? 0, fallback?.reps ?? 0);
              }}
              onUpdateSet={(setId, partial) => {
                const prev = ex.sets.find((s) => s.id === setId);
                editWorkoutSet(activeWorkout.id, ex.id, setId, partial);
                if (partial.completed === true && prev && !prev.completed) {
                  startRest(ex.restSeconds);
                }
              }}
              onDeleteSet={(setId) => removeWorkoutSet(activeWorkout.id, ex.id, setId)}
            />
          ))
        )}

        <SoftActionButton label="Añadir ejercicio" onPress={() => setPickerOpen(true)} size="lg" />
      </ScrollView>

      <RestTimerBanner bottom={restBannerBottom} onExpand={() => setRestFullOpen(true)} />

      <View style={[styles.footer, { bottom: footerBottom }]}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} activeOpacity={0.9}>
          <Check size={18} color={colors.textOnDark} weight="bold" />
          <Text style={styles.finishBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <ExercisePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(ex) => addExerciseToWorkout(activeWorkout.id, ex)}
      />

      <EditTitleModal
        visible={titleEditOpen}
        initialValue={workoutName}
        onClose={() => setTitleEditOpen(false)}
        onSave={(next) => renameWorkout(activeWorkout.id, next)}
        title="Editar entrenamiento"
      />

      <RestSettingsModal visible={restSettingsOpen} onClose={() => setRestSettingsOpen(false)} />

      <RestTimerFullScreen visible={restFullOpen} onClose={() => setRestFullOpen(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  headerRightBtn: { paddingHorizontal: 12, paddingVertical: 6 },

  emptyState: { paddingVertical: 60, paddingHorizontal: 32 },
  emptyText: { color: colors.textMuted, textAlign: "center", marginVertical: 20 },

  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { color: colors.textSecondary, fontWeight: "600", fontSize: 15 },
  finishBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...primaryShadow,
  },
  finishBtnText: { color: colors.textOnDark, fontWeight: "600", fontSize: 15 },
});
