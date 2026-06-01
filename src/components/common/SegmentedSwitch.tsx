import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, type LayoutChangeEvent } from "react-native";
import { colors } from "../../theme/colors";

interface SegmentedSwitchOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedSwitchProps<T extends string> {
  options: ReadonlyArray<SegmentedSwitchOption<T>>;
  value: T;
  onChange: (_value: T) => void;
}

export function SegmentedSwitch<T extends string>({
  options,
  value,
  onChange,
}: SegmentedSwitchProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  useEffect(() => {
    Animated.timing(indicatorAnim, {
      toValue: activeIndex,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, indicatorAnim]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const tabWidth = options.length > 0 ? containerWidth / options.length : 0;
  const inputRange = options.map((_, i) => i);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {tabWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth,
              transform: [
                {
                  translateX: indicatorAnim.interpolate({
                    inputRange,
                    outputRange: inputRange.map((i) => i * tabWidth),
                  }),
                },
              ],
            },
          ]}
        />
      )}
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt.value}
          style={styles.tab}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ selected: value === opt.value }}
          accessibilityLabel={opt.label}
        >
          <Animated.Text
            style={[
              styles.tabText,
              {
                color: indicatorAnim.interpolate({
                  inputRange,
                  outputRange: inputRange.map((j) =>
                    j === i ? colors.textOnDark : colors.textSecondary,
                  ),
                }),
              },
            ]}
            numberOfLines={1}
          >
            {opt.label}
          </Animated.Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.navy,
    position: "relative",
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.navy,
    borderRadius: 16,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  tabText: { fontSize: 14, fontWeight: "600" },
});
