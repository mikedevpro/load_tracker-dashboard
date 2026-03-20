import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

const API = (import.meta.env.VITE_API_URL || "https://load-tracker-db.onrender.com").replace(/\/$/, "");
const USE_API_CREDENTIALS = import.meta.env.VITE_API_CREDENTIALS !== "false";
const REQUIRE_AUTH = import.meta.env.VITE_REQUIRE_AUTH === "true";
const THEME_STORAGE_KEY = "load_tracker_theme";
const DEMO_MODE_STORAGE_KEY = "load_tracker_demo_mode";
const THEME_TRANSITION = "background-color 200ms ease, border-color 200ms ease, color 200ms ease, box-shadow 200ms ease";
const DEFAULT_THEME_MODE = "system";

const ThemeContext = createContext({
  pageBg: "#f9fafb",
  panelBg: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  borderStrong: "#d1d5db",
  shadow: "0 1px 6px rgba(0,0,0,0.06)",
  buttonBg: "#ffffff",
  buttonText: "#111827",
  buttonPrimaryBg: "#111827",
  buttonPrimaryText: "#ffffff",
  transition: THEME_TRANSITION,
  inputBg: "#ffffff",
  inputText: "#111827",
  inputBorder: "#e5e7eb",
  cardBg: "#ffffff",
  skeleton: "#e5e7eb",
  chartAxis: "#6b7280",
  chartGrid: "#e5e7eb",
  chartBar: "#111827",
  toast: {
    background: "#ffffff",
    border: "#e5e7eb",
    color: "#111827",
    title: "Notice",
  },
});

function getTheme(isDark) {
  if (!isDark) {
    return {
      pageBg: "#f9fafb",
      panelBg: "#ffffff",
      text: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
      borderStrong: "#d1d5db",
      shadow: "0 1px 6px rgba(0,0,0,0.06)",
      buttonBg: "#ffffff",
      buttonText: "#111827",
      buttonPrimaryBg: "#111827",
      buttonPrimaryText: "#ffffff",
      inputBg: "#ffffff",
      inputText: "#111827",
      inputBorder: "#e5e7eb",
      cardBg: "#ffffff",
      skeleton: "#e5e7eb",
      chartAxis: "#6b7280",
      chartGrid: "#e5e7eb",
      chartBar: "#111827",
      toast: {
        background: "#ffffff",
        border: "#e5e7eb",
        color: "#111827",
        title: "Notice",
      },
      warningToast: {
        background: "#fffbeb",
        border: "#f59e0b",
        color: "#92400e",
        title: "Warning",
      },
      danger: "#b91c1c",
      errorBg: "#fee2e2",
      errorText: "#991b1b",
      chartFill: "#111827",
      transition: THEME_TRANSITION,
    };
  }

  return {
    pageBg: "#0b1220",
    panelBg: "#111827",
    text: "#f9fafb",
    muted: "#9ca3af",
    border: "#374151",
    borderStrong: "#4b5563",
    shadow: "0 1px 8px rgba(0,0,0,0.45)",
    buttonBg: "#1f2937",
    buttonText: "#f9fafb",
    buttonPrimaryBg: "#60a5fa",
    buttonPrimaryText: "#0f172a",
    inputBg: "#0f172a",
    inputText: "#f9fafb",
    inputBorder: "#4b5563",
    cardBg: "#111827",
    skeleton: "#334155",
    chartAxis: "#9ca3af",
    chartGrid: "#374151",
    chartBar: "#60a5fa",
    toast: {
      background: "#111827",
      border: "#4b5563",
      color: "#f9fafb",
      title: "Notice",
    },
    warningToast: {
      background: "#3f2d0f",
      border: "#f59e0b",
      color: "#fde68a",
      title: "Warning",
    },
    danger: "#f87171",
    errorBg: "#3b1515",
    errorText: "#fecaca",
    chartFill: "#60a5fa",
    transition: THEME_TRANSITION,
  };
}

function normalizeThemeMode(rawMode) {
  if (rawMode === "system") return "system";
  if (rawMode === "dark") return "dark";
  if (rawMode === "light") return "light";
  if (rawMode === "true") return "dark";
  if (rawMode === "false") return "light";
  return DEFAULT_THEME_MODE;
}

function getThemeMode(savedMode) {
  return normalizeThemeMode(savedMode);
}

function getDemoModePreference() {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(DEMO_MODE_STORAGE_KEY);
  if (saved === "on") return true;
  if (saved === "off") return false;
  return null;
}

