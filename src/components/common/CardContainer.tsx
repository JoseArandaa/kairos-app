import React from "react";
import { ColorValue, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CardIcon from "./CardIcon";

interface CardContainerProps {
  cardTitle?: React.ReactNode;
  onViewDetails?: () => void;
  gradientColors?: [ColorValue, ColorValue];
  icon?: React.ReactElement;
  iconColor?: string;
  borderColor?: string;
  detailsText?: string;
  children?: React.ReactNode;
  style?: any;
  onViewAll?: () => void;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  cardTitle,
  onViewDetails,
  onViewAll,
  gradientColors,
  icon,
  iconColor,
  borderColor,
  detailsText = "View Details",
  children,
  style,
}: CardContainerProps) => {
  const handleViewDetails = onViewDetails || onViewAll;
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <CardIcon
            gradientColors={gradientColors}
            style={styles.iconBg}
            iconColor={iconColor}
            borderColor={borderColor}
          >
            {icon}
          </CardIcon>
          <Text style={styles.goalTitle}>{cardTitle}</Text>
        </View>
        <TouchableOpacity
          onPress={handleViewDetails}
          activeOpacity={0.7}
          disabled={!handleViewDetails}
        >
          <Text style={styles.detailsText}>{detailsText}</Text>
        </TouchableOpacity>
      </View>
      <>{children}</>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginTop: 32,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a233a",
  },
  detailsText: {
    fontSize: 15,
    color: "#7f8c8d",
    fontWeight: "500",
  },
});
