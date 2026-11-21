import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { X, Check } from "phosphor-react-native";
import { colors } from "../../theme/colors";

interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  secondaryAction?: { label: string; onPress: () => void };
}

export function ModalShell({
  visible,
  onClose,
  title,
  hint,
  children,
  onSave,
  saveLabel = "Guardar",
  saveDisabled = false,
  secondaryAction,
}: ModalShellProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          {hint && <Text style={styles.hint}>{hint}</Text>}
          <View style={styles.body}>{children}</View>
          {onSave && (
            <TouchableOpacity
              style={[styles.saveBtn, saveDisabled && styles.saveBtnDisabled]}
              onPress={onSave}
              activeOpacity={0.9}
              disabled={saveDisabled}
            >
              <Check size={16} color={colors.textOnDark} weight="bold" />
              <Text style={styles.saveBtnText}>{saveLabel}</Text>
            </TouchableOpacity>
          )}
          {secondaryAction && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={secondaryAction.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>{secondaryAction.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 420,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  body: { marginTop: 6, marginBottom: 14 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.navy,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.textOnDark, fontSize: 14, fontWeight: "600" },
  secondaryBtn: { paddingVertical: 10, alignItems: "center", marginTop: 4 },
  secondaryBtnText: { color: colors.textSecondary, fontSize: 13, fontWeight: "500" },
});
