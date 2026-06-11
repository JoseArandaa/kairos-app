import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Trash, PencilSimple, CaretRight } from "phosphor-react-native";
import { useAuthStore } from "../../store/authStore";
import { useGymStore } from "../../store/gymStore";
import { mockRoutineTemplates } from "../../data/MockRoutineTemplates";
import { SegmentedSwitch } from "../../components/common/SegmentedSwitch";
import { SoftActionButton } from "../../components/common/SoftActionButton";
import { EmptyState } from "../../components/common/EmptyState";
import { cardStyle } from "../../theme/styles";
import { colors } from "../../theme/colors";
import type { GymStackNavigationProp, Routine, RoutineTemplate } from "../../types";

type Tab = "mine" | "templates";

export default function RoutinesScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const uid = useAuthStore((s) => s.uid);
  const routines = useGymStore((s) => s.routines);
  const isLoadingRoutines = useGymStore((s) => s.isLoadingRoutines);
  const loadRoutines = useGymStore((s) => s.loadRoutines);
  const removeRoutine = useGymStore((s) => s.removeRoutine);

  const [tab, setTab] = useState<Tab>("mine");

  useEffect(() => {
    if (uid) void loadRoutines(uid);
  }, [uid, loadRoutines]);

  const openDetail = (entry: Routine | RoutineTemplate) => {
    navigation.navigate("RoutineDetail", {
      kind: entry.isBuiltIn ? "template" : "routine",
      id: entry.id,
    });
  };

  const handleDelete = (routine: Routine) => {
    Alert.alert("Eliminar rutina", `¿Borrar "${routine.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeRoutine(routine.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <SegmentedSwitch<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "mine", label: "Mis rutinas" },
            { value: "templates", label: "Plantillas" },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tab === "mine" ? (
          <>
            {isLoadingRoutines && routines.length === 0 ? (
              <ActivityIndicator style={styles.loader} color={colors.navy} />
            ) : routines.length === 0 ? (
              <EmptyState
                title="Aún no tienes rutinas"
                subtitle="Crea una desde cero o copia una plantilla."
              />
            ) : (
              routines.map((r) => (
                <RoutineCard
                  key={r.id}
                  name={r.name}
                  subtitle={`${r.exercises.length} ejercicios`}
                  onPress={() => openDetail(r)}
                  onEdit={() => navigation.navigate("RoutineEditor", { routineId: r.id })}
                  onDelete={() => handleDelete(r)}
                />
              ))
            )}

            <SoftActionButton
              label="Crear rutina"
              onPress={() => navigation.navigate("RoutineEditor", undefined)}
              size="lg"
              style={styles.createBtn}
            />
          </>
        ) : (
          mockRoutineTemplates.map((t) => (
            <RoutineCard
              key={t.id}
              name={t.name}
              subtitle={t.description ?? `${t.exercises.length} ejercicios`}
              onPress={() => openDetail(t)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface RoutineCardProps {
  name: string;
  subtitle: string;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function RoutineCard({ name, subtitle, onPress, onEdit, onDelete }: RoutineCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${name}`}
    >
      <View style={styles.cardMain}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.cardActions}>
        {onEdit && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onEdit}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Editar rutina"
          >
            <PencilSimple size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onDelete}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Eliminar rutina"
          >
            <Trash size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
        <CaretRight size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },

  tabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  scrollContent: { padding: 16, paddingBottom: 120 },

  card: {
    ...cardStyle,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cardMain: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: colors.textMuted },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: { padding: 6 },

  createBtn: { marginTop: 8 },

  loader: { marginVertical: 40 },
});
