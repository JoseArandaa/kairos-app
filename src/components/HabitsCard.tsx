import { Flame, Star } from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { mockHabits } from "../data/MockHabits";
import { Habit } from "../types";
import { getDayName, getTodayIndex } from "../utils/dateUtils";
import AnimatedItem from "./common/AnimatedItem";
import { CardContainer } from "./common/CardContainer";
import { ChecklistItem } from "./common/ChecklistItem";

export const HabitsCard = () => {
  const [habits, setHabits] = useState(mockHabits);
  const [loading, setLoading] = useState(true);
  const [exitingId, setExitingId] = useState<string | null>(null);

  const todayHabits = useMemo(() => {
    return habits.map((habit) => {
      const todayIndex = getTodayIndex();
      const isCompleted = habit.completed?.[todayIndex] || false;
      return { ...habit, completedToday: isCompleted };
    });
  }, [habits]);

  const displayHabits = useMemo(() => {
    const activeHabits = todayHabits.filter((h) => !h.completedToday || exitingId === h.id);
    if (exitingId && !activeHabits.some((h) => h.id === exitingId)) {
      const exitingHabit = todayHabits.find((h) => h.id === exitingId);
      if (exitingHabit) {
        return [...activeHabits.slice(0, 3), exitingHabit];
      }
    }
    return activeHabits.slice(0, 4);
  }, [todayHabits, exitingId]);

  useEffect(() => {
    (async () => {
      await new Promise((r) => setTimeout(r, 800));
      setHabits(mockHabits);
      setLoading(false);
    })();
  }, []);

  const handleToggleComplete = (habitId: string) => {
    const h = habits.find((x) => x.id === habitId);
    if (!h) return;
    if (exitingId && exitingId !== habitId) return;

    setExitingId(habitId);

    setHabits((current) =>
      current.map((hab) => {
        if (hab.id !== habitId) return hab;
        const todayIndex = getTodayIndex();
        const comp = Array.isArray(hab.completed) ? [...hab.completed] : [];
        const updated = [...comp];
        updated[todayIndex] = true;

        const currentStreak = typeof hab.streak === "number" ? hab.streak : 0;
        const newStreak = currentStreak + 1;

        return {
          ...hab,
          completed: updated,
          streak: newStreak,
          longestStreak: Math.max(hab.longestStreak || 0, newStreak),
        } as Habit;
      }),
    );
  };

  const shouldShowCompletionMessage = useMemo(() => {
    if (loading) return false;
    const incomplete = todayHabits.filter((h) => !h.completedToday);
    return incomplete.length === 0 && todayHabits.length > 0;
  }, [todayHabits, loading]);

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
      ) : displayHabits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Star size={48} color="#E0E0E0" weight="duotone" />
          </View>
          <Text style={styles.emptyText}>No hay hábitos para hoy</Text>
          <Text style={styles.emptySubtext}>¡Aprovecha para agregar nuevos hábitos!</Text>
        </View>
      ) : (
        <View>
          {displayHabits.map((habit, index) => {
            const isExiting = exitingId === habit.id;
            return (
              <AnimatedItem
                key={habit.id}
                pulse={isExiting}
                isExiting={isExiting}
                delayMs={500}
                durationMs={300}
                onExited={() => setExitingId(null)}
                style={[
                  index === displayHabits.length - 1 && styles.lastTaskItem,
                  { overflow: "hidden" },
                ]}
              >
                <ChecklistItem
                  item={{
                    title: habit.name,
                    ...habit,
                    completed: habit.completedToday,
                    footerSecondaryText: `Racha más larga: ${habit.longestStreak} días`,
                  }}
                  onToggleComplete={handleToggleComplete}
                  type="habit"
                  showStreak
                  showQuantity={!!(habit.quantity != null && habit.measure)}
                  isLastItem={index === displayHabits.length - 1}
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
