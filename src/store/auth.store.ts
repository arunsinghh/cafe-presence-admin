import { create } from "zustand";
import type { Employee } from "../types";

interface AuthState {
  token: string | null;
  employee: Employee | null;
  setAuth: (
    token: string,
    employee: Employee
  ) => void;
  logout: () => void;
}

const storedToken =
  localStorage.getItem("cafe_admin_token");

const storedUser =
  localStorage.getItem("cafe_admin_user");

let parsedUser: Employee | null = null;

try {
  parsedUser = storedUser
    ? (JSON.parse(storedUser) as Employee)
    : null;
} catch {
  parsedUser = null;
}

export const useAuthStore = create<AuthState>(
  (set) => ({
    token: storedToken,
    employee: parsedUser,

    setAuth: (token, employee) => {
      localStorage.setItem(
        "cafe_admin_token",
        token
      );

      localStorage.setItem(
        "cafe_admin_user",
        JSON.stringify(employee)
      );

      set({
        token,
        employee
      });
    },

    logout: () => {
      localStorage.removeItem(
        "cafe_admin_token"
      );

      localStorage.removeItem(
        "cafe_admin_user"
      );

      set({
        token: null,
        employee: null
      });

      window.location.href = "/login";
    }
  })
);
