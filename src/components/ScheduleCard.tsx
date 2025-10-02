import { Clock } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CardContainer } from "./common/CardContainer";
import { mockScheduleData } from "../data/MockSchedule";
import { Schedule } from "../types";
import { getSchedulesByUserId } from "../services/schedules";
import { useUserStore } from "../store/userStore";

const parseISODate = (dateString: string): Date => {
  return new Date(dateString);
};

const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISODate(date) : date;
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const ScheduleCard = () => {
  const [upcomingSlots, setUpcomingSlots] = useState<Schedule[]>([]);

  const userId = useUserStore((state) => state.profile?.uid);

  useEffect(() => {
    // TODO implement endpoint
    const fetchSchedule = async () => {
      try {
        const data: Schedule[] = await getSchedulesByUserId(userId);

        console.log("data", data);

        const currentTime = new Date();

        const sortedSlots = [...data].sort(
          (a, b) => parseISODate(a.time).getTime() - parseISODate(b.time).getTime(),
        );

        const activeIndex = sortedSlots.findIndex(
          (slot) => parseISODate(slot.time).getTime() > currentTime.getTime(),
        );

        const nextSlots = sortedSlots.slice(
          Math.max(0, activeIndex === -1 ? sortedSlots.length - 4 : activeIndex),
          Math.min(sortedSlots.length, (activeIndex === -1 ? sortedSlots.length : activeIndex) + 4),
        );

        if (nextSlots.length < 4 && sortedSlots.length > 4) {
          setUpcomingSlots(sortedSlots.slice(-4));
        } else {
          setUpcomingSlots(nextSlots);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setUpcomingSlots(mockScheduleData.slice(0, 4));
      }
    };

    fetchSchedule();

    const interval = setInterval(fetchSchedule, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <CardContainer
      cardTitle="Today's Schedule"
      onViewDetails={() => {}}
      gradientColors={["#F2E5FF", "#F9F0FF"]}
      icon={<Clock weight="fill" />}
      iconColor="#9B51E0"
      borderColor="#E8D4FF"
    >
      <View style={styles.timeSlots}>
        {upcomingSlots.map((slot, index) => (
          <View key={slot.id} style={styles.timeSlot}>
            <View style={styles.timeIndicator}>
              <View style={[styles.timeDot, slot.isActive && styles.activeDot]} />
              {index < upcomingSlots.length - 1 && (
                <View style={[styles.timeLine, slot.isActive && styles.activeTimeLine]} />
              )}
            </View>
            <View style={styles.timeContent}>
              <Text style={[styles.time, slot.isActive && styles.activeTime]}>
                {formatTime(slot.time)}
              </Text>
              <Text style={[styles.timeLabel, slot.isActive && styles.activeLabel]}>
                {slot.label}
              </Text>
            </View>
          </View>
        ))}

        {upcomingSlots.length === 0 && <Text style={styles.noSlotsText}>No upcoming schedule</Text>}
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  timeSlots: {
    marginTop: 12,
  },
  timeSlot: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timeIndicator: {
    alignItems: "center",
    width: 24,
  },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    marginBottom: 4,
  },
  activeDot: {
    backgroundColor: "#9B51E0",
    borderWidth: 2,
    borderColor: "#C48AFF",
    width: 14,
    height: 14,
    marginLeft: -2,
  },
  timeLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  activeTimeLine: {
    backgroundColor: "#9B51E0",
  },
  timeContent: {
    marginLeft: 16,
  },
  time: {
    fontSize: 14,
    color: "#BDBDBD",
    fontWeight: "500",
    marginBottom: 2,
  },
  activeTime: {
    color: "#9B51E0",
    fontWeight: "600",
  },
  timeLabel: {
    fontSize: 16,
    color: "#828282",
  },
  activeLabel: {
    color: "#333",
    fontWeight: "500",
  },
  noSlotsText: {
    color: "#BDBDBD",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
});
