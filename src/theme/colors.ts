export const colors = {
  // Brand
  navy: "#1a233a",
  navySoftBg: "#EEF0F4",

  // Backgrounds
  pageBg: "#f5f5f5",
  cardBg: "#ffffff",

  // Text
  textPrimary: "#1a233a",
  textSecondary: "#757575",
  textMuted: "#9E9E9E",
  textOnDark: "#ffffff",

  // Borders
  border: "#E0E0E0",
  borderSoft: "#F0F0F0",

  // Semantic
  success: "#4CAF50",
  successBg: "#E8F5E9",
  danger: "#F44336",
  dangerBg: "#FFEBEE",
  dangerText: "#C62828",
} as const;

export type ColorToken = keyof typeof colors;