function getResolvedThemeMode(mode, systemPrefersDark) {
  if (mode === "light") return false;
  if (mode === "dark") return true;
  return systemPrefersDark;
}

function useTheme() {
  return useContext(ThemeContext);
}

function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  confirmButtonId = "confirm-action",
  titleId = "confirm-title",
  descriptionId = "confirm-description",
  returnFocusRef,
  confirmVariant = "primary",
}) {
  const theme = useTheme();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscapeKey(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCancel();
    }

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      modalRef.current?.querySelector(`#${confirmButtonId}`)?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, confirmButtonId]);

  useEffect(() => {
    if (isOpen) return;
    if (!returnFocusRef?.current) return;
    returnFocusRef.current.focus();
  }, [isOpen, returnFocusRef]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const modal = modalRef.current;
          if (!modal) return;
          const focusables = Array.from(modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
            .filter((node) => {
              if (node.disabled) return false;
              const style = window.getComputedStyle(node);
              return style.display !== "none" && style.visibility !== "hidden";
            });
          if (focusables.length === 0) {
            event.preventDefault();
            return;
          }
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = document.activeElement;
          if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        style={{
          width: "min(460px, 92vw)",
          background: theme.panelBg,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: 16,
          boxShadow: theme.shadow,
          color: theme.text,
        }}
      >
        <div id={titleId} style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title}</div>
        <div id={descriptionId} style={{ color: theme.muted, marginBottom: 12 }}>{description}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="ghost" onClick={onCancel}>{cancelText}</Button>
          <Button id={confirmButtonId} variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

function toList(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.loads)) return data.loads;
  if (Array.isArray(data.customers)) return data.customers;
  if (Array.isArray(data.drivers)) return data.drivers;
  return [];
}

