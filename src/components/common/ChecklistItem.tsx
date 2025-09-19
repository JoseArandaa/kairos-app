import { Check, Clock, Flag, Flame } from "phosphor-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

const formatTime = (date?: Date | number | string): string => {
  if (!date) return "";
  try {
    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "number") {
      dateObj = new Date(date);
    } else if (typeof date === "string") {
      if (date.includes("T") || date.includes(" ")) {
        dateObj = new Date(date);
      } else {
        const num = parseInt(date, 10);
        dateObj = Number.isNaN(num) ? new Date(date) : new Date(num);
      }
    } else {
      return "";
    }

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
};

import { BaseItem, ChecklistItemProps, Priority } from "../../types";

interface ChecklistItemPropsInternal<T extends BaseItem> extends ChecklistItemProps<T> {
  style?: StyleProp<ViewStyle>;
  isAnimatingOut?: boolean;
  isLastItem?: boolean;
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "high":
      return "#FF6B6B";
    case "medium":
      return "#FFD93D";
    case "low":
      return "#6BCB77";
    default:
      return "#6BCB77";
  }
};

export const ChecklistItem = <T extends BaseItem>({
  item,
  onToggleComplete,
  style,
  isAnimatingOut = false,
  type = "task",
  showStreak = false,
  isLastItem = false,
}: ChecklistItemPropsInternal<T>) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isAnimatingOut) {
      animationRef.current = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -500,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

      animationRef.current.start(({ finished }) => {
        if (finished) {
          onToggleComplete(item.id);
        }
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      slideAnim.setValue(0);
    };
  }, [isAnimatingOut, item.id, onToggleComplete, fadeAnim, scaleAnim, slideAnim]);

  const hasQty = item.quantity != null && item.measure;

  return (
    <Animated.View
      style={[
        styles.taskItem,
        !isLastItem && styles.taskItemWithBorder,
        item.completed && styles.completedTask,
        style,
        isAnimatingOut && {
          transform: [{ translateX: slideAnim }],
          opacity: slideAnim.interpolate({
            inputRange: [-500, 0],
            outputRange: [0, 1],
          }),
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.completedTask]}
        onPress={() => onToggleComplete(item.id)}
      >
        {item.completed && <Check size={16} color={"#bdbdbd"} weight={"bold"} />}
      </TouchableOpacity>

      <View style={[styles.taskInfo]}>
        <View style={[styles.headerRow, { justifyContent: "flex-start" }]}>
          <Text style={[styles.title, item.completed && styles.completedText]} numberOfLines={1}>
            {item.title}
          </Text>

          {hasQty && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityText}>
                {item.quantity} {item.measure}
              </Text>
            </View>
          )}

          {item.priority && (
            <View
              style={[styles.priority, { backgroundColor: `${getPriorityColor(item.priority)}20` }]}
            >
              {type === "task" && (
                <Flag size={12} color={getPriorityColor(item.priority)} weight="fill" />
              )}
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority?.charAt(0).toUpperCase() + item.priority?.slice(1) || "Normal"}
              </Text>
            </View>
          )}
        </View>

        {/* Segunda línea bajo el título */}
        {item.description && !hasQty && (
          <Text
            style={[styles.description, item.completed && styles.completedText]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        <View style={[styles.footer]}>
          {item.dueTimestamp && (
            <View style={[styles.dueDate]}>
              <Clock size={14} color={"#7F8C8D"} weight={"bold"} />
              <Text style={[styles.dueDateText]}>
                Due Date:&nbsp;{formatTime(item.dueTimestamp)}
              </Text>
            </View>
          )}

          {showStreak && "streak" in item && item.streak != null && (
            <View style={styles.streakContainer}>
              <Flame size={14} color="#FF6D00" weight="fill" />
              <Text style={styles.streakText}>{item.streak} días</Text>
            </View>
          )}
          {item.footerSecondaryText && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.dueDateText, { marginLeft: 8 }]}>|</Text>
              <Text style={[styles.dueDateText, { marginLeft: 8 }]}>
                {item.footerSecondaryText}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  completedTask: {
    opacity: 0.8,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#BDBDBD",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
    borderColor: "#BDBDBD",
    backgroundColor: "transparent",
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 2,
    gap: 8,
    justifyContent: "space-between",
    alignContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A233A",
    marginBottom: 2,
    alignContent: "center",
  },
  description: {
    fontSize: 12,
    color: "#7F8C8D",
    maxWidth: "75%",
    marginBottom: 6,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  dueDate: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  dueDateText: {
    fontSize: 11,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  priority: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
    marginBottom: 4,
  },
  streakText: {
    fontSize: 12,
    color: "#FF6D00",
    marginLeft: 4,
    fontWeight: "500",
  },
  quantityContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
    alignSelf: "center",
  },
  quantityText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
});
