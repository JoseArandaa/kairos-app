import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { CardContainer } from "./common/CardContainer";
import { Flag } from "phosphor-react-native";
import { Task } from "../types";
import { sortByPriority, sortByDueDate } from "../utils/index";
import { ChecklistItem } from "./common/ChecklistItem";
import { mockTasks } from "../data/MockTask";
import AnimatedItem from "./common/AnimatedItem";

export const OpenTaskCard = () => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState<string[] | null>(null);

  const topPriorityTasks = useMemo(() => {
    let list = allTasks.filter((t) => !t.completed || exitingId === t.id);

    list = sortByPriority(list);
    list = sortByDueDate(list);

    if (displayOrder && exitingId) {
      const allowed = new Set(displayOrder);
      list = list.filter((t) => allowed.has(t.id));
      list.sort((a, b) => displayOrder.indexOf(a.id) - displayOrder.indexOf(b.id));
      list = list.slice(0, displayOrder.length);
    } else {
      list = list.slice(0, 4);
    }

    return list;
  }, [allTasks, exitingId, displayOrder]);

  // Mock fetch
  // TODO implement endpoint
  useEffect(() => {
    (async () => {
      await new Promise((r) => setTimeout(r, 800));
      setAllTasks(mockTasks);
      setLoading(false);
    })();
  }, []);

  const handleToggleComplete = (taskId: string) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (exitingId && exitingId !== taskId) return;

    setDisplayOrder(topPriorityTasks.map((t) => t.id));
    setExitingId(taskId);

    setAllTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, completed: true } : t)));
  };

  const handleExited = () => {
    setExitingId(null);
    setDisplayOrder(null);
  };

  const shouldShowCompletionMessage = useMemo(() => {
    if (loading) return false;
    const incomplete = allTasks.filter((t) => !t.completed);
    return incomplete.length === 0 && allTasks.length > 0;
  }, [allTasks, loading]);

  return (
    <CardContainer
      cardTitle="Priority Tasks"
      onViewDetails={() => {}}
      gradientColors={["#f5a85d4d", "#f5a85d33"]}
      icon={<Flag weight="fill" />}
      iconColor="#F5A85D"
      borderColor="#F5A85D14"
    >
      {loading ? (
        <Text style={styles.loadingText}>Loading tasks...</Text>
      ) : shouldShowCompletionMessage ? (
        <View style={styles.completionMessage}>
          <Text style={styles.completionText}>🎉 All tasks completed!</Text>
          <Text style={styles.completionSubtext}>Great job! New tasks will appear here.</Text>
        </View>
      ) : topPriorityTasks.length === 0 ? (
        <View style={styles.completionMessage}>
          <Text style={styles.completionText}>No tasks to show</Text>
          <Text style={styles.completionSubtext}>Add new tasks to get started.</Text>
        </View>
      ) : (
        <View>
          {topPriorityTasks.map((task, index) => {
            const isExiting = exitingId === task.id;
            return (
              <AnimatedItem
                key={task.id}
                pulse={isExiting}
                isExiting={isExiting}
                delayMs={500}
                durationMs={300}
                onExited={handleExited}
                style={[
                  index === topPriorityTasks.length - 1 && styles.lastTaskItem,
                  { overflow: "hidden" },
                ]}
              >
                <ChecklistItem
                  item={task}
                  onToggleComplete={handleToggleComplete}
                  isLastItem={index === topPriorityTasks.length - 1}
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
  lastTaskItem: { borderBottomWidth: 0 },
  loadingText: { textAlign: "center", color: "#7F8C8D", padding: 16 },
  completionMessage: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  completionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6BCB77",
    textAlign: "center",
    marginBottom: 4,
  },
  completionSubtext: { fontSize: 12, color: "#7F8C8D", textAlign: "center" },
});
