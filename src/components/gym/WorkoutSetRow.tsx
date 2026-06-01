import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Check, Trash } from "phosphor-react-native";
import { colors } from "../../theme/colors";
import type { WorkoutSet } from "../../types";

interface WorkoutSetRowProps {
  set: WorkoutSet;
  index: number;
  onUpdate: (_partial: Partial<Pick<WorkoutSet, "weight" | "reps" | "completed">>) => void;
  onDelete: () => void;
}

export function WorkoutSetRow({ set, index, onUpdate, onDelete }: WorkoutSetRowProps) {
  const [weight, setWeight] = useState(String(set.weight));
  const [reps, setReps] = useState(String(set.reps));

  useEffect(() => {
    setWeight(String(set.weight));
  }, [set.weight]);

  useEffect(() => {
    setReps(String(set.reps));
  }, [set.reps]);

  const commitWeight = () => {
    const w = parseFloat(weight.replace(",", "."));
    if (Number.isFinite(w) && w >= 0 && w !== set.weight) {
      onUpdate({ weight: w });
    } else {
      setWeight(String(set.weight));
    }
  };

  const commitReps = () => {
    const r = parseInt(reps, 10);
    if (Number.isFinite(r) && r >= 0 && r !== set.reps) {
      onUpdate({ reps: r });
    } else {
      setReps(String(set.reps));
    }
  };

  const handleToggle = () => onUpdate({ completed: !set.completed });

  const handleDelete = () => {
    Alert.alert("Eliminar serie", "¿Seguro que querés borrarla?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View
      style={[styles.row, { backgroundColor: set.completed ? colors.navySoftBg : "transparent" }]}
    >
      <Text style={[styles.cellSet, styles.numberText]}>{index + 1}</Text>
      <TextInput
        style={[styles.cellInput, styles.cellWeight, !set.completed && styles.cellInputDim]}
        value={weight}
        onChangeText={setWeight}
        onBlur={commitWeight}
        onSubmitEditing={commitWeight}
        keyboardType="decimal-pad"
        selectTextOnFocus
        returnKeyType="done"
        maxLength={6}
      />
      <TextInput
        style={[styles.cellInput, styles.cellReps, !set.completed && styles.cellInputDim]}
        value={reps}
        onChangeText={setReps}
        onBlur={commitReps}
        onSubmitEditing={commitReps}
        keyboardType="number-pad"
        selectTextOnFocus
        returnKeyType="done"
        maxLength={3}
      />
      <TouchableOpacity
        style={styles.cellStatus}
        onPress={handleToggle}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={set.completed ? "Desmarcar serie" : "Marcar serie"}
        accessibilityState={{ checked: set.completed }}
      >
        <View style={[styles.dotBase, set.completed ? styles.dotDone : styles.dotPending]}>
          {set.completed && <Check size={11} color={colors.textOnDark} weight="bold" />}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.trashBtn}
        onPress={handleDelete}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Eliminar serie"
      >
        <Trash size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    marginVertical: 2,
    overflow: "hidden",
  },
  cellSet: { width: 28 },
  numberText: { fontSize: 13, color: colors.textMuted, textAlign: "center" },
  cellInput: {
    backgroundColor: colors.pageBg,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  cellInputDim: { color: colors.textMuted },
  cellWeight: { flex: 1 },
  cellReps: { flex: 1 },
  cellStatus: { width: 30, alignItems: "center" },
  dotBase: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: colors.navy },
  dotPending: { borderWidth: 1.5, borderColor: colors.border },
  trashBtn: { paddingHorizontal: 4, paddingVertical: 4 },

  headerRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});

export function WorkoutSetTableHeader() {
  return (
    <View style={styles.headerRow}>
      <Text style={[styles.headerText, styles.cellSet]}>Set</Text>
      <Text style={[styles.headerText, styles.cellWeight]}>kg</Text>
      <Text style={[styles.headerText, styles.cellReps]}>reps</Text>
      <View style={styles.cellStatus} />
      <View style={styles.trashBtn} />
    </View>
  );
}
