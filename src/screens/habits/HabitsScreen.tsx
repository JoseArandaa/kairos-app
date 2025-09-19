import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Check, Plus, Flame } from "phosphor-react-native";
import { Habit, HomeStackParamList } from "../../types";

type HabitsScreenRouteProp = RouteProp<HomeStackParamList, "HabitsScreen">;

type TimeRange = "week" | "month" | "quarter" | "year" | "all";

const HabitsScreen = () => {
  const route = useRoute<HabitsScreenRouteProp>();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [habits, setHabits] = useState<Habit[]>(route.params?.habits || []);

  const daysOfWeek = ["D", "L", "M", "X", "J", "V", "S"];
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];

    if (timeRange === "week") {
      const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - currentDay); // Start from Sunday

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push({
          date: date.getDate(),
          day: daysOfWeek[i],
          month: months[date.getMonth()],
          fullDate: date,
        });
      }
    } else if (timeRange === "month") {
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push({
          date: i,
          day: daysOfWeek[date.getDay()],
          month: months[month],
          fullDate: date,
        });
      }
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const toggleHabitCompletion = (habitId: string, dayIndex: number) => {
    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id === habitId) {
          const newCompleted = [...habit.completed];
          newCompleted[dayIndex] = !newCompleted[dayIndex];

          let newStreak = habit.currentStreak;
          if (newCompleted[dayIndex]) {
            newStreak += 1;
          } else {
            newStreak = Math.max(0, habit.currentStreak - 1);
          }

          return {
            ...habit,
            completed: newCompleted,
            currentStreak: newStreak,
            lastUpdated: new Date().toISOString(),
          };
        }
        return habit;
      }),
    );
  };

  const getDayStatus = (habit: Habit, dayIndex: number) => {
    if (dayIndex >= habit.completed.length) return "disabled";
    return habit.completed[dayIndex] ? "completed" : "pending";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.timeRangeSelector}>
        {(["week", "month", "quarter", "year", "all"] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.rangeButton, timeRange === range && styles.activeRangeButton]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.rangeText, timeRange === range && styles.activeRangeText]}>
              {range === "week"
                ? "Semana"
                : range === "month"
                  ? "Mes"
                  : range === "quarter"
                    ? "Trimestre"
                    : range === "year"
                      ? "Año"
                      : "Todo"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.calendarHeader}>
          <View style={styles.habitNameHeader}>
            <Text style={styles.headerText}>Hábito</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysHeader}
          >
            {calendarDays.map((day, index) => (
              <View key={index} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day.day}</Text>
                <Text style={styles.dayHeaderNumber}>{day.date}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {habits.map((habit, habitIndex) => (
          <View
            key={habit.id}
            style={[styles.habitRow, habitIndex < habits.length - 1 && styles.habitDivider]}
          >
            <View style={styles.habitNameCell}>
              <Text style={styles.habitName} numberOfLines={1}>
                {habit.name}
              </Text>
              <View style={styles.streakContainer}>
                <Flame size={14} color="#FF7043" weight="fill" />
                <Text style={styles.streakText}>{habit.currentStreak}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daysContainer}
            >
              {calendarDays.map((day, dayIndex) => {
                const status = getDayStatus(habit, dayIndex);
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      status === "completed" && styles.dayCellCompleted,
                      status === "disabled" && styles.dayCellDisabled,
                    ]}
                    onPress={() => toggleHabitCompletion(habit.id, dayIndex)}
                    disabled={status === "disabled"}
                  >
                    {status === "completed" && <Check size={12} color="#FFF" weight="bold" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => console.log("Add new habit")}>
        <Plus size={20} color="#4CAF50" weight="bold" />
        <Text style={styles.addButtonText}>Nuevo Hábito</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A233A",
  },
  timeRangeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#FFF",
    marginBottom: 8,
  },
  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeRangeButton: {
    backgroundColor: "#4CAF50",
  },
  rangeText: {
    fontSize: 12,
    color: "#757575",
    fontWeight: "500",
  },
  activeRangeText: {
    color: "#FFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  calendarHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 12,
  },
  habitNameHeader: {
    width: 120,
    justifyContent: "center",
    paddingLeft: 16,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  daysHeader: {
    flexDirection: "row",
    paddingRight: 16,
  },
  dayHeader: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayHeaderText: {
    fontSize: 10,
    color: "#9E9E9E",
    marginBottom: 2,
  },
  dayHeaderNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A233A",
  },
  habitRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  habitDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  habitNameCell: {
    width: 120,
    marginRight: 16,
  },
  habitName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A233A",
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F2",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E64A19",
    marginLeft: 2,
  },
  daysContainer: {
    flexDirection: "row",
    paddingRight: 16,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCellCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F8E9",
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default HabitsScreen;
