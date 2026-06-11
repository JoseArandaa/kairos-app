import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Clock, CaretRight } from "phosphor-react-native";
import { colors } from "../../theme/colors";
import { formatDuration, formatShortDate, totalVolume } from "../../utils/workout";
import type { Workout } from "../../types";

interface WorkoutHistoryRowProps {
  workout: Workout;
  onPress: () => void;
  isLast?: boolean;
}

export function WorkoutHistoryRow({ workout, onPress, isLast = false }: WorkoutHistoryRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${workout.name}`}
    >
      <View style={styles.main}>
        <Text style={styles.name}>{workout.name}</Text>
        <View style={styles.metaRow}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={styles.meta}>
            {formatDuration(workout.durationSeconds)} · {workout.exercises.length} ejercicios
          </Text>
        </View>
      </View>
      <View style={styles.side}>
        <Text style={styles.date}>{formatShortDate(workout.startedAt)}</Text>
        <Text style={styles.volume}>{totalVolume(workout).toLocaleString()} kg</Text>
      </View>
      <CaretRight size={16} color={colors.textMuted} style={styles.caret} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowLast: { borderBottomWidth: 0 },
  main: { flex: 1 },
  side: { alignItems: "flex-end" },
  name: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 12, color: colors.textMuted },
  date: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  volume: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  caret: { marginLeft: 8 },
});
