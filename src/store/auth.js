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
        }
      );
      if (response.status === 200) {
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
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },
}));

export default useAuthStore;
