import type { ViewStyle } from "react-native";
import { colors } from "./colors";

export const cardStyle: ViewStyle = {
  backgroundColor: colors.cardBg,
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
};

export const primaryShadow: ViewStyle = {
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
};

export const elevatedShadow: ViewStyle = {
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
};
