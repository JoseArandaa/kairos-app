import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from "react-native";
import { Timer } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import { useGymStore } from "../../store/gymStore";
import { useRestTimerProgress } from "../../hooks/useRestTimerProgress";
import { elevatedShadow } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { formatTime } from "../../utils/workout";

interface RestTimerBannerProps {
  bottom: number;
  onExpand: () => void;
}

const ALERT_PATTERN = [0, 600, 200, 600, 200, 600, 200, 600];

function fireRestEndAlert() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  Vibration.vibrate(ALERT_PATTERN, false);
}

export function RestTimerBanner({ bottom, onExpand }: RestTimerBannerProps) {
  const restEndsAt = useGymStore((s) => s.restEndsAt);
  const adjustRest = useGymStore((s) => s.adjustRest);
  const skipRest = useGymStore((s) => s.skipRest);

  const { remaining, progressAnim } = useRestTimerProgress();
  const hapticFiredRef = useRef(false);

  useEffect(() => {
    hapticFiredRef.current = false;
  }, [restEndsAt]);

  useEffect(() => {
    if (!restEndsAt || remaining > 0) return;
    if (!hapticFiredRef.current) {
      hapticFiredRef.current = true;
      fireRestEndAlert();
    }
    const t = setTimeout(skipRest, 2000);
    return () => clearTimeout(t);
  }, [restEndsAt, remaining, skipRest]);

  if (!restEndsAt) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.banner, { bottom }]}>
      <TouchableOpacity
        style={styles.row}
        onPress={onExpand}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Expandir cronómetro de descanso"
      >
        <Timer size={18} color={colors.textOnDark} weight="fill" />
        <Text style={styles.time}>{formatTime(remaining)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => adjustRest(-15)}
            style={styles.actionBtn}
            activeOpacity={0.7}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Restar 15 segundos"
          >
            <Text style={styles.actionText}>−15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={skipRest}
            style={[styles.actionBtn, styles.skipBtn]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Saltar descanso"
          >
            <Text style={[styles.actionText, styles.skipText]}>Saltar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => adjustRest(15)}
            style={styles.actionBtn}
            activeOpacity={0.7}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Sumar 15 segundos"
          >
            <Text style={styles.actionText}>+15</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: colors.navy,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...elevatedShadow,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  time: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textOnDark,
    fontVariant: ["tabular-nums"],
    minWidth: 56,
  },
  actions: { flex: 1, flexDirection: "row", justifyContent: "flex-end", gap: 6 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  actionText: { color: colors.textOnDark, fontWeight: "600", fontSize: 13 },
  skipBtn: { backgroundColor: "rgba(255,255,255,0.2)" },
  skipText: { fontWeight: "700" },

  progressTrack: {
    marginTop: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.textOnDark },
});
