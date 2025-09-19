import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Barbell, CalendarBlank, House, User, Wallet } from "phosphor-react-native";

const { width } = Dimensions.get("window");
const HEIGHT = 70;

const BUTTON_RADIUS = 35;
const CUTOUT_RADIUS = 42;
const GAP = 5;

const BAR_COLOR = "#1a233a";
const ICON_ACTIVE = "#fff";
const ICON_INACTIVE = "#95a5a6";

const getPath = (w: number): string => {
  const center = w / 2;
  return `
    M 0,0
    H ${center - CUTOUT_RADIUS}
    A ${CUTOUT_RADIUS},${CUTOUT_RADIUS} 0 0 0 ${center + CUTOUT_RADIUS},0
    H ${w}
    V ${HEIGHT}
    H 0
    Z
  `;
};

interface HomeButtonProps {
  onPress: () => void;
  isFocused: boolean;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onPress, isFocused }) => (
  <View pointerEvents="box-none" style={styles.homeBtnContainer}>
    <TouchableOpacity
      onPress={onPress}
      style={styles.homeBtn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.85}
    >
      <House size={38} color={"#f5f5f5"} weight={isFocused ? "fill" : "regular"} />
    </TouchableOpacity>
  </View>
);

export const CurvedTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const path = useMemo(() => getPath(width), [width]);

  return (
    <View pointerEvents="box-none" style={styles.tabBarContainer}>
      <Svg width={width} height={HEIGHT} style={styles.svg}>
        <Path d={path} fill={BAR_COLOR} />
      </Svg>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isHomeTab = route.name === "Home";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isHomeTab) {
          return <HomeButton key={route.key} onPress={onPress} isFocused={isFocused} />;
        }

        const color = isFocused ? ICON_ACTIVE : ICON_INACTIVE;
        const weight: "fill" | "regular" = isFocused ? "fill" : "regular";

        const iconFor = (name: string) => {
          switch (name) {
            case "Calendar":
              return <CalendarBlank size={32} weight={weight} color={color} />;
            case "Profile":
              return <User size={32} weight={weight} color={color} />;
            case "Wallet":
              return <Wallet size={32} weight={weight} color={color} />;
            case "Gym":
              return <Barbell size={32} weight={weight} color={color} />;
            default:
              return null;
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.regularTab, { left: index * (width / 5) }]}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            activeOpacity={0.85}
          >
            {iconFor(route.name)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: HEIGHT,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  svg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  homeBtnContainer: {
    position: "absolute",
    top: -(CUTOUT_RADIUS - GAP),
    left: "50%",
    transform: [{ translateX: -BUTTON_RADIUS }],
    zIndex: 2,
  },
  homeBtn: {
    width: BUTTON_RADIUS * 2,
    height: BUTTON_RADIUS * 2,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: BAR_COLOR,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  regularTab: {
    position: "absolute",
    top: 0,
    width: "20%",
    height: HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
