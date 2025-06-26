import { create } from "zustand";

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  checkAuth: async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
        {
          method: "GET",
          credentials: "include",
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );
      if (response.ok) {
        const data = await response.json();
        set({
          isAuthenticated: true,
          user: data.user,
          loading: false,
        });
      } else {
        set({ isAuthenticated: false, user: null, loading: false });
      }
    } catch (error) {
      console.error("checkAuth failed:", error);
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        // Empty body for POST request
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },
}));

export default useAuthStore;
