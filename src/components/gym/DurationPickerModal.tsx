import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { ModalShell } from "../common/ModalShell";
import { colors } from "../../theme/colors";

interface DurationPickerModalProps {
  visible: boolean;
  initialSeconds: number;
  onClose: () => void;
  onSave: (_seconds: number) => void;
  onReset?: () => void;
  title: string;
  hint?: string;
  saveLabel?: string;
  resetLabel?: string;
  minSeconds?: number;
  maxSeconds?: number;
}

export function DurationPickerModal({
  visible,
  initialSeconds,
  onClose,
  onSave,
  onReset,
  title,
  hint = "Entre 10 y 600 segundos.",
  saveLabel = "Guardar",
  resetLabel = "Usar default global",
  minSeconds = 10,
  maxSeconds = 600,
}: DurationPickerModalProps) {
  const [draft, setDraft] = useState(String(initialSeconds));

  useEffect(() => {
    if (visible) setDraft(String(initialSeconds));
  }, [visible, initialSeconds]);

  const handleSave = () => {
    const next = parseInt(draft, 10);
    if (!Number.isFinite(next) || next < minSeconds || next > maxSeconds) {
      onClose();
      return;
    }
    onSave(next);
    onClose();
  };

  const secondary = onReset ? { label: resetLabel, onPress: onReset } : undefined;

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={title}
      hint={hint}
      onSave={handleSave}
      saveLabel={saveLabel}
      secondaryAction={secondary}
    >
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          keyboardType="number-pad"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
          maxLength={3}
        />
        <Text style={styles.unit}>segundos</Text>
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.textPrimary,
    backgroundColor: colors.pageBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  unit: { fontSize: 13, color: colors.textSecondary },
});
