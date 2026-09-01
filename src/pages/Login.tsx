import {
  type FormEvent,
  useState,
} from "react";

import {
  Coffee,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api, { TOKEN_KEY, apiMessage } from "../services/api";

import { useAuthStore } from "../store/auth.store";

import type { Employee } from "../types";

export default function Login() {
  const [email, setEmail] = useState("admin@cafe.com");
  const [password, setPassword] = useState("Admin@123");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  const submit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setBusy(true);

    try {
      const response = await api.post(
        "/auth/employee/login",
        {
          email,
          password,
        }
      );

      const payload =
        response.data?.data ??
        response.data;

      if (!payload?.token) {
        throw new Error(
          "Login token was not returned by the server."
        );
      }

      const employee =
        payload.employee as Employee;

      // IMPORTANT:
      // Save JWT so Axios can attach it
      // to all authenticated requests.
      localStorage.setItem(
        TOKEN_KEY,
        payload.token
      );

      // Store authentication state.
      setAuth(
        payload.token,
        employee
      );

      // Navigate only after token is saved.
      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(
        apiMessage(
          requestError,
          "Unable to sign in. Check your credentials."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/5 blur-[120px]" />

      <div className="premium-card relative w-full max-w-md p-7 md:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-gold/30 bg-accent-gold/10 text-accent-gold shadow-[0_0_35px_rgba(224,185,115,0.08)]">
            <Coffee size={27} />
          </div>

          <h1 className="font-display text-3xl font-semibold">
            The Secret Brew
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Private club operations console
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Email
            </span>

            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-text-secondary"
                size={17}
              />

              <input
                className="premium-input pl-10"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Password
            </span>

            <div className="relative">
              <LockKeyhole
                className="absolute left-3 top-3 text-text-secondary"
                size={17}
              />

              <input
                className="premium-input pl-10"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-input border border-accent-red/30 bg-accent-red/10 px-3 py-2.5 text-sm text-accent-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="gold-button mt-2 w-full"
          >
            {busy ? (
              "Authenticating…"
            ) : (
              <>
                <ShieldCheck size={17} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-7 border-t border-border pt-5">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
            Demo Access
          </p>

          <div className="space-y-2 font-mono text-[11px] text-text-secondary">
            <div className="rounded-input bg-background p-2.5">
              <span className="text-accent-gold">
                Admin:
              </span>{" "}
              admin@cafe.com / Admin@123
            </div>

            <div className="rounded-input bg-background p-2.5">
              <span className="text-accent-gold">
                Staff:
              </span>{" "}
              staff@cafe.com / Staff@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}