function hasLoadsShape(data) {
  if (Array.isArray(data)) return true;
  if (!data || typeof data !== "object") return false;
  return Array.isArray(data.data) || Array.isArray(data.loads);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: USE_API_CREDENTIALS ? "include" : "omit",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    const msg = data?.error || data?.errors?.join(", ") || `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function Card({ title, value, sub }) {
  const theme = useTheme();
  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, boxShadow: theme.shadow, background: theme.cardBg, transition: theme.transition }}>
      <div style={{ fontSize: 14, color: theme.muted }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, color: theme.muted, marginTop: 6 }}>{sub}</div> : null}
    </div>
  );
}

function Badge({ children }) {
  const theme = useTheme();
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      border: `1px solid ${theme.border}`,
      background: theme.panelBg,
      transition: theme.transition,
      fontSize: 12,
      color: theme.text
    }}>
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  const theme = useTheme();
  const map = {
    booked: "#374151",
    dispatched: "#0c4a6e",
    picked_up: "#312e81",
    in_transit: "#7c2d12",
    delivered: "#065f46",
    canceled: "#7f1d1d",
  };
  return (
    <span style={{
      padding: "4px 10px",
      borderRadius: 999,
      background: map[status] || "#374151",
      border: `1px solid ${theme.border}`,
      color: "#f9fafb",
      fontSize: 12
    }}>
      {status}
    </span>
  );
}

function Button({ children, onClick, type = "button", disabled, variant = "default", style, ...buttonProps }) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showFocusRing, setShowFocusRing] = useState(false);
  const [focusByPointer, setFocusByPointer] = useState(false);
  const isDisabled = Boolean(disabled);
  const baseButtonBg =
    variant === "danger" ? theme.danger :
    variant === "primary" ? theme.buttonPrimaryBg :
    variant === "ghost" ? "transparent" :
    theme.buttonBg;
  const baseButtonText =
    variant === "danger" ? "#ffffff" :
    variant === "primary" ? theme.buttonPrimaryText :
    variant === "ghost" ? theme.text : theme.buttonText;
  const baseButtonBorder =
    variant === "danger" ? theme.danger :
    variant === "ghost" ? "transparent" :
    theme.border;

  const hoverButtonBg =
    variant === "danger" ? (theme.danger === "#f87171" ? "#ef4444" : "#991b1b") :
    variant === "primary" ? (theme.buttonPrimaryBg === "#111827" ? "#1f2937" : "#3b82f6") :
    variant === "ghost" ? theme.skeleton :
    theme.skeleton;
  const hoverButtonText =
    variant === "ghost" ? theme.text : baseButtonText;
  const hoverButtonBorder =
    variant === "danger" ? (theme.danger === "#f87171" ? "#ef4444" : "#991b1b") :
    variant === "ghost" ? theme.borderStrong :
    theme.border;
  const activeButtonBg =
    variant === "danger" ? (theme.danger === "#f87171" ? "#dc2626" : "#7f1d1d") :
    variant === "primary" ? (theme.buttonPrimaryBg === "#111827" ? "#0f172a" : "#2563eb") :
    variant === "ghost" ? theme.muted :
    theme.borderStrong;
  const activeButtonText =
    variant === "ghost" ? theme.text : baseButtonText;
  const activeButtonBorder =
    variant === "danger" ? (theme.danger === "#f87171" ? "#dc2626" : "#7f1d1d") :
    variant === "ghost" ? theme.borderStrong :
    theme.borderStrong;
  const focusRing =
    variant === "danger" ? `${theme.danger}66` : theme.buttonPrimaryBg === "#111827"
      ? "rgba(96,165,250,0.35)"
      : "rgba(37,99,235,0.25)";

  const buttonStyle = {
    border: `1px solid ${pressed && !isDisabled ? activeButtonBorder : hovered && !isDisabled ? hoverButtonBorder : baseButtonBorder}`,
    padding: "10px 12px",
    borderRadius: 12,
    background: pressed && !isDisabled ? activeButtonBg : hovered && !isDisabled ? hoverButtonBg : baseButtonBg,
    color: pressed && !isDisabled ? activeButtonText : hovered && !isDisabled ? hoverButtonText : baseButtonText,
    transform: pressed && !isDisabled ? "translateY(1px)" : "none",
    outline: "none",
    boxShadow: showFocusRing && !isDisabled ? `0 0 0 3px ${focusRing}` : "none",
    cursor: isDisabled ? "not-allowed" : "pointer",
    transition: `${theme.transition}, transform 120ms ease`,
    opacity: isDisabled ? 0.65 : 1,
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onFocus={() => {
        if (isDisabled) return;
        setHovered(true);
        setFocused(true);
        setShowFocusRing(!focusByPointer);
      }}
      onBlur={() => {
        setHovered(false);
        setPressed(false);
        setShowFocusRing(false);
        setFocused(false);
        setFocusByPointer(false);
      }}
      onMouseDown={() => {
        if (isDisabled) return;
        setFocusByPointer(true);
        setShowFocusRing(false);
        setPressed(true);
      }}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => {
        if (isDisabled) return;
        setFocusByPointer(true);
        setPressed(true);
      }}
      onTouchEnd={() => setPressed(false)}
      onTouchCancel={() => setPressed(false)}
      aria-busy={disabled || undefined}
      {...buttonProps}
      style={{ ...buttonStyle, ...style }}
    >
      {children}
    </button>
  );
}

function Input(props) {
  const theme = useTheme();
  return (
    <input
      {...props}
      style={{
        padding: 10,
        borderRadius: 12,
        border: `1px solid ${theme.inputBorder}`,
        background: theme.inputBg,
        color: theme.inputText,
        transition: theme.transition,
        width: "100%",
        boxSizing: "border-box",
        ...(props.style || {})
      }}
    />
  );
}

function Select(props) {
  const theme = useTheme();
  return (
    <select
      {...props}
      style={{
        padding: 10,
        borderRadius: 12,
        border: `1px solid ${theme.inputBorder}`,
        background: theme.inputBg,
        color: theme.inputText,
        transition: theme.transition,
        width: "100%",
        boxSizing: "border-box",
        ...(props.style || {})
      }}
    />
  );
}

function SkeletonCell() {
  const theme = useTheme();
  return <div style={{ height: 14, borderRadius: 999, background: theme.skeleton, width: "85%" }} />;
}

function getToastTheme(message, theme) {
  const isLoadPayloadWarning =
    (message || "").includes("No data returned from /loads.") ||
    (message || "").includes("unexpected payload for /loads.");
  return isLoadPayloadWarning ? theme.warningToast : theme.toast;
}

function LoginPanel({ onLoggedIn }) {
  const theme = useTheme();
  const [selectedRole, setSelectedRole] = useState("dispatcher");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function credentialEmailForSignIn(role) {
    return role === "driver" ? "driver@test.com" : "dispatcher@test.com";
  }

  async function login(e) {
    e.preventDefault();
    e.stopPropagation();
    setErr("");
    if (!password || !password.trim()) {
      setErr("Password is required.");
      return;
    }
    setLoading(true);
    try {
      const signInEmail = credentialEmailForSignIn(selectedRole);
      await apiFetch("/users/sign_in.json", {
        method: "POST",
        body: JSON.stringify({ user: { email: signInEmail, password } }),
      });
      await onLoggedIn();
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: 420,
      margin: "80px auto",
      background: theme.panelBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 18,
      padding: 18,
      boxShadow: theme.shadow,
      transition: theme.transition
    }}>
      <h1 style={{ margin: 0, fontSize: 22, color: theme.text }}>Load Tracker</h1>
      <p style={{ marginTop: 6, color: theme.muted }}>
        Sign in (Devise session cookies)
      </p>

      <form onSubmit={login} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>Sign in as</div>
          <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="dispatcher">Dispatcher</option>
            <option value="driver">Driver</option>
          </Select>
        </div>
        <div>
          <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>Password</div>
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <span style={{ fontSize: 12, color: theme.muted }}>
              Password required. Use <strong>password</strong> for demo accounts.
            </span>
            <Button
              type="button"
              onClick={() => setShowPassword((x) => !x)}
              variant="default"
              style={{ marginLeft: 8 }}
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>
        </div>

        {err ? <div style={{ color: theme.danger, fontSize: 13 }}>{err}</div> : null}

        <Button type="submit" disabled={loading} variant="primary">
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button disabled={loading} onClick={() => setPassword("password")}>Use demo password</Button>
        </div>

        <div style={{ fontSize: 12, color: theme.muted }}>
          (Demo users come from <code>db/seeds.rb</code>)
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const activeRequests = useRef(0);
  const [authed, setAuthed] = useState(!REQUIRE_AUTH);
  const [demoMode, setDemoMode] = useState(() => {
    const overridden = getDemoModePreference();
    return REQUIRE_AUTH ? false : (overridden ?? true);
  });
  const [showExitDemoConfirm, setShowExitDemoConfirm] = useState(false);
  const exitDemoTriggerRef = useRef(null);
  const [showCancelStatusConfirm, setShowCancelStatusConfirm] = useState(false);
  const cancelStatusActionTriggerRef = useRef(null);
  const [role, setRole] = useState(REQUIRE_AUTH ? null : "dispatcher");
  const requireAuth = REQUIRE_AUTH || demoMode;
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_THEME_MODE;
    return getThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });
  const isDark = useMemo(() => getResolvedThemeMode(themeMode, systemPrefersDark), [themeMode, systemPrefersDark]);
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const [dashboard, setDashboard] = useState(null);
  const [loads, setLoads] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadsLoading, setLoadsLoading] = useState(false);
  const [loadsIssue, setLoadsIssue] = useState("");
  const [toast, setToast] = useState("");
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [statusNote, setStatusNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    reference_number: "",
    pickup_date: "",
    delivery_date: "",
    origin_city: "",
    dest_city: "",
    rate: "",
    customer_id: "",
    driver_id: "",
    status: "booked",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    document.body.style.backgroundColor = theme.pageBg;
    document.body.style.color = theme.text;
  }, [themeMode, theme.pageBg, theme.text]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    const normalized = normalizeThemeMode(saved);
    if (normalized !== saved) {
      window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
    }
    if (normalized !== themeMode) {
      setThemeMode(normalized);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const overridden = getDemoModePreference();
    if (!REQUIRE_AUTH && overridden !== demoMode) {
      setDemoMode(overridden ?? true);
    }
  }, [REQUIRE_AUTH, demoMode]);

  useEffect(() => {
    if (themeMode !== "system") return;
    if (typeof window === "undefined") return;
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const updateSystemMode = (event) => {
      setSystemPrefersDark(event.matches);
    };
    setSystemPrefersDark(media.matches);
    media.addEventListener("change", updateSystemMode);
    return () => media.removeEventListener("change", updateSystemMode);
  }, [themeMode]);

  async function appFetch(path, options = {}) {
    activeRequests.current += 1;
    setLoading(true);
    try {
      return await apiFetch(path, options);
    } catch (e) {
      setToast(e.message);
      throw e;
    } finally {
      activeRequests.current -= 1;
      setLoading(activeRequests.current > 0);
    }
  }

  async function fetchLoads(customPath = null) {
    setLoadsLoading(true);
    const query = new URLSearchParams({
      ...(q ? { q } : {}),
      ...(status ? { status } : {}),
    });
    const path = customPath || `/loads${query.toString() ? `?${query.toString()}` : ""}`;
    try {
      const data = await appFetch(path);
      if (data === null || data === undefined) {
        const message = "No data returned from /loads.";
        setLoadsIssue(message);
        setToast(message);
      } else if (!hasLoadsShape(data)) {
        const message = "API returned an unexpected payload for /loads. Check response format in API logs.";
        setLoadsIssue(message);
        setToast(message);
      } else {
        if (loadsIssue) setToast("");
        setLoadsIssue("");
      }
      setLoads(toList(data));
    } finally {
      setLoadsLoading(false);
    }
  }

  async function fetchLookups() {
    const cs = await appFetch("/customers");
    const ds = await appFetch("/drivers");
    setCustomers(toList(cs));
    setDrivers(toList(ds));
  }

  async function fetchMe() {
    const data = await appFetch("/me");
    setRole(data?.user?.role || data?.role || null);
    return data?.user || data || null;
  }

  async function openLoad(id) {
    const data = await appFetch(`/loads/${id}`);
    setSelectedLoad(data);
    setNewStatus(data?.status || "booked");
    setStatusNote("");
  }

  async function refreshSelectedLoad() {
    if (!selectedLoad?.id) return;
    const data = await appFetch(`/loads/${selectedLoad.id}`);
    setSelectedLoad(data);
  }

  async function addStatusEvent() {
    if (!selectedLoad?.id) return;
    if (newStatus === "canceled") {
      setShowCancelStatusConfirm(true);
      return;
    }
    await saveStatusEvent();
  }

  async function saveStatusEvent() {
    if (!selectedLoad?.id) return;

    await appFetch(`/loads/${selectedLoad.id}/status_events`, {
      method: "POST",
      body: JSON.stringify({
        status_event: {
          status: newStatus,
          note: statusNote || "Status updated",
        },
      }),
    });

    await refreshSelectedLoad();
    await refreshAll();
  }

  async function confirmCancelStatusEvent() {
    setShowCancelStatusConfirm(false);
    await saveStatusEvent();
  }

  function cancelCancelStatusEvent() {
    setShowCancelStatusConfirm(false);
  }

  async function createLoad() {
    const payload = {
      ...form,
      rate: form.rate === "" ? null : Number(form.rate),
      customer_id: Number(form.customer_id),
      driver_id: form.driver_id ? Number(form.driver_id) : null,
    };

    await appFetch("/loads", {
      method: "POST",
      body: JSON.stringify({ load: payload }),
    });

    setForm({
      reference_number: "",
      pickup_date: "",
      delivery_date: "",
      origin_city: "",
      dest_city: "",
      rate: "",
      customer_id: "",
      driver_id: "",
      status: "booked",
    });

    await refreshAll();
  }

  async function _saveLoadEdits() {
    if (!selectedLoad?.id) return;

    const payload = {
      status: newStatus,
    };

    await appFetch(`/loads/${selectedLoad.id}`, {
      method: "PATCH",
      body: JSON.stringify({ load: payload }),
    });

    await refreshAll();
    await refreshSelectedLoad();
  }

  async function fetchDashboard() {
    const data = await appFetch("/dashboard");
    setDashboard(data);
  }

  async function refreshAll() {
    setBanner("");
    let me = null;
    let canContinue = true;
    try {
      me = await fetchMe();
      setAuthed(true);
      setRole(me?.user?.role || me?.role || null);
    } catch (error) {
      if (requireAuth) {
        setAuthed(false);
        setRole(null);
        setDashboard(null);
        setLoads([]);
        setSelectedLoad(null);
        setBanner(error?.message || "Session not found. Please sign in.");
        canContinue = false;
        return;
      }

      me = { role: "dispatcher" };
      setRole("dispatcher");
      setAuthed(true);
      setToast("");
      setBanner("Session verification skipped. Running in public mode.");
    }

    if (!canContinue) return;

    await fetchLoads();

    if ((me?.role || role) === "dispatcher") {
      await fetchDashboard();
      try {
        await fetchLookups();
      } catch {
        // ignore lookup failures
      }
    } else {
      setDashboard(null);
    }
  }

  async function logout() {
    setBanner("");
    try {
      await appFetch("/users/sign_out.json", { method: "DELETE" });
    } catch {
      // ignore
    }
    setAuthed(false);
    setRole(null);
    setDashboard(null);
    setLoads([]);
    setSelectedLoad(null);
  }

  function exitDemoMode() {
    setShowExitDemoConfirm(true);
  }

  function confirmExitDemoMode() {
    if (typeof window === "undefined") {
      setShowExitDemoConfirm(false);
      return;
    }
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, "off");
    setDemoMode(false);
    setAuthed(false);
    setRole(null);
    setDashboard(null);
    setLoads([]);
    setSelectedLoad(null);
    setBanner("Demo mode disabled. Please sign in.");
    setShowExitDemoConfirm(false);
  }

  function cancelExitDemoMode() {
    setShowExitDemoConfirm(false);
  }

  useEffect(() => {
    (async () => {
      try {
        await refreshAll();
        if (!requireAuth) setAuthed(true);
      } catch {
        setBanner("Could not connect to API. Check API URL/CORS/backend status.");
        if (requireAuth) {
          setAuthed(false);
          setRole(null);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchLoads(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const statusData = useMemo(() => {
    if (!dashboard?.breakdowns?.by_status) return [];
    return Object.entries(dashboard.breakdowns.by_status).map(([name, count]) => ({ name, count }));
  }, [dashboard]);

  if (requireAuth && !authed) {
    return (
      <ThemeContext.Provider value={theme}>
        <div style={{ background: theme.pageBg, minHeight: "100vh", color: theme.text, transition: theme.transition }}>
          {banner ? (
            <div style={{
              maxWidth: 420,
              margin: "24px auto 0",
              padding: 12,
              borderRadius: 14,
              border: `1px solid ${theme.errorBg}`,
              background: theme.errorBg,
              color: theme.errorText,
            }}>
              {banner}
            </div>
          ) : null}

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, textAlign: "right", transition: theme.transition }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: theme.muted }}>
              Theme:
              <Select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value)}
                disabled={loading}
                style={{ width: 140 }}
              >
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </Select>
            </label>
          </div>
          <LoginPanel
            onLoggedIn={async () => {
              setDashboard(null);
              setRole(null);
              setSelectedLoad(null);
              setBanner("");
              await refreshAll();
              setAuthed(true);
            }}
          />
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background: theme.pageBg,
        color: theme.text,
        minHeight: "100vh",
        transition: theme.transition,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, transition: theme.transition }}>
          <ConfirmModal
            isOpen={showExitDemoConfirm}
            onConfirm={confirmExitDemoMode}
            onCancel={cancelExitDemoMode}
            title="Exit demo mode?"
            description="This will disable demo mode and return the app to login-required behavior."
            confirmText="Yes, exit"
            confirmButtonId="exit-demo-confirm-action"
            titleId="exit-demo-title"
            descriptionId="exit-demo-description"
            returnFocusRef={exitDemoTriggerRef}
          />

          <ConfirmModal
            isOpen={showCancelStatusConfirm}
            onConfirm={confirmCancelStatusEvent}
            onCancel={cancelCancelStatusEvent}
            title="Cancel this load?"
            description="This action will record a canceled status event on the selected load."
            confirmText="Yes, cancel load"
            confirmButtonId="cancel-status-confirm-action"
            titleId="cancel-status-title"
            descriptionId="cancel-status-description"
            returnFocusRef={cancelStatusActionTriggerRef}
            cancelText="Keep editing"
            confirmVariant="danger"
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28 }}>Load Tracker</h1>
              <p style={{ marginTop: 6, color: theme.muted }}>
                Rails API + React dashboard
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge>Role: <b style={{ marginLeft: 6 }}>{role || "—"}</b></Badge>
              {loading ? <Badge>Loading…</Badge> : null}
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: theme.muted }}>
                Theme:
                <Select
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value)}
                  disabled={loading}
                  style={{ minWidth: 110 }}
                >
                  <option value="system">System</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </Select>
              </label>
              <Button disabled={loading} onClick={refreshAll}>Refresh</Button>
              {requireAuth ? <Button ref={exitDemoTriggerRef} disabled={loading} onClick={exitDemoMode}>Exit demo mode</Button> : null}
              {requireAuth ? <Button disabled={loading} onClick={logout}>Sign out</Button> : null}
            </div>
          </div>

          {banner ? (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.panelBg, transition: theme.transition }}>
              {banner}
            </div>
          ) : null}

          {role === "dispatcher" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 18 }}>
                <Card title="Total Loads" value={dashboard?.totals?.loads ?? "—"} />
                <Card title="Active Loads" value={dashboard?.totals?.active_loads ?? "—"} sub="booked / dispatched / picked_up / in_transit" />
                <Card title="Delivered" value={dashboard?.totals?.delivered ?? "—"} />
                <Card
                  title="On-time %"
                  value={(dashboard?.performance?.on_time_pct ?? "—") + "%"}
                  sub={`Avg transit: ${dashboard?.performance?.avg_transit_days ?? "—"} days`}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, marginTop: 14 }}>
                <div style={{ background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, transition: theme.transition }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ margin: 0, fontSize: 16 }}>Loads by Status</h2>
                  </div>
                  <div style={{ height: 260, marginTop: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                        <XAxis dataKey="name" tick={{ fill: theme.chartAxis }} />
                        <YAxis allowDecimals={false} tick={{ fill: theme.chartAxis }} />
                        <Tooltip
                          contentStyle={{
                            background: theme.panelBg,
                            transition: theme.transition,
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                          }}
                          itemStyle={{ color: theme.text }}
                          labelStyle={{ color: theme.text }}
                        />
                        <Bar dataKey="count" fill={theme.chartFill} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, transition: theme.transition }}>
                  <h2 style={{ margin: 0, fontSize: 16 }}>Filters</h2>
                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (ref/origin/dest)…" />
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="">All statuses</option>
                      <option value="booked">booked</option>
                      <option value="dispatched">dispatched</option>
                      <option value="picked_up">picked_up</option>
                      <option value="in_transit">in_transit</option>
                      <option value="delivered">delivered</option>
                      <option value="canceled">canceled</option>
                    </Select>

                    <Button disabled={loading} onClick={() => fetchLoads("/loads/active")}>Show active loads</Button>
                    <Button onClick={() => { setQ(""); setStatus(""); }}>Clear filters</Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 14, background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, transition: theme.transition }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>Your Loads</h2>
              <p style={{ marginTop: 6, color: theme.muted }}>
                You only see loads assigned to your driver account.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <Button disabled={loading} onClick={() => fetchLoads("/loads/active")}>Show my active loads</Button>
                <Button disabled={loading} onClick={() => fetchLoads()}>Show all my loads</Button>
              </div>
            </div>
          )}

          {role === "dispatcher" ? (
            <div style={{ marginTop: 14, background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, transition: theme.transition }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>Create Load</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 }}>
                <Input placeholder="Reference (LD-1234)" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} />
                <Input placeholder="Pickup date (YYYY-MM-DD)" value={form.pickup_date} onChange={(e) => setForm({ ...form, pickup_date: e.target.value })} />
                <Input placeholder="Delivery date (optional)" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} />

                <Input placeholder="Origin city" value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })} />
                <Input placeholder="Destination city" value={form.dest_city} onChange={(e) => setForm({ ...form, dest_city: e.target.value })} />
                <Input placeholder="Rate" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />

                <Select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>

                <Select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                  <option value="">Unassigned</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>

                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="booked">booked</option>
                  <option value="dispatched">dispatched</option>
                  <option value="picked_up">picked_up</option>
                  <option value="in_transit">in_transit</option>
                  <option value="delivered">delivered</option>
                  <option value="canceled">canceled</option>
                </Select>
              </div>

              <div style={{ marginTop: 12 }}>
                <Button variant="primary" onClick={createLoad} disabled={loading || !form.reference_number || !form.pickup_date || !form.origin_city || !form.dest_city || !form.customer_id}>
                  {loading ? "Working..." : "Create load"}
                </Button>
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 14, background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, transition: theme.transition }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>Loads</h2>
              <Button disabled={loading} onClick={() => fetchLoads()}>Refresh loads</Button>
            </div>

            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `1px solid ${theme.borderStrong}` }}>
                    <th style={{ padding: 10 }}>Ref</th>
                    <th style={{ padding: 10 }}>Status</th>
                    <th style={{ padding: 10 }}>Pickup</th>
                    <th style={{ padding: 10 }}>Origin</th>
                    <th style={{ padding: 10 }}>Dest</th>
                    <th style={{ padding: 10 }}>Customer</th>
                    <th style={{ padding: 10 }}>Driver</th>
                    <th style={{ padding: 10 }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {loadsLoading ? (
                    <>
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={`skeleton-${idx}`}>
                          <td style={{ padding: 10 }}><SkeletonCell /></td>
                          <td style={{ padding: 10 }}><SkeletonCell /></td>
                          <td style={{ padding: 10 }}><SkeletonCell /></td>
                          <td style={{ padding: 10 }}><SkeletonCell /></td>
                          <td style={{ padding: 10 }}><SkeletonCell /></td>
                          <td style={{ padding: 10 }}><SkeletonCell /></td>
                          <td style={{ padding: 10 }}><SkeletonCell /></td>
                          <td style={{ padding: 10 }}><SkeletonCell /></td>
                        </tr>
                      ))}
                    </>
                  ) : loadsIssue ? (
                    <tr>
                      <td colSpan="8" style={{ padding: 14, color: theme.warningToast.color, background: theme.warningToast.background }}>{loadsIssue}</td>
                    </tr>
                  ) : (
                    <>
                      {loads.map((l) => (
                        <tr
                          key={l.id}
                          onClick={() => openLoad(l.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openLoad(l.id);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Open load ${l.reference_number}`}
                          style={{ borderBottom: `1px solid ${theme.borderStrong}`, cursor: "pointer" }}
                        >
                          <td style={{ padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{l.reference_number}</td>
                          <td style={{ padding: 10 }}><StatusPill status={l.status} /></td>
                          <td style={{ padding: 10 }}>{l.pickup_date}</td>
                          <td style={{ padding: 10 }}>{l.origin_city}</td>
                          <td style={{ padding: 10 }}>{l.dest_city}</td>
                          <td style={{ padding: 10 }}>{l.customer?.name ?? "—"}</td>
                          <td style={{ padding: 10 }}>{l.driver?.name ?? "—"}</td>
                          <td style={{ padding: 10 }}>${Number(l.rate ?? 0).toFixed(0)}</td>
                        </tr>
                      ))}
                      {loads.length === 0 ? (
                        <tr><td colSpan="8" style={{ padding: 14, color: theme.muted }}>No loads match your filters.</td></tr>
                      ) : null}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12, color: theme.muted, fontSize: 12 }}>
              Tip: dispatcher can see analytics; drivers see only their assigned loads.
            </div>
          </div>

          {selectedLoad ? (
            <div style={{ marginTop: 14, border: `1px solid ${theme.border}`, borderRadius: 16, background: theme.panelBg, padding: 16, transition: theme.transition }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: theme.muted }}>Load</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedLoad.reference_number}</div>
                  <div style={{ marginTop: 6, color: theme.muted, fontSize: 13 }}>
                    {selectedLoad.origin_city} {"\u2192"} {selectedLoad.dest_city} {"\u00b7"} Pickup {selectedLoad.pickup_date}
                  </div>
                </div>
                <Button onClick={() => setSelectedLoad(null)}>Close</Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                <div style={{ border: `1px solid ${theme.border}`, borderRadius: 14, padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Update status</div>

                  <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="booked">booked</option>
                    <option value="dispatched">dispatched</option>
                    <option value="picked_up">picked_up</option>
                    <option value="in_transit">in_transit</option>
                    <option value="delivered">delivered</option>
                    <option value="canceled">canceled</option>
                  </Select>

                  <div style={{ marginTop: 10 }}>
                    <Input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Note (optional)..." />
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    <Button ref={cancelStatusActionTriggerRef} disabled={loading} variant="primary" onClick={addStatusEvent}>Save status</Button>
                    <Button disabled={loading} onClick={refreshSelectedLoad}>Refresh</Button>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: theme.muted }}>
                    This creates a StatusEvent and updates the Load.status server-side.
                  </div>
                </div>

                <div style={{ border: `1px solid ${theme.border}`, borderRadius: 14, padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Status history</div>

                  <div style={{ display: "grid", gap: 8 }}>
                    {(selectedLoad.status_events || []).slice().sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)).map((ev) => (
                      <div key={ev.id} style={{ border: `1px solid ${theme.borderStrong}`, borderRadius: 12, padding: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ fontWeight: 700 }}>{ev.status}</div>
                          <div style={{ fontSize: 12, color: theme.muted }}>{ev.occurred_at}</div>
                        </div>
                        {ev.note ? <div style={{ marginTop: 6, color: theme.text, fontSize: 13 }}>{ev.note}</div> : null}
                      </div>
                    ))}
                    {(selectedLoad.status_events || []).length === 0 ? (
                      <div style={{ color: theme.muted, fontSize: 13 }}>No status events.</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {toast ? (
            (() => {
              const toastTheme = getToastTheme(toast, theme);
              return (
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    position: "fixed",
                    top: 16,
                    right: 16,
                    background: toastTheme.background,
                    border: `1px solid ${toastTheme.border}`,
                    borderRadius: 14,
                    padding: "10px 12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    color: toastTheme.color
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{toastTheme.title}</div>
                  <div style={{ fontSize: 13 }}>{toast}</div>
                  <div style={{ marginTop: 8 }}>
                    <Button onClick={() => setToast("")}>Close</Button>
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
