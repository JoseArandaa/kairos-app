import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { ModalShell } from "../common/ModalShell";
import { colors } from "../../theme/colors";

interface EditTitleModalProps {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (_next: string) => void | Promise<void>;
  placeholder?: string;
  maxLength?: number;
  title?: string;
}

export function EditTitleModal({
  visible,
  initialValue,
  onClose,
  onSave,
  placeholder = "Nombre",
  maxLength = 60,
  title = "Editar nombre",
}: EditTitleModalProps) {
  const [draft, setDraft] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setDraft(initialValue);
  }, [visible, initialValue]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === initialValue) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={title}
      onSave={handleSave}
      saveDisabled={saving}
    >
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        autoFocus
        maxLength={maxLength}
        returnKeyType="done"
        onSubmitEditing={handleSave}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.pageBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
