import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { Barbell, Info, Lightbulb } from "phosphor-react-native";
import { findExerciseById } from "../../data/MockExercises";
import { cardStyle } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { formatLabel } from "../../utils";
import type { ExerciseDetailRouteProp } from "../../types";

export default function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const exercise = findExerciseById(route.params.exerciseId);

  if (!exercise) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Ejercicio no encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Barbell size={48} color={colors.navy} weight="fill" />
        </View>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{formatLabel(exercise.muscleGroup)}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{formatLabel(exercise.equipment)}</Text>
          </View>
        </View>
      </View>

      <Section icon={<Info size={18} color={colors.navy} weight="fill" />} title="Instrucciones">
        {exercise.instructions.map((step, i) => (
          <View key={i} style={styles.instructionRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{i + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{step}</Text>
          </View>
        ))}
      </Section>

      {exercise.tips && exercise.tips.length > 0 && (
        <Section icon={<Lightbulb size={18} color={colors.navy} weight="fill" />} title="Consejos">
          {exercise.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Section>
      )}

      <View style={styles.metaSection}>
        <MetaItem label="Músculo principal" value={formatLabel(exercise.muscleGroup)} />
        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <MetaItem
            label="Músculos secundarios"
            value={exercise.secondaryMuscles.map(formatLabel).join(", ")}
          />
        )}
        <MetaItem label="Equipo" value={formatLabel(exercise.equipment)} />
      </View>
    </ScrollView>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  content: { padding: 16 },

  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFoundText: { color: colors.textMuted, fontSize: 14 },

  hero: { alignItems: "center", paddingVertical: 24 },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  chips: { flexDirection: "row", gap: 8 },
  chip: {
    backgroundColor: colors.navySoftBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },

  section: { ...cardStyle, borderRadius: 18, padding: 16, marginTop: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },

  instructionRow: { flexDirection: "row", marginBottom: 12, gap: 12 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepBadgeText: { color: colors.textOnDark, fontSize: 12, fontWeight: "700" },
  instructionText: { flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },

  tipRow: { flexDirection: "row", marginBottom: 8, gap: 8 },
  tipBullet: { color: colors.navy, fontSize: 16, lineHeight: 20 },
  tipText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  metaSection: { marginTop: 14, gap: 8 },
  metaItem: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
  metaValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },
});
