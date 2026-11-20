import { useEffect } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { gymStore, useGymStore } from "../store/gymStore";

function drainPending() {
  const s = gymStore.getState();
  if (s.isOnline && (s.pendingSyncIds.length > 0 || Object.keys(s.pendingRoutineOps).length > 0)) {
    void s.retryPendingSyncs();
  }
}

// `null` means NetInfo hasn't resolved yet: only a definite `false` counts as offline.
const isReachable = (state: NetInfoState) =>
  state.isConnected !== false && state.isInternetReachable !== false;

export function useNetworkSync(): void {
  const setOnline = useGymStore((s) => s.setOnline);

  useEffect(() => {
    let unsubscribeHydration: (() => void) | undefined;
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(isReachable(state));
    });

    NetInfo.fetch().then((state) => {
      setOnline(isReachable(state));
      if (gymStore.persist.hasHydrated()) drainPending();
      else unsubscribeHydration = gymStore.persist.onFinishHydration(drainPending);
    });

    return () => {
      unsubscribe();
      unsubscribeHydration?.();
    };
  }, [setOnline]);
}
