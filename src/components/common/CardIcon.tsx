import { LinearGradient } from "expo-linear-gradient";
import React, { ReactElement, cloneElement, isValidElement } from "react";
import { ColorValue, StyleProp, View, ViewStyle } from "react-native";

export type IconElement = ReactElement<{
  size?: number;
  color?: string;
  weight?: string;
  [key: string]: any;
}>;

type CardIconProps = {
  children: IconElement;
  size?: number;
  gradientColors: [ColorValue, ColorValue];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  gradientLocations?: [number, number];
  borderColor: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor: string;
};

export default function CardIcon({
  children,
  size = 36,
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
  gradientLocations = [0.01, 0.79],
  borderColor,
  style,
  iconSize = 22,
  iconColor,
}: CardIconProps) {
  return (
    <View style={style}>
      <LinearGradient
        colors={gradientColors}
        start={gradientStart}
        end={gradientEnd}
        locations={gradientLocations}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor,
        }}
      >
        {isValidElement(children) &&
          cloneElement(children, {
            size: iconSize,
            color: iconColor,
            weight: children.props?.weight || "fill",
            ...children.props,
          })}
      </LinearGradient>
    </View>
  );
}
