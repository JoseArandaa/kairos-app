import React from "react";
import { Text, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native";
import { Plus } from "phosphor-react-native";
import { colors } from "../../theme/colors";

type Size = "sm" | "md" | "lg";

interface SoftActionButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  size?: Size;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const SIZES: Record<
  Size,
  { paddingVertical: number; gap: number; fontSize: number; radius: number; iconSize: number }
> = {
  sm: { paddingVertical: 8, gap: 6, fontSize: 13, radius: 8, iconSize: 14 },
  md: { paddingVertical: 12, gap: 6, fontSize: 14, radius: 10, iconSize: 16 },
  lg: { paddingVertical: 14, gap: 8, fontSize: 15, radius: 12, iconSize: 18 },
};

export function SoftActionButton({
  label,
  onPress,
  icon,
  size = "md",
  style,
  accessibilityLabel,
}: SoftActionButtonProps) {
  const s = SIZES[size];
  const renderedIcon = icon ?? <Plus size={s.iconSize} color={colors.navy} weight="bold" />;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { paddingVertical: s.paddingVertical, gap: s.gap, borderRadius: s.radius },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {renderedIcon}
      <Text style={[styles.label, { fontSize: s.fontSize }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navySoftBg,
  },
  label: { color: colors.textPrimary, fontWeight: "600" },
});
