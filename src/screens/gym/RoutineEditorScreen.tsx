import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Trash, Barbell, ArrowUp, ArrowDown } from "phosphor-react-native";
import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { DurationPickerModal } from "../../components/gym/DurationPickerModal";
import { ExercisePickerModal } from "../../components/gym/ExercisePickerModal";
import { SoftActionButton } from "../../components/common/SoftActionButton";
import { EmptyState } from "../../components/common/EmptyState";
import { cardStyle, primaryShadow } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { formatTime } from "../../utils/workout";
import { makeId } from "../../utils";
import type {
  Exercise,
  GymStackNavigationProp,
  Routine,
  RoutineEditorRouteProp,
  RoutineExercise,
} from "../../types";

export default function RoutineEditorScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const route = useRoute<RoutineEditorRouteProp>();
  const headerHeight = useHeaderHeight();
  const uid = useAuthStore((s) => s.uid);
  const routines = useGymStore((s) => s.routines);
  const saveRoutine = useGymStore((s) => s.saveRoutine);

  const editingId = route.params?.routineId;
  const existing = useMemo(
    () => (editingId ? routines.find((r) => r.id === editingId) : undefined),
    [editingId, routines],
  );

  const restDefaultSeconds = useGymStore((s) => s.restDefaultSeconds);

  const [name, setName] = useState(existing?.name ?? "");
  const [items, setItems] = useState<RoutineExercise[]>(existing?.exercises ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [restEditingId, setRestEditingId] = useState<string | null>(null);

  const restEditingItem = useMemo(
    () => (restEditingId ? items.find((it) => it.id === restEditingId) : null),
    [restEditingId, items],
  );

  const handleAddExercise = (ex: Exercise) => {
    setItems((prev) => [
      ...prev,
      {
        id: makeId("rx"),
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetSets: 3,
        targetReps: 10,
        order: prev.length,
      },
    ]);
  };

  const updateSets = (id: string, value: string) => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n) || n < 1) return;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, targetSets: n } : it)));
  };

  const updateReps = (id: string, value: string) => {
    if (value === "") {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, targetReps: undefined } : it)));
      return;
    }
    const n = parseInt(value, 10);
    if (Number.isNaN(n) || n < 1) return;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, targetReps: n } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id).map((it, i) => ({ ...it, order: i })));
  };

  const setItemRest = (id: string, seconds: number | null) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (seconds === null) {
          const { restSeconds: _r, ...rest } = it;
          void _r;
          return rest;
        }
        return { ...it, restSeconds: Math.max(10, Math.min(600, Math.round(seconds))) };
      }),
    );
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      const swapIdx = idx + direction;
      if (idx < 0 || swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((it, i) => ({ ...it, order: i }));
    });
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Falta el nombre", "Dale un nombre a la rutina antes de guardar.");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Sin ejercicios", "Añade al menos un ejercicio antes de guardar.");
      return;
    }
    if (!uid) return;

    const now = new Date().toISOString();
    const routine: Routine = {
      id: existing?.id ?? makeId("rt"),
      userId: uid,
      name: trimmedName,
      exercises: items,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      isBuiltIn: false,
    };
    await saveRoutine(routine);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Ej. PPL Push, Pierna pesado..."
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Ejercicios</Text>
        {items.length === 0 ? (
          <EmptyState title="Aún no hay ejercicios." />
        ) : (
          items.map((it, i) => (
            <View key={it.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemIcon}>
                  <Barbell size={16} color={colors.navy} weight="fill" />
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {it.exerciseName}
                </Text>
                <View style={styles.orderBtns}>
                  <TouchableOpacity
                    onPress={() => moveItem(it.id, -1)}
                    hitSlop={6}
                    disabled={i === 0}
                    accessibilityLabel="Mover arriba"
                  >
                    <ArrowUp size={16} color={i === 0 ? colors.border : colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => moveItem(it.id, 1)}
                    hitSlop={6}
                    disabled={i === items.length - 1}
                    accessibilityLabel="Mover abajo"
                  >
                    <ArrowDown
                      size={16}
                      color={i === items.length - 1 ? colors.border : colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeItem(it.id)}
                    hitSlop={6}
                    accessibilityLabel="Eliminar ejercicio"
                  >
                    <Trash size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.targetRow}>
                <View style={styles.targetField}>
                  <Text style={styles.targetLabel}>Sets</Text>
                  <TextInput
                    style={styles.targetInput}
                    keyboardType="number-pad"
                    value={String(it.targetSets)}
                    onChangeText={(v) => updateSets(it.id, v)}
                  />
                </View>
                <View style={styles.targetField}>
                  <Text style={styles.targetLabel}>Reps objetivo</Text>
                  <TextInput
                    style={styles.targetInput}
                    keyboardType="number-pad"
                    placeholder="—"
                    placeholderTextColor={colors.textMuted}
                    value={it.targetReps ? String(it.targetReps) : ""}
                    onChangeText={(v) => updateReps(it.id, v)}
                  />
                </View>
                <View style={styles.targetField}>
                  <Text style={styles.targetLabel}>Descanso</Text>
                  <TouchableOpacity
                    style={[
                      styles.targetInput,
                      styles.restCell,
                      it.restSeconds !== undefined && styles.restCellCustom,
                    ]}
                    onPress={() => setRestEditingId(it.id)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Cambiar descanso. Actualmente ${formatTime(it.restSeconds ?? restDefaultSeconds)}`}
                  >
                    <Text
                      style={[
                        styles.restCellText,
                        it.restSeconds !== undefined && styles.restCellTextCustom,
                      ]}
                    >
                      {formatTime(it.restSeconds ?? restDefaultSeconds)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <SoftActionButton
          label="Añadir ejercicio"
          onPress={() => setPickerOpen(true)}
          size="lg"
          style={styles.addBtn}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveBtnText}>{existing ? "Guardar cambios" : "Crear rutina"}</Text>
        </TouchableOpacity>
      </ScrollView>

      <ExercisePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
      />

      <DurationPickerModal
        visible={restEditingItem !== null}
        onClose={() => setRestEditingId(null)}
        initialSeconds={restEditingItem?.restSeconds ?? restDefaultSeconds}
        onSave={(seconds) => {
          if (restEditingItem) setItemRest(restEditingItem.id, seconds);
        }}
        onReset={
          restEditingItem?.restSeconds !== undefined
            ? () => setItemRest(restEditingItem!.id, null)
            : undefined
        }
        title="Descanso del ejercicio"
        hint={
          restEditingItem?.restSeconds !== undefined
            ? 'Personalizado. Tocá "Usar default global" para volver al default.'
            : `Default global: ${formatTime(restDefaultSeconds)}. Cambialo si querés un descanso distinto para este ejercicio.`
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  scrollContent: { padding: 16, paddingBottom: 40 },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },

  itemCard: { ...cardStyle, padding: 14, marginBottom: 10 },
  itemHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  orderBtns: { flexDirection: "row", alignItems: "center", gap: 12 },

  targetRow: { flexDirection: "row", gap: 10 },
  targetField: { flex: 1 },
  targetLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4, fontWeight: "500" },
  targetInput: {
    backgroundColor: colors.pageBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: "center",
  },
  restCell: { alignItems: "center", justifyContent: "center" },
  restCellCustom: { backgroundColor: colors.navy },
  restCellText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  restCellTextCustom: { color: colors.textOnDark, fontWeight: "600" },

  addBtn: { marginTop: 6 },

  saveBtn: {
    marginTop: 18,
    backgroundColor: colors.navy,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    ...primaryShadow,
  },
  saveBtnText: { color: colors.textOnDark, fontSize: 15, fontWeight: "600" },
});
