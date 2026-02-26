import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  // Try to parse JSON when possible
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json().catch(() => null) : null;

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
  return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 16, padding: 16,
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)", background: "white"
    }}>
      <div style={{ fontSize: 14, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{sub}</div> : null}
    </div>
  );
}

function Badge({ children }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: "#fff",
      fontSize: 12,
      color: "#374151"
    }}>
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    booked: "#f3f4f6",
    dispatched: "#e0f2fe",
    picked_up: "#ede9fe",
    in_transit: "#fff7ed",
    delivered: "#dcfce7",
    canceled: "#fee2e2",
  };
  return (
    <span style={{
      padding: "4px 10px", borderRadius: 999,
      background: map[status] || "#f3f4f6",
      border: "1px solid #e5e7eb", fontSize: 12
    }}>
      {status}
    </span>
  );
}

function Button({ children, onClick, type = "button", disabled, variant = "default" }) {
  const style = {
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    borderRadius: 12,
    background: variant === "primary" ? "#111827" : "white",
    color: variant === "primary" ? "white" : "#111827",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.65 : 1,
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      style={{
        padding: 10,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        width: "100%",
        boxSizing: "border-box",
        ...(props.style || {})
      }}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      style={{
        padding: 10,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        width: "100%",
        boxSizing: "border-box",
        ...(props.style || {})
      }}
    />
  );
}

