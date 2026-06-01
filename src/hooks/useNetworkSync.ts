import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { gymStore, useGymStore } from "../store/gymStore";

export function useNetworkSync(): void {
  const setOnline = useGymStore((s) => s.setOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });

    NetInfo.fetch().then((state) => {
      const isConnected = !!state.isConnected;
      setOnline(isConnected);
      // On startup: if we come online and have pending changes, drain.
      // setOnline only auto-drains on transition; this covers the initial fetch.
      if (isConnected) {
        const s = gymStore.getState();
        if (s.pendingSyncIds.length > 0) void s.retryPendingSyncs();
      }
    });

    return unsubscribe;
  }, [setOnline]);
}
