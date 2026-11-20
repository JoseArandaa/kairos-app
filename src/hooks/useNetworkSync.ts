import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { gymStore, useGymStore } from "../store/gymStore";

function drainPending() {
  const s = gymStore.getState();
  if (s.isOnline && (s.pendingSyncIds.length > 0 || Object.keys(s.pendingRoutineOps).length > 0)) {
    void s.retryPendingSyncs();
  }
}

export function useNetworkSync(): void {
  const setOnline = useGymStore((s) => s.setOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });

    NetInfo.fetch().then((state) => {
      setOnline(!!state.isConnected);
      if (gymStore.persist.hasHydrated()) drainPending();
      else gymStore.persist.onFinishHydration(drainPending);
    });

    return unsubscribe;
  }, [setOnline]);
}
