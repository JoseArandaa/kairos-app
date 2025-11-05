import { Flame, Star } from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { auth } from "../services/firebase";
import { createHabitCheckin } from "../services/habitCheckin";
import { getHabitsAndCheckinsByUserIdAndDate } from "../services/habits";
import { HabitForHome } from "../types";
import { getDayName, getTodayIndex } from "../utils/dateUtils";
import AnimatedItem from "./common/AnimatedItem";
import { CardContainer } from "./common/CardContainer";
import { ChecklistItem } from "./common/ChecklistItem";
import { format } from "date-fns";

export const HabitsCard = () => {
  const [habits, setHabits] = useState<HabitForHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [exitingId, setExitingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const habits = await getHabitsAndCheckinsByUserIdAndDate(
        auth.currentUser?.uid || "",
        format(new Date(), "dd-MM-yyyy"),
      );
      console.log(format(new Date(), "dd-MM-yyyy"));
      console.log("habits", habits);
      // await new Promise((r) => setTimeout(r, 800));
      setHabits(habits as HabitForHome[]);
      setLoading(false);
    })();
  }, []);

  const handleToggleComplete = async (habitId: string) => {
    const h = habits.find((x) => x.id === habitId);
    if (!h) return;
    if (exitingId && exitingId !== habitId) return;

    setExitingId(habitId);

    try {
      setHabits((current) =>
        current.map((hab) => {
          if (hab.id !== habitId) return hab;

          const currentStreak = typeof hab.streak === "number" ? hab.streak : 0;
          const newStreak = currentStreak + 1;

          return {
            ...hab,
            streak: newStreak,
            longestStreak: Math.max(hab.longestStreak || 0, newStreak),
          } as HabitForHome;
        }),
      );

      const res = await createHabitCheckin({ habitId });
      console.log("res", res);
      if (!res.success) {
        throw new Error(res.message);
      }
      setExitingId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const displayHabits = useMemo(() => {
    return habits.filter((habit) => habit.checkins.length > 0);
  }, [habits]);

  const shouldShowCompletionMessage = useMemo(() => {
    if (loading) return false;
    return habits.every((habit) => habit.checkins.length > 0);
  }, [habits, loading]);

  return (
    <CardContainer
      gradientColors={["#F443364D", "#F4433633"]}
      borderColor="#F4433614"
      cardTitle={"Habits " + getDayName(getTodayIndex())}
      onViewDetails={() => {}}
      icon={<Flame weight="fill" size={20} color="#F44336" />}
      iconColor="#F44336"
    >
      {loading ? (
        <Text style={styles.loadingText}>Cargando hábitos...</Text>
      ) : shouldShowCompletionMessage ? (
        <View style={styles.completionMessage}>
          <Text style={styles.completionText}>🎉 ¡Todos los hábitos completados!</Text>
          <Text style={styles.completionSubtext}>
            ¡Buen trabajo! Los nuevos hábitos aparecerán aquí.
          </Text>
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Star size={48} color="#E0E0E0" weight="duotone" />
          </View>
          <Text style={styles.emptyText}>No hay hábitos para hoy</Text>
          <Text style={styles.emptySubtext}>¡Aprovecha para agregar nuevos hábitos!</Text>
        </View>
      ) : (
        <View>
          {displayHabits.length > 0 &&
            displayHabits.map((habit, index) => {
              const isExiting = exitingId === habit.id;

              if (habit.checkins.length > 0) return null;
              return (
                <AnimatedItem
                  key={habit.id}
                  pulse={isExiting}
                  isExiting={isExiting}
                  delayMs={500}
                  durationMs={300}
                  onExited={() => setExitingId(null)}
                  style={[
                    index === habits.length - 1 && styles.lastTaskItem,
                    { overflow: "hidden" },
                  ]}
                >
                  <ChecklistItem
                    item={{
                      title: habit.name,
                      ...habit,
                      completed: habit.checkins[0]?.completed || false,
                      footerSecondaryText: `Racha más larga: ${habit.longestStreak} días`,
                    }}
                    onToggleComplete={handleToggleComplete}
                    type="habit"
                    showStreak
                    showQuantity={!!(habit.quantity != null && habit.measure)}
                    isLastItem={index === habits.length - 1}
                  />
                </AnimatedItem>
              );
            })}
        </View>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  cardContainer: { marginBottom: 16 },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIllustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 16,
    maxWidth: "80%",
  },
  loadingText: { textAlign: "center", color: "#7F8C8D", padding: 16 },
  completionMessage: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  completionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 4,
  },
  completionSubtext: { fontSize: 12, color: "#7F8C8D", textAlign: "center" },
  lastTaskItem: {
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    marginBottom: 0,
    paddingBottom: 0,
  },
  viewMoreText: {
    textAlign: "center",
    color: "#4CAF50",
    padding: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
