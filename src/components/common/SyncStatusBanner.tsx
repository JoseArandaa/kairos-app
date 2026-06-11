import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloudSlash, CloudArrowUp, Warning } from "phosphor-react-native";
import { useGymStore } from "../../store/gymStore";
import { colors } from "../../theme/colors";

type Status = "idle" | "syncing" | "offline" | "error";

function getStatus(isOnline: boolean, isSyncing: boolean, pendingCount: number): Status {
  if (!isOnline) return pendingCount > 0 ? "offline" : "idle";
  if (isSyncing) return "syncing";
  if (pendingCount > 0) return "error";
  return "idle";
}

export function SyncStatusBanner() {
  const insets = useSafeAreaInsets();
  const isOnline = useGymStore((s) => s.isOnline);
  const isSyncing = useGymStore((s) => s.isSyncing);
  const pendingCount = useGymStore((s) => s.pendingSyncIds.length);
  const retryPendingSyncs = useGymStore((s) => s.retryPendingSyncs);

  const status = getStatus(isOnline, isSyncing, pendingCount);
  if (status === "idle") return null;

  const top = insets.top;

  if (status === "syncing") {
    return (
      <View style={[styles.banner, styles.bannerSyncing, { top, paddingTop: 8 }]}>
        <ActivityIndicator size="small" color={colors.textOnDark} />
        <Text style={styles.text}>Guardando…</Text>
      </View>
    );
  }

  if (status === "offline") {
    return (
      <View style={[styles.banner, styles.bannerOffline, { top, paddingTop: 8 }]}>
        <CloudSlash size={16} color={colors.textOnDark} weight="fill" />
        <Text style={styles.text} numberOfLines={1}>
          Sin conexión · {pendingCount} {pendingCount === 1 ? "cambio" : "cambios"} pendientes
        </Text>
      </View>
    );
  }

  // status === "error"
  return (
    <TouchableOpacity
      style={[styles.banner, styles.bannerError, { top, paddingTop: 8 }]}
      onPress={() => void retryPendingSyncs()}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Reintentar sincronización"
    >
      <Warning size={16} color={colors.textOnDark} weight="fill" />
      <Text style={styles.text} numberOfLines={1}>
        Error al sincronizar · tocá para reintentar
      </Text>
      <CloudArrowUp size={16} color={colors.textOnDark} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 8,
    zIndex: 9999,
    elevation: 12,
  },
  bannerSyncing: { backgroundColor: colors.navy },
  bannerOffline: { backgroundColor: "#D97706" },
  bannerError: { backgroundColor: colors.danger },
  text: { color: colors.textOnDark, fontSize: 13, fontWeight: "600" },
});
