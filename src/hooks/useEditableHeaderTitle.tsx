import React, { useLayoutEffect } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PencilSimple } from "phosphor-react-native";
import { colors } from "../theme/colors";

export function useEditableHeaderTitle(name: string, onPress: () => void): void {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    if (!name) return;
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          onPress={onPress}
          style={styles.btn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Editar nombre. Actualmente ${name}`}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={styles.text} numberOfLines={1}>
            {name}
          </Text>
          <PencilSimple size={14} color={colors.textMuted} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, name, onPress]);
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    maxWidth: 240,
  },
  text: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    flexShrink: 1,
  },
});
