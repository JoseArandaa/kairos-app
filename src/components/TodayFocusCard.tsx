import { LinearGradient } from "expo-linear-gradient";
import { Check, Sun } from "phosphor-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CardIcon from "./common/CardIcon";

export const TodayFocusCard = () => {
  return (
    <View style={styles.focusCard}>
      <LinearGradient
        colors={["#42495C", "#1A233A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        locations={[0.01, 0.79]}
        style={styles.gradientBackground}
      >
        <View style={styles.focusHeader}>
          <CardIcon
            gradientColors={["rgba(77, 175, 247, 0.1)", "rgba(77, 175, 247, 0.2)"]}
            gradientStart={{ x: 0, y: 0 }}
            gradientEnd={{ x: 1, y: 0 }}
            gradientLocations={[0.01, 0.79]}
            borderColor="#2E5F80"
            iconColor="#4DAFF7"
          >
            <Sun />
          </CardIcon>
          <Text style={styles.focusTitle}>Today's Focus</Text>
        </View>
        <Text style={styles.focusSubtitle}>If you do this, today is a win</Text>
        <View style={styles.taskCard}>
          <View style={styles.taskRow}>
            <TouchableOpacity style={styles.checkButton}>
              <Check size={16} color="#1A233A" weight="bold" />
            </TouchableOpacity>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>Finish UX of Kairos App</Text>
            </View>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>High</Text>
            </View>
          </View>
          <View style={styles.taskFooter}>
            <Text style={styles.taskEstimate}>Estimate: 2 Hours</Text>
            <Text style={styles.dueDate}>Due Date: 16/08/2025</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingBottom: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a233a",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  focusCard: {
    width: "100%",
    marginTop: 30,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientBackground: {
    padding: 24,
  },
  focusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 2,
  },
  focusTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  focusSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 24,
  },
  taskCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskContent: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    textDecorationLine: "line-through",
    textAlign: "left",
    verticalAlign: "top",
    textDecorationColor: "rgba(255, 255, 255, 0.5)",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  taskEstimate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  priorityBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dueDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