function LoginPanel({ onLoggedIn }) {
  const [email, setEmail] = useState("dispatcher@test.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function login(e) {
    e.preventDefault();
    e.stopPropagation();
    setErr("");
    setLoading(true);
    try {
      // Devise expects: { user: { email, password } }
      await apiFetch("/users/sign_in", {
        method: "POST",
        body: JSON.stringify({ user: { email, password } }),
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
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 18,
      padding: 18,
      boxShadow: "0 1px 10px rgba(0,0,0,0.06)"
    }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Load Tracker</h1>
      <p style={{ marginTop: 6, color: "#6b7280" }}>
        Sign in (Devise session cookies)
      </p>

      <form onSubmit={login} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Email</div>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Password</div>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        </div>

        {err ? <div style={{ color: "#b91c1c", fontSize: 13 }}>{err}</div> : null}

        <Button type="submit" disabled={loading} variant="primary">
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={() => { setEmail("dispatcher@test.com"); setPassword("password"); }}>
            Use dispatcher demo
          </Button>
          <Button onClick={() => { setEmail("driver@test.com"); setPassword("password"); }}>
            Use driver demo
          </Button>
        </div>

        <div style={{ fontSize: 12, color: "#6b7280" }}>
          Demo users come from <code>db/seeds.rb</code>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loads, setLoads] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
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

  async function appFetch(path, options = {}) {
    setLoading(true);
    try {
      return await apiFetch(path, options);
    } catch (e) {
      setToast(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function fetchLoads(customPath = null) {
    const path = customPath || `/loads?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}) }).toString()}`;
    const data = await appFetch(path);
    setLoads(data || []);
  }

  async function fetchLookups() {
    const cs = await appFetch("/customers");
    const ds = await appFetch("/drivers");
    setCustomers(cs || []);
    setDrivers(ds || []);
  }

  async function fetchMe() {
    const data = await appFetch("/me");
    setRole(data?.user?.role || null);
    return data?.user || null;
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
      if (!confirm("Cancel this load?")) return;
    }

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
    await refreshAll(); // refresh list + analytics if dispatcher
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
      // you can expand fields later; keeping minimal is fine
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

    const me = await fetchMe(); // <-- source of truth

    // loads are allowed for both roles
    await fetchLoads();

    // dispatcher-only data
    if (me?.role === "dispatcher") {
      await fetchDashboard();
      try {
        await fetchLookups();
      } catch {
        // ignore lookup failures
      }
    } else {
      setDashboard(null); // hide analytics for drivers
    }
  }

  async function logout() {
    setBanner("");
    try {
      // Devise sign_out is usually DELETE; sometimes accepts DELETE only.
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

  // On first load, attempt to detect session by calling /loads (requires auth)
  useEffect(() => {
    (async () => {
      try {
        await refreshAll();
        setAuthed(true);
      } catch {
        setAuthed(false);
        setRole(null);
        setDashboard(null);
        setLoads([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live filters
  useEffect(() => {
    if (!authed) return;
    const t = setTimeout(() => fetchLoads(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, authed]);

  const statusData = useMemo(() => {
    if (!dashboard?.breakdowns?.by_status) return [];
    return Object.entries(dashboard.breakdowns.by_status).map(([name, count]) => ({ name, count }));
  }, [dashboard]);

  if (!authed) {
    return (
      <LoginPanel
        onLoggedIn={async () => {
          setDashboard(null);
          setRole(null);
          setSelectedLoad(null);
          await refreshAll();
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>Load Tracker</h1>
            <p style={{ marginTop: 6, color: "#6b7280" }}>
              Rails API + Devise auth + React dashboard
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge>Role: <b style={{ marginLeft: 6 }}>{role || "—"}</b></Badge>
            {loading ? <Badge>Loading…</Badge> : null}
            <Button onClick={refreshAll}>Refresh</Button>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>

        {banner ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "white" }}>
            {banner}
          </div>
        ) : null}

        {/* Dispatcher-only analytics */}
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
              <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ margin: 0, fontSize: 16 }}>Loads by Status</h2>
                </div>
                <div style={{ height: 260, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
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

                  <Button onClick={() => fetchLoads("/loads/active")}>Show active loads</Button>
                  <Button onClick={() => { setQ(""); setStatus(""); }}>Clear filters</Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Driver view: no analytics panel, just loads list + active shortcut
          <div style={{ marginTop: 14, background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Your Loads</h2>
            <p style={{ marginTop: 6, color: "#6b7280" }}>
              You only see loads assigned to your driver account.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <Button onClick={() => fetchLoads("/loads/active")}>Show my active loads</Button>
              <Button onClick={() => fetchLoads()}>Show all my loads</Button>
            </div>
          </div>
        )}

        {role === "dispatcher" ? (
          <div style={{ marginTop: 14, background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
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

        {/* Table */}
        <div style={{ marginTop: 14, background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Loads</h2>
            <Button onClick={() => fetchLoads()}>Refresh loads</Button>
          </div>

          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
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
                {loads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => openLoad(l.id)}
                    style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
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
                  <tr><td colSpan="8" style={{ padding: 14, color: "#6b7280" }}>No loads match your filters.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, color: "#6b7280", fontSize: 12 }}>
            Tip: dispatcher can see analytics; drivers see only their assigned loads.
          </div>
        </div>

        {selectedLoad ? (
          <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 16, background: "white", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Load</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedLoad.reference_number}</div>
                <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
                  {selectedLoad.origin_city} {"\u2192"} {selectedLoad.dest_city} {"\u00b7"} Pickup {selectedLoad.pickup_date}
                </div>
              </div>

              <Button onClick={() => setSelectedLoad(null)}>Close</Button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              {/* Status update */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 12 }}>
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
                  <Button variant="primary" onClick={addStatusEvent}>Save status</Button>
                  <Button onClick={refreshSelectedLoad}>Refresh</Button>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                  This creates a StatusEvent and updates the Load.status server-side.
                </div>
              </div>

              {/* Status history */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Status history</div>

                <div style={{ display: "grid", gap: 8 }}>
                  {(selectedLoad.status_events || []).slice().sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)).map((ev) => (
                    <div key={ev.id} style={{ border: "1px solid #f3f4f6", borderRadius: 12, padding: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 700 }}>{ev.status}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{ev.occurred_at}</div>
                      </div>
                      {ev.note ? <div style={{ marginTop: 6, color: "#374151", fontSize: 13 }}>{ev.note}</div> : null}
                    </div>
                  ))}
                  {(selectedLoad.status_events || []).length === 0 ? (
                    <div style={{ color: "#6b7280", fontSize: 13 }}>No status events.</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {toast ? (
          <div style={{ position: "fixed", top: 16, right: 16, background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: "10px 12px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13 }}>{toast}</div>
            <div style={{ marginTop: 8 }}><Button onClick={() => setToast("")}>Close</Button></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
