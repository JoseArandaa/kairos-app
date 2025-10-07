import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { authStore } from "../store/authStore";
import { userStore } from "../store/userStore";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          // Firebase v9+: refreshToken lives on user.stsTokenManager.refreshToken
          // Types may not expose it; cast to access safely.
          const anyUser = firebaseUser as User;
          const refreshToken: string | null = anyUser?.refreshToken ?? null;
          const uid: string = firebaseUser.uid;
          const email: string | null = firebaseUser.email ?? null;
          const displayName: string | null = firebaseUser.displayName ?? null;

          authStore.getState().setAuthFromFirebase({ uid, refreshToken, email, displayName });
          userStore.getState().setProfile({
            uid,
            email,
            displayName,
            photoURL: firebaseUser?.photoURL ?? null,
          });
        } else {
          authStore.getState().clearAuth();
          userStore.getState().clear();
        }
        setLoading(false);
      },
      (err) => {
        console.error("Auth state error:", err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};
