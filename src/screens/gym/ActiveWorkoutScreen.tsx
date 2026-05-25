import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets, type Edge } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Plus, Check, MagnifyingGlass, X, Barbell } from "phosphor-react-native";
import { useGymStore } from "../../store/gymStore";
import { mockExercises } from "../../data/MockExercises";
import { ExerciseBlock } from "../../components/gym/ExerciseBlock";
import { colors } from "../../theme/colors";
import { formatLabel } from "../../utils";
import type { Exercise, GymStackNavigationProp } from "../../types";

export default function ActiveWorkoutScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const activeWorkout = useGymStore((s) => s.activeWorkout);
  const addExerciseToActive = useGymStore((s) => s.addExerciseToActive);
  const addSet = useGymStore((s) => s.addSet);
  const toggleSetCompleted = useGymStore((s) => s.toggleSetCompleted);
  const removeSet = useGymStore((s) => s.removeSet);
  const finishWorkout = useGymStore((s) => s.finishWorkout);
  const cancelWorkout = useGymStore((s) => s.cancelWorkout);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredExercises = useMemo(
    () => mockExercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

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
    await finishWorkout();
    navigation.goBack();
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

  const handleSelectExercise = (exercise: Exercise) => {
    addExerciseToActive(exercise);
    setPickerOpen(false);
    setSearch("");
  };

  const footerBottom = insets.bottom + 12;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: footerBottom + 80 }]}
        keyboardShouldPersistTaps="handled"
      >
        {activeWorkout.exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Barbell size={48} color={colors.border} weight="duotone" />
            <Text style={styles.emptyTitle}>Aún no hay ejercicios</Text>
            <Text style={styles.emptySubtitle}>Añade tu primer ejercicio para empezar.</Text>
          </View>
        ) : (
          activeWorkout.exercises.map((ex) => (
            <ExerciseBlock
              key={ex.id}
              exercise={ex}
              onAddSet={(weight, reps) => addSet(ex.id, weight, reps)}
              onToggleSet={(setId) => toggleSetCompleted(ex.id, setId)}
              onRemoveSet={(setId) => removeSet(ex.id, setId)}
            />
          ))
        )}

        <TouchableOpacity
          style={styles.addExerciseBtn}
          onPress={() => setPickerOpen(true)}
          activeOpacity={0.85}
        >
          <Plus size={18} color={colors.navy} weight="bold" />
          <Text style={styles.addExerciseText}>Añadir ejercicio</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { bottom: footerBottom }]}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} activeOpacity={0.9}>
          <Check size={18} color={colors.textOnDark} weight="bold" />
          <Text style={styles.finishBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={pickerOpen}
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"] as Edge[]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Elegir ejercicio</Text>
            <TouchableOpacity
              onPress={() => setPickerOpen(false)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Cerrar selector de ejercicio"
            >
              <X size={24} color={colors.navy} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <MagnifyingGlass size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ejercicio..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.exerciseListContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseRow}
                onPress={() => handleSelectExercise(item)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseIcon}>
                  <Barbell size={20} color={colors.navy} weight="fill" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {formatLabel(item.muscleGroup)} · {formatLabel(item.equipment)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>Ningún ejercicio coincide con la búsqueda.</Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  emptyState: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, textAlign: "center" },
  emptyText: { color: colors.textMuted, textAlign: "center", marginVertical: 20 },

  addExerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.navySoftBg,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  addExerciseText: { color: colors.textPrimary, fontWeight: "600", fontSize: 15 },

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  finishBtnText: { color: colors.textOnDark, fontWeight: "600", fontSize: 15 },

  modalContainer: { flex: 1, backgroundColor: colors.pageBg },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary, padding: 0 },

  exerciseListContent: { paddingHorizontal: 16, paddingBottom: 24 },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginVertical: 4,
    gap: 12,
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseName: { fontSize: 15, fontWeight: "500", color: colors.textPrimary },
  exerciseMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: { textAlign: "center", color: colors.textMuted, paddingVertical: 24, fontSize: 14 },
});
