import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { MagnifyingGlass, X, Barbell, Info } from "phosphor-react-native";
import { mockExercises } from "../../data/MockExercises";
import { EmptyState } from "../common/EmptyState";
import { colors } from "../../theme/colors";
import { formatLabel } from "../../utils";
import type { Exercise } from "../../types";

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (_exercise: Exercise) => void;
  onShowDetail?: (_exerciseId: string) => void;
}

export function ExercisePickerModal({
  visible,
  onClose,
  onSelect,
  onShowDetail,
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => mockExercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setSearch("");
    onClose();
  };

  const handleInfo = (id: string) => {
    onClose();
    setSearch("");
    onShowDetail?.(id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"] as Edge[]}>
        <View style={styles.header}>
          <Text style={styles.title}>Elegir ejercicio</Text>
          <TouchableOpacity
            onPress={onClose}
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
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <View style={styles.icon}>
                <Barbell size={20} color={colors.navy} weight="fill" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {formatLabel(item.muscleGroup)} · {formatLabel(item.equipment)}
                </Text>
              </View>
              {onShowDetail && (
                <TouchableOpacity
                  hitSlop={10}
                  onPress={() => handleInfo(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver detalle de ${item.name}`}
                  style={styles.infoBtn}
                >
                  <Info size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState title="Ningún ejercicio coincide con la búsqueda." />}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
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
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginVertical: 4,
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 15, fontWeight: "500", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  infoBtn: { padding: 6 },
});
