import { useEffect, useReducer, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useGymStore } from "../store/gymStore";

interface UseRestTimerProgress {
  remaining: number;
  progressAnim: Animated.Value;
}

// Drives the rest timer UI: ticks once per second so `remaining` is fresh,
// and animates `progressAnim` linearly from current progress (0..1) to 1 over
// the remaining time. Shared by RestTimerBanner and RestTimerFullScreen.
//
// `active` lets consumers gate the interval (e.g. only tick when the modal is
// visible). Always pass true for components that are only mounted while active.
export function useRestTimerProgress(active: boolean = true): UseRestTimerProgress {
  const restEndsAt = useGymStore((s) => s.restEndsAt);
  const restDurationSeconds = useGymStore((s) => s.restDurationSeconds);

  const [, forceTick] = useReducer((x: number) => x + 1, 0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active || !restEndsAt) return;
    const id = setInterval(forceTick, 1000);
    return () => clearInterval(id);
  }, [active, restEndsAt]);

  useEffect(() => {
    if (!active || !restEndsAt || restDurationSeconds <= 0) return;
    const totalMs = restDurationSeconds * 1000;
    const remainingMs = Math.max(0, new Date(restEndsAt).getTime() - Date.now());
    const startProgress = Math.max(0, Math.min(1, 1 - remainingMs / totalMs));
    progressAnim.setValue(startProgress);
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: remainingMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [active, restEndsAt, restDurationSeconds, progressAnim]);

  const remaining = restEndsAt
    ? Math.max(0, Math.ceil((new Date(restEndsAt).getTime() - Date.now()) / 1000))
    : 0;

  return { remaining, progressAnim };
}
