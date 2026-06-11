import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, StatusBar, Animated } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { X, Gear } from "phosphor-react-native";
import { useGymStore } from "../../store/gymStore";
import { useRestTimerProgress } from "../../hooks/useRestTimerProgress";
import { RestSettingsModal } from "./RestSettingsModal";
import { colors } from "../../theme/colors";
import { formatTime } from "../../utils/workout";

interface RestTimerFullScreenProps {
  visible: boolean;
  onClose: () => void;
}

const SIZE = 280;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RestTimerFullScreen({ visible, onClose }: RestTimerFullScreenProps) {
  const restEndsAt = useGymStore((s) => s.restEndsAt);
  const adjustRest = useGymStore((s) => s.adjustRest);
  const skipRest = useGymStore((s) => s.skipRest);

  const { remaining, progressAnim } = useRestTimerProgress(visible);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (visible && !restEndsAt) onClose();
  }, [visible, restEndsAt, onClose]);

  const handleSkip = () => {
    skipRest();
    onClose();
  };

  const dashOffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CIRCUMFERENCE],
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"] as Edge[]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Minimizar"
            style={styles.headerBtn}
          >
            <X size={26} color={colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Descanso</Text>
          <TouchableOpacity
            onPress={() => setSettingsOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Configurar duración"
            style={styles.headerBtn}
          >
            <Gear size={24} color={colors.textOnDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.ringWrap}>
            <Svg width={SIZE} height={SIZE} style={styles.ring}>
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <AnimatedCircle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={colors.textOnDark}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={`${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            </Svg>
            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={styles.timeText}>{formatTime(remaining)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => adjustRest(-15)}
              style={styles.smallBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Restar 15 segundos"
            >
              <Text style={styles.smallBtnText}>−15</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Saltar descanso"
            >
              <Text style={styles.skipBtnText}>Saltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => adjustRest(15)}
              style={styles.smallBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sumar 15 segundos"
            >
              <Text style={styles.smallBtnText}>+15</Text>
            </TouchableOpacity>
          </View>
        </View>

        <RestSettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: { width: 40, alignItems: "center" },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textOnDark,
    letterSpacing: 0.3,
  },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: { position: "absolute" },
  ringCenter: { alignItems: "center", justifyContent: "center" },
  timeText: {
    fontSize: 80,
    fontWeight: "700",
    color: colors.textOnDark,
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 48,
  },
  smallBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    minWidth: 80,
    alignItems: "center",
  },
  smallBtnText: {
    color: colors.textOnDark,
    fontWeight: "600",
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  skipBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  skipBtnText: {
    color: colors.textOnDark,
    fontWeight: "700",
    fontSize: 16,
  },
});
