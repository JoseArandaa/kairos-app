import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Barbell, Lightning, PencilSimple, Trash, Info } from "phosphor-react-native";
import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { mockRoutineTemplates, findTemplateById } from "../../data/MockRoutineTemplates";
import { cardStyle, primaryShadow } from "../../theme/styles";
import { colors } from "../../theme/colors";
import type {
  GymStackNavigationProp,
  Routine,
  RoutineDetailRouteProp,
  RoutineTemplate,
} from "../../types";

export default function RoutineDetailScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const route = useRoute<RoutineDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const routines = useGymStore((s) => s.routines);
  const activeWorkout = useGymStore((s) => s.activeWorkout);
  const startWorkoutFromTemplate = useGymStore((s) => s.startWorkoutFromTemplate);
  const startWorkoutFromRoutine = useGymStore((s) => s.startWorkoutFromRoutine);
  const removeRoutine = useGymStore((s) => s.removeRoutine);

  const entry: Routine | RoutineTemplate | undefined = useMemo(() => {
    if (route.params.kind === "template") {
      return (
        findTemplateById(route.params.id) ??
        mockRoutineTemplates.find((t) => t.id === route.params.id)
      );
    }
    return routines.find((r) => r.id === route.params.id);
  }, [route.params, routines]);

  if (!entry) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>No encontrada.</Text>
      </View>
    );
  }

  const handleStart = () => {
    if (!uid) return;
    const launch = () => {
      const w = entry.isBuiltIn
        ? startWorkoutFromTemplate(uid, entry)
        : startWorkoutFromRoutine(uid, entry);
      navigation.navigate("ActiveWorkout", { workoutId: w.id });
    };
    if (activeWorkout) {
      Alert.alert(
        "Ya hay un entrenamiento activo",
        "Si inicias esta rutina, se descartará el actual.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Descartar y empezar", style: "destructive", onPress: launch },
        ],
      );
    } else {
      launch();
    }
  };

  const handleEdit = () => {
    if (entry.isBuiltIn) return;
    navigation.navigate("RoutineEditor", { routineId: entry.id });
  };

  const handleDelete = () => {
    if (entry.isBuiltIn) return;
    Alert.alert("Eliminar rutina", `¿Borrar "${entry.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await removeRoutine(entry.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const description = !entry.isBuiltIn
    ? `${entry.exercises.length} ejercicios`
    : (entry.description ?? `${entry.exercises.length} ejercicios`);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Lightning size={36} color={colors.navy} weight="fill" />
        </View>
        <Text style={styles.title}>{entry.name}</Text>
        <Text style={styles.subtitle}>{description}</Text>
        {entry.isBuiltIn && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Plantilla</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ejercicios</Text>
        {entry.exercises.map((rx, i) => (
          <TouchableOpacity
            key={rx.id}
            style={[styles.exerciseRow, i === entry.exercises.length - 1 && styles.lastRow]}
            onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: rx.exerciseId })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de ${rx.exerciseName}`}
          >
            <View style={styles.exerciseIcon}>
              <Barbell size={18} color={colors.navy} weight="fill" />
            </View>
            <View style={styles.exerciseMain}>
              <Text style={styles.exerciseName}>{rx.exerciseName}</Text>
              <Text style={styles.exerciseTarget}>
                {rx.targetSets} × {rx.targetReps ?? "—"}
              </Text>
            </View>
            <Info size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {!entry.isBuiltIn && (
        <View style={styles.ownerActions}>
          <TouchableOpacity
            style={[styles.secondaryBtn, styles.editBtn]}
            onPress={handleEdit}
            activeOpacity={0.85}
          >
            <PencilSimple size={16} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, styles.deleteBtn]}
            onPress={handleDelete}
            activeOpacity={0.85}
          >
            <Trash size={16} color={colors.danger} />
            <Text style={[styles.secondaryBtnText, { color: colors.danger }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.startBtn}
        onPress={handleStart}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Iniciar entrenamiento"
      >
        <Lightning size={20} color={colors.textOnDark} weight="fill" />
        <Text style={styles.startBtnText}>Iniciar entrenamiento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  scrollContent: { padding: 16, paddingBottom: 120 },

  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { color: colors.textMuted, fontSize: 14 },

  hero: { alignItems: "center", paddingVertical: 24 },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
  },
  badge: {
    marginTop: 12,
    backgroundColor: colors.navySoftBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: colors.textPrimary },

  section: { ...cardStyle, borderRadius: 18, padding: 16, marginTop: 14 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  lastRow: { borderBottomWidth: 0 },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseMain: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: "500", color: colors.textPrimary },
  exerciseTarget: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  ownerActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtn: {},
  deleteBtn: { borderColor: colors.danger },
  secondaryBtnText: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.navy,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 18,
    ...primaryShadow,
  },
  startBtnText: { color: colors.textOnDark, fontSize: 16, fontWeight: "600" },
});
