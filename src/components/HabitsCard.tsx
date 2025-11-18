import { Flame, Star } from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth } from "../services/firebase";
import { createHabitCheckin } from "../services/habitCheckin";
import { getHabitsAndCheckinsByUserIdAndDate } from "../services/habits";
import { HabitForHome, HomeStackParamList } from "../types";
import { getDayName, getTodayIndex } from "../utils/dateUtils";
import AnimatedItem from "./common/AnimatedItem";
import { CardContainer } from "./common/CardContainer";
import { ChecklistItem } from "./common/ChecklistItem";
import { format } from "date-fns";

type HabitsCardNavigationProp = StackNavigationProp<HomeStackParamList, "HomeMain">;

export const HabitsCard = () => {
  const navigation = useNavigation<HabitsCardNavigationProp>();
  const [habits, setHabits] = useState<HabitForHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [exitingId, setExitingId] = useState<string | null>(null);

  useEffect(() => {
    console.log("useEffect");
    (async () => {
      const habitsResponse = await getHabitsAndCheckinsByUserIdAndDate(
        auth.currentUser?.uid || "",
        format(new Date(), "dd-MM-yyyy"),
      );
      if (habitsResponse) setHabits(habitsResponse);
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
        // Revertir cambios si falla
        setHabits((current) =>
          current.map((hab) => {
            if (hab.id !== habitId) return hab;
            const currentStreak = typeof hab.streak === "number" ? hab.streak : 0;
            return {
              ...hab,
              streak: Math.max(0, currentStreak - 1),
            } as HabitForHome;
          }),
        );
        setExitingId(null);
        throw new Error(res.message);
      }

      // Actualizar el estado del hábito con el nuevo checkin completado
      const todayDate = format(new Date(), "dd-MM-yyyy");
      const now = new Date().toISOString();

      setHabits((current) =>
        current.map((hab) => {
          if (hab.id !== habitId) return hab;

          // Agregar el nuevo checkin con completed: true
          // La respuesta del backend puede tener res.data con el checkin completo o solo el id
          const newCheckin =
            res.data && typeof res.data === "object" && "id" in res.data
              ? {
                  id: res.data.id,
                  habitId: habitId,
                  date: res.data.date || todayDate,
                  completed: res.data.completed !== undefined ? res.data.completed : true,
                  quantity: res.data.quantity || 1,
                  notes: res.data.notes || "",
                  createdAt: res.data.createdAt || now,
                }
              : {
                  id: res.data?.id || "",
                  habitId: habitId,
                  date: todayDate,
                  completed: true,
                  quantity: 1,
                  notes: "",
                  createdAt: now,
                };

          return {
            ...hab,
            checkins: [...hab.checkins, newCheckin],
          } as HabitForHome;
        }),
      );

      setExitingId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const displayHabits = useMemo(() => {
    return habits.filter((habit) => {
      // Mostrar hábitos que no tienen check-ins
      if (habit.checkins.length === 0) return true;
      // Si tiene check-ins, mostrar solo si el checkin más reciente tiene completed: false
      const latestCheckin = habit.checkins[habit.checkins.length - 1];
      return !latestCheckin.completed;
    });
  }, [habits]);

  const shouldShowCompletionMessage = useMemo(() => {
    if (loading) return false;
    // Mostrar mensaje de completado solo si todos los hábitos tienen check-ins completados
    if (habits.length > 0) {
      return habits.every((habit) => {
        if (habit.checkins.length === 0) return false;
        return habit.checkins.every((checkin) => checkin.completed);
      });
    }
    return false;
  }, [habits, loading]);

  return (
    <CardContainer
      gradientColors={["#F443364D", "#F4433633"]}
      borderColor="#F4433614"
      cardTitle={"Habits " + getDayName(getTodayIndex())}
      onViewDetails={() => navigation.navigate("HabitsScreen")}
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
      ) : habits?.length === 0 ? (
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

              // Obtener el estado de completado del checkin más reciente (si existe)
              const latestCheckin =
                habit.checkins.length > 0 ? habit.checkins[habit.checkins.length - 1] : null;
              const isCompleted = latestCheckin?.completed || false;

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
                      completed: isCompleted,
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
