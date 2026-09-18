import { create } from "zustand";
import type { Employee } from "../types";
import { TOKEN_KEY } from "../services/api";

interface AuthState {
  token: string | null;
  employee: Employee | null;
  setAuth: (token: string, employee: Employee) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser = localStorage.getItem("cafe_admin_user");

let parsedUser: Employee | null = null;
try {
  parsedUser = storedUser ? (JSON.parse(storedUser) as Employee) : null;
} catch {
  parsedUser = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  employee: parsedUser,

  setAuth: (token, employee) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("cafe_admin_user", JSON.stringify(employee));
    set({ token, employee });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("cafe_admin_user");
    set({ token: null, employee: null });
    window.location.href = "/login";
  }
}));
