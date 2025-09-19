import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

interface AnimatedItemProps {
  children: React.ReactNode;
  pulse?: boolean;
  isExiting?: boolean;
  delayMs?: number;
  durationMs?: number;
  onExited?: () => void;
  style?: StyleProp<ViewStyle>;
  exitTranslateX?: number;
}

export default function AnimatedItem({
  children,
  pulse = false,
  isExiting = false,
  delayMs = 0,
  durationMs = 300,
  onExited,
  style,
  exitTranslateX = 100,
}: AnimatedItemProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pulse) {
      opacity.setValue(0.5);
    }
  }, [pulse, opacity]);

  useEffect(() => {
    if (!isExiting) return;

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: durationMs,
        delay: delayMs,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: exitTranslateX,
        duration: durationMs,
        delay: delayMs,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        opacity.setValue(1);
        translateX.setValue(0);
        onExited?.();
      }
    });

    return () => {
      animation.stop();
    };
  }, [isExiting, delayMs, durationMs, exitTranslateX, onExited, opacity, translateX]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateX }] }, style]}>
      {children}
    </Animated.View>
  );
}
