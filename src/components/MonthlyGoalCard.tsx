import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendUp } from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CardContainer } from "./common/CardContainer";

interface MonthlyGoalCardProps {
  CardTitle?: string;
  goalDesc?: string;
  progressPercent?: number;
  completedTasks?: number;
  totalTasks?: number;
  onViewDetails?: () => void;
}

export const MonthlyGoalCard: React.FC<MonthlyGoalCardProps> = ({
  CardTitle = "Monthly Goal",
  goalDesc = "Finish Kairos MVP",
  progressPercent = 75,
  completedTasks = 3,
  totalTasks = 12,
  onViewDetails,
}) => {
  const progress = Math.min(Math.max(progressPercent, 0), 100);
  const progressRatio = progress / 100;

  return (
    <CardContainer
      cardTitle={CardTitle}
      onViewDetails={onViewDetails}
      gradientColors={["#D1FADF", "#F0FDF4"]}
      icon={<TrendUp weight="bold" />}
      iconColor="#22C55E"
      borderColor="#C9EFD2"
      detailsText="View Details"
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.goalDesc}>{goalDesc}</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressInfoLeft}>
            <Text style={styles.progressPercent}>{progress}%</Text>
            <Text style={styles.completionLabel}>completion</Text>
          </View>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          alignItems: "flex-end",
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        <Text style={styles.tasksText}>
          {completedTasks}/{totalTasks} Tasks complete
        </Text>
      </View>
      <View style={styles.progressBarTrack}>
        <LinearGradient
          colors={["#42495C", "#1A233A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          locations={[0.01, 0.79]}
          style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]}
        />
      </View>
      <View style={styles.progressLabelsRow}>
        <Text style={styles.progressLabel}>Started</Text>
        <Text style={styles.progressLabelCenter}>Peak Impact Zone</Text>
        <Text style={styles.progressLabelRight}>Complete</Text>
      </View>
    </CardContainer>
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
  goalDesc: {
    fontSize: 18,
    color: "#29384b",
    fontWeight: "500",
    alignSelf: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressInfoLeft: {
    flexDirection: "column",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 28,
    color: "#1a233a",
    fontWeight: "700",
    marginRight: 6,
  },
  completionLabel: {
    fontSize: 13,
    color: "#7f8c8d",
    fontWeight: "400",
  },
  tasksText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#7f8c8d",
  },
  progressBarTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 12,
    borderRadius: 8,
  },
  progressLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  progressLabel: {
    fontSize: 13,
    color: "#A0AEC0",
    fontWeight: "500",
  },
  progressLabelCenter: {
    fontSize: 15,
    color: "#29384b",
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  progressLabelRight: {
    fontSize: 13,
    color: "#A0AEC0",
    fontWeight: "500",
    textAlign: "right",
  },
});
