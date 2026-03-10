import { useState, useEffect } from "react";
import { supabase } from "./supabase";


const C = {
  maroon: "#6B1F1F", gold: "#D4890A", lightGold: "#F5C842",
  cream: "#FDF6EC", dark: "#3B1A1A", soft: "#F9F4EE",
};

function genCode(role) {
  const prefix = role === "staff" ? 9 : 6;
  return `${prefix}${String(Math.floor(Math.random() * 900) + 100)}`;
}

function Avatar({ initials, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${C.maroon},${C.gold})`,
      color: "white", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.32
    }}>{initials}</div>
  );
}

function Badge({ label }) {
  const map = {
    approved: ["#e6f9ee","#1a7a3e"], pending: ["#fff7e0","#a06000"],
    rejected: ["#fde8e8","#b00020"], admin: ["#ede8ff","#4a00b0"],
    staff: ["#e0f0ff","#005ea6"], resident: ["#fff0e8","#a04000"],
  };
  const [bg, txt] = map[label] || ["#eee","#555"];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: bg, color: txt, textTransform: "capitalize" }}>{label}</span>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: "white", borderRadius: 18, padding: 24, boxShadow: "0 3px 16px rgba(107,31,31,0.10)", ...style }}>{children}</div>;
}

function Btn({ label, onClick, variant = "primary", small, disabled, style = {} }) {
  const s = {
    primary: { background: `linear-gradient(135deg,${C.maroon},${C.dark})`, color: "white", border: "none" },
    outline:  { background: "white", color: C.maroon, border: `2px solid ${C.maroon}` },
    gold:     { background: `linear-gradient(135deg,${C.gold},${C.lightGold})`, color: C.dark, border: "none" },
    danger:   { background: "#c00", color: "white", border: "none" },
    ghost:    { background: "transparent", color: C.maroon, border: "none", textDecoration: "underline" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...s[variant], borderRadius: 9, padding: small ? "6px 14px" : "11px 24px",
      fontSize: small ? 12 : 14, fontWeight: 700, cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.45 : 1, ...style
    }}>{label}</button>
  );
}

function MealDots({ remaining, total = 14 }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "8px 0", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: "50%",
          background: i < remaining ? C.gold : "#e5d9cc",
          border: `2px solid ${i < remaining ? C.maroon : "#ccc"}`
        }} />
      ))}
    </div>
  );
}

function QRDisplay() {
  const size = 170, cells = 21, cell = size / cells;
  const pat = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) return 1;
      return (r * 3 + c * 7 + r * c) % 3 === 0 ? 1 : 0;
    })
  );
  return (
    <div style={{ background: "white", padding: 14, borderRadius: 14, display: "inline-block", boxShadow: "0 4px 20px rgba(0,0,0,0.13)" }}>
      <svg width={size} height={size}>
        {pat.map((row, r) => row.map((v, c) =>
          v ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={C.dark} /> : null
        ))}
        <rect x={size/2-18} y={size/2-18} width={36} height={36} fill="white" rx={4} />
        <circle cx={size/2} cy={size/2} r={12} fill={C.gold} />
        <circle cx={size/2} cy={size/2} r={7} fill={C.lightGold} />
      </svg>
    </div>
  );
}

function AOLLogo() {
  return (
    <svg width={60} height={42} viewBox="0 0 120 80" style={{ marginBottom: 2 }}>
      <circle cx="60" cy="55" r="22" fill={C.gold} />
      <circle cx="60" cy="55" r="16" fill={C.lightGold} />
      {[...Array(10)].map((_, i) => {
        const a = (i * 36 - 90) * Math.PI / 180;
        return <line key={i} x1={60+24*Math.cos(a)} y1={55+24*Math.sin(a)} x2={60+32*Math.cos(a)} y2={55+32*Math.sin(a)} stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" />;
      })}
      <ellipse cx="22" cy="52" rx="12" ry="7" fill="none" stroke={C.maroon} strokeWidth="2" />
      <path d="M14,45 Q18,36 24,40" stroke={C.maroon} strokeWidth="2" fill="none" />
      <ellipse cx="98" cy="52" rx="12" ry="7" fill="none" stroke={C.maroon} strokeWidth="2" />
      <path d="M106,45 Q102,36 96,40" stroke={C.maroon} strokeWidth="2" fill="none" />
    </svg>
  );
}

function PinPad({ onSubmit, error }) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (pin.length === 4) {
      onSubmit(pin);
      setTimeout(() => setPin(""), 600);
    }
  }, [pin]);

  const press = (k) => { if (pin.length < 4) setPin(p => p + k); };
  const del = () => setPin(p => p.slice(0, -1));

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 20 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 20, height: 20, borderRadius: "50%",
            background: i < pin.length ? C.maroon : "transparent",
            border: `2.5px solid ${i < pin.length ? C.maroon : "#ccc"}`,
            transition: "all 0.15s"
          }} />
        ))}
      </div>
      {error && <div style={{ color: "#c00", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 240, margin: "0 auto" }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => press(String(n))} style={{
            height: 58, borderRadius: 14, border: `1.5px solid #e0d0c0`,
            background: "white", fontSize: 22, fontWeight: 700, cursor: "pointer", color: C.dark,
            boxShadow: "0 2px 6px rgba(0,0,0,0.07)"
          }}>{n}</button>
        ))}
        <button onClick={del} style={{
          height: 58, borderRadius: 14, border: `1.5px solid #e0d0c0`,
          background: "#fdf0e8", fontSize: 18, fontWeight: 700, cursor: "pointer", color: C.maroon
        }}>⌫</button>
        <button onClick={() => press("0")} style={{
          height: 58, borderRadius: 14, border: `1.5px solid #e0d0c0`,
          background: "white", fontSize: 22, fontWeight: 700, cursor: "pointer", color: C.dark
        }}>0</button>
        <button style={{
          height: 58, borderRadius: 14, border: "none",
          background: "#eee", fontSize: 20, cursor: "default", color: "#aaa"
        }}>✓</button>
      </div>
    </div>
  );
}

const ADMIN = { id: "admin", name: "IT Admin", role: "admin", code: "0000", avatar: "IT" };

export default function App() {
  const [users, setUsers]           = useState([]);
  const [log, setLog]               = useState([]);
  const [view, setView]             = useState("login");
  const [who, setWho]               = useState(null);
  const [pinError, setPinError]     = useState("");
  const [checkinResult, setCheckinResult] = useState(null);
  const [form, setForm]             = useState({ name: "", role: "resident" });
  const [loading, setLoading]       = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  // ── Load users & log from Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (view === "admin") fetchAll();
    if (view === "host")  fetchLog();
  }, [view]);

  async function fetchAll() {
    setPageLoading(true);
    const { data: u } = await supabase.from("users").select("*").order("created_at");
    const { data: l } = await supabase.from("checkins").select("*").order("checked_in_at", { ascending: false }).limit(30);
    if (u) setUsers(u);
    if (l) setLog(l);
    setPageLoading(false);
  }

  async function fetchLog() {
    const { data } = await supabase.from("checkins").select("*").order("checked_in_at", { ascending: false }).limit(30);
    if (data) setLog(data);
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  async function handleLogin(pin) {
    setPinError("");
    if (pin === ADMIN.code) { setWho(ADMIN); setView("admin"); return; }
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*").eq("code", pin).single();
    setLoading(false);
    if (error || !data) { setPinError("Invalid code. Please try again."); return; }
    setWho(data);
    setView("checkin");
  }

  // ── Check-in ─────────────────────────────────────────────────────────────────
  async function doCheckin() {
    if (!who || who.meals === 0) { setCheckinResult({ noMeals: true }); return; }
    setLoading(true);
    const newMeals = who.meals - 1;
    const { data: updated } = await supabase
      .from("users").update({ meals: newMeals }).eq("id", who.id).select().single();
    await supabase.from("checkins").insert({
      user_id: who.id, name: who.name, role: who.role,
      code: who.code, remaining: newMeals
    });
    setLoading(false);
    if (updated) {
      setWho(updated);
      setCheckinResult({ ok: true, user: updated });
    }
  }

  // ── Admin: add user ───────────────────────────────────────────────────────────
  async function addUser() {
    if (!form.name.trim()) return;
    const code = genCode(form.role);
    const avatar = form.name.trim().split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    setLoading(true);
    const { data } = await supabase.from("users")
      .insert({ name: form.name.trim(), role: form.role, code, avatar, meals: 14 })
      .select().single();
    setLoading(false);
    if (data) { setUsers(prev => [...prev, data]); setForm({ name: "", role: "resident" }); }
  }

  async function renewUser(id) {
    await supabase.from("users").update({ meals: 14 }).eq("id", id);
    setUsers(p => p.map(u => u.id === id ? { ...u, meals: 14 } : u));
  }

  async function removeUser(id) {
    await supabase.from("users").delete().eq("id", id);
    setUsers(p => p.filter(u => u.id !== id));
  }

  async function regenCode(id, role) {
    const code = genCode(role);
    await supabase.from("users").update({ code }).eq("id", id);
    setUsers(p => p.map(u => u.id === id ? { ...u, code } : u));
  }

  const signOut = () => { setWho(null); setView("login"); setCheckinResult(null); setPinError(""); };

  const Header = ({ extra }) => (
    <div style={{ background: `linear-gradient(135deg,${C.maroon},${C.dark})`, color: "white", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1.5 }}>THE ART OF LIVING</div>
        <div style={{ fontSize: 10, color: `${C.lightGold}99` }}>Retreat Center · Dining Hall</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {extra}
        <Btn label="Sign out" onClick={signOut} variant="outline" small style={{ borderColor: "rgba(255,255,255,0.4)", color: "white", fontSize: 11 }} />
      </div>
    </div>
  );

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  if (view === "login") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg,${C.cream},#efe5d5)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Georgia,serif" }}>
      <Card style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
        <AOLLogo />
        <div style={{ fontWeight: 800, color: C.maroon, fontSize: 14, letterSpacing: 1.5 }}>THE ART OF LIVING</div>
        <div style={{ color: C.gold, fontSize: 11, marginBottom: 6 }}>Retreat Center · Dining Hall</div>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 24 }}>Enter your 4-digit code to check in</div>
        {loading
          ? <div style={{ padding: 30, color: C.maroon, fontWeight: 700 }}>Checking code…</div>
          : <PinPad onSubmit={handleLogin} error={pinError} />
        }
        <div style={{ marginTop: 16 }}>
          <Btn label="📺 Host Display (no login needed)" onClick={() => setView("host")} variant="ghost" small />
        </div>
      </Card>
    </div>
  );

  // ── HOST DISPLAY ─────────────────────────────────────────────────────────────
  if (view === "host") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg,${C.cream},#efe5d5)`, fontFamily: "Georgia,serif" }}>
      <div style={{ background: `linear-gradient(135deg,${C.maroon},${C.dark})`, color: "white", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1.5 }}>THE ART OF LIVING</div>
          <div style={{ fontSize: 10, color: `${C.lightGold}99` }}>Retreat Center · Dining Hall</div>
        </div>
        <Btn label="← Back" onClick={() => setView("login")} variant="outline" small style={{ borderColor: "rgba(255,255,255,0.4)", color: "white" }} />
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        <Card style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Now Serving</div>
          <div style={{ color: C.maroon, fontSize: 26, fontWeight: 800, marginBottom: 2 }}>Dining Hall Open</div>
          <div style={{ color: "#999", fontSize: 13, marginBottom: 22 }}>{dateStr} · {timeStr}</div>
          <QRDisplay />
          <div style={{ marginTop: 18, color: "#555", fontSize: 15, fontWeight: 700 }}>Scan & enter your 4-digit code</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#aaa" }}>
            Staff codes start with <b style={{ color: C.maroon }}>9</b> · Resident codes start with <b style={{ color: C.maroon }}>6</b>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 800, color: C.maroon, fontSize: 16 }}>Live Check-ins Today</div>
            <Btn label="🔄 Refresh" onClick={fetchLog} variant="outline" small />
          </div>
          {log.length === 0 && <div style={{ color: "#ccc", fontSize: 13 }}>No check-ins yet.</div>}
          {log.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < log.length - 1 ? "1px solid #f0e0cc" : "none" }}>
              <Avatar initials={(c.name || "?").split(" ").map(n => n[0]).join("")} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#999" }}>
                  <Badge label={c.role} /> · {new Date(c.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Code: {c.code}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: c.remaining <= 3 ? "#c00" : C.gold }}>{c.remaining} left</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  // ── CHECK-IN ─────────────────────────────────────────────────────────────────
  if (view === "checkin") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg,${C.cream},#efe5d5)`, fontFamily: "Georgia,serif" }}>
      <Header extra={
        <div style={{ fontSize: 13, fontWeight: 700, color: "white", textAlign: "right" }}>
          <div>{who.name}</div>
          <div style={{ fontSize: 10, color: `${C.lightGold}bb` }}>Code: {who.code}</div>
        </div>
      } />
      <div style={{ maxWidth: 400, margin: "30px auto", padding: "0 16px", textAlign: "center" }}>
        {!checkinResult && (
          <Card>
            <Avatar initials={who.avatar} size={60} />
            <div style={{ fontWeight: 800, fontSize: 22, color: C.maroon, marginTop: 12 }}>{who.name}</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "8px 0 16px" }}>
              <Badge label={who.role} />
            </div>
            <div style={{ fontWeight: 700, color: C.dark, marginBottom: 4 }}>Meal Balance</div>
            <MealDots remaining={who.meals} />
            <div style={{ fontWeight: 800, fontSize: 26, color: who.meals <= 3 ? "#c00" : C.maroon, margin: "6px 0" }}>
              {who.meals} <span style={{ fontSize: 16, fontWeight: 400, color: "#999" }}>/ 14 meals</span>
            </div>
            {who.meals <= 3 && who.meals > 0 && <div style={{ color: "#e05", fontSize: 12, marginBottom: 10 }}>⚠️ Running low — renew at front desk!</div>}
            {who.meals === 0
              ? <div style={{ background: "#fde8e8", borderRadius: 12, padding: 14, color: "#b00", fontSize: 13, margin: "14px 0" }}>
                  Balance is 0. Please visit the front desk to renew your 14-meal plan.
                </div>
              : <Btn label={loading ? "Checking in…" : "✅ Check In This Meal"} onClick={doCheckin} disabled={loading} style={{ marginTop: 14, width: "100%" }} />
            }
          </Card>
        )}
        {checkinResult?.ok && (
          <Card>
            <div style={{ fontSize: 60 }}>✅</div>
            <div style={{ color: "#2a9d4e", fontWeight: 800, fontSize: 24, margin: "10px 0 4px" }}>Enjoy your meal!</div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 18 }}>{dateStr} · {timeStr}</div>
            <MealDots remaining={checkinResult.user.meals} />
            <div style={{ fontWeight: 800, fontSize: 22, color: checkinResult.user.meals <= 3 ? "#c00" : C.maroon, margin: "6px 0" }}>
              {checkinResult.user.meals} meals remaining
            </div>
            {checkinResult.user.meals <= 3 && <div style={{ color: "#e05", fontSize: 12, marginTop: 4 }}>⚠️ Renew soon at the front desk!</div>}
            <Btn label="Done" onClick={() => setCheckinResult(null)} style={{ marginTop: 20, width: "100%" }} />
          </Card>
        )}
        {checkinResult?.noMeals && (
          <Card>
            <div style={{ fontSize: 52 }}>⚠️</div>
            <div style={{ color: C.maroon, fontWeight: 800, fontSize: 20, margin: "10px 0" }}>No Meals Remaining</div>
            <div style={{ color: "#777", marginBottom: 20 }}>Please visit the front desk to renew your 14-meal plan.</div>
            <Btn label="Back" onClick={() => setCheckinResult(null)} />
          </Card>
        )}
      </div>
    </div>
  );

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  if (view === "admin") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg,${C.cream},#efe5d5)`, fontFamily: "Georgia,serif" }}>
      <Header extra={
        <Btn label="📺 Host View" onClick={() => setView("host")} variant="outline" small style={{ borderColor: "rgba(255,255,255,0.4)", color: "white", fontSize: 11 }} />
      } />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {pageLoading
          ? <div style={{ textAlign: "center", padding: 60, color: C.maroon, fontWeight: 700 }}>Loading…</div>
          : <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total Users",    val: users.length },
                { label: "Staff",          val: users.filter(u => u.role === "staff").length },
                { label: "Residents",      val: users.filter(u => u.role === "resident").length },
                { label: "Low Balance ⚠️", val: users.filter(u => u.meals <= 3).length, warn: true },
              ].map(s => (
                <Card key={s.label} style={{ textAlign: "center", padding: 14 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.warn && s.val > 0 ? "#c00" : C.maroon }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{s.label}</div>
                </Card>
              ))}
            </div>

            {/* Add user */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, color: C.maroon, fontSize: 15, marginBottom: 14 }}>➕ Add New User</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  style={{ flex: 2, minWidth: 160, padding: "10px 14px", borderRadius: 10, border: `2px solid ${C.gold}`, fontSize: 14, outline: "none" }} />
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  style={{ flex: 1, minWidth: 140, padding: "10px 12px", borderRadius: 10, border: `2px solid ${C.gold}`, fontSize: 14, background: "white" }}>
                  <option value="resident">Resident (6xxx)</option>
                  <option value="staff">Staff (9xxx)</option>
                </select>
                <Btn label={loading ? "Adding…" : "Add User"} onClick={addUser} disabled={!form.name.trim() || loading} variant="gold" />
              </div>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>Code is auto-generated. Staff → 9xxx · Resident → 6xxx</div>
            </Card>

            {/* User list */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, color: C.maroon, fontSize: 15, marginBottom: 14 }}>👥 All Users</div>
              {users.length === 0 && <div style={{ color: "#ccc", fontSize: 13 }}>No users yet. Add one above.</div>}
              {users.map((u, i) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < users.length - 1 ? "1px solid #f0e0cc" : "none" }}>
                  <Avatar initials={u.avatar} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                    <div style={{ display: "flex", gap: 5, margin: "4px 0", flexWrap: "wrap" }}>
                      <Badge label={u.role} />
                      {u.meals <= 3 && <span style={{ fontSize: 11, color: "#c00", fontWeight: 700 }}>⚠️ Low</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <div style={{ background: C.soft, borderRadius: 8, padding: "4px 12px", fontFamily: "monospace", fontWeight: 800, fontSize: 20, color: C.maroon, letterSpacing: 4, border: `1.5px solid ${C.gold}` }}>{u.code}</div>
                      <button onClick={() => regenCode(u.id, u.role)} title="Regenerate code"
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.gold }}>🔄</button>
                    </div>
                    <MealDots remaining={u.meals} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: u.meals <= 3 ? "#c00" : C.gold }}>{u.meals}/14 meals</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {u.meals < 14 && <Btn label="🔄 Renew" onClick={() => renewUser(u.id)} small variant="gold" />}
                    <Btn label="🗑 Remove" onClick={() => removeUser(u.id)} small variant="danger" />
                  </div>
                </div>
              ))}
            </Card>

            {/* Check-in log */}
            <Card>
              <div style={{ fontWeight: 800, color: C.maroon, fontSize: 15, marginBottom: 14 }}>📋 Check-in Log</div>
              {log.length === 0 && <div style={{ color: "#ccc", fontSize: 13 }}>No check-ins yet.</div>}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid #f0e0cc`, color: "#999", fontWeight: 700, fontSize: 11, textAlign: "left" }}>
                      <th style={{ padding: "6px 8px" }}>Name</th>
                      <th style={{ padding: "6px 8px" }}>Code</th>
                      <th style={{ padding: "6px 8px" }}>Role</th>
                      <th style={{ padding: "6px 8px" }}>Time</th>
                      <th style={{ padding: "6px 8px" }}>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.map((c, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8ece0" }}>
                        <td style={{ padding: "8px", fontWeight: 700 }}>{c.name}</td>
                        <td style={{ padding: "8px", fontFamily: "monospace", fontWeight: 800, color: C.maroon, letterSpacing: 2 }}>{c.code}</td>
                        <td style={{ padding: "8px" }}><Badge label={c.role} /></td>
                        <td style={{ padding: "8px", color: "#999" }}>{new Date(c.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                        <td style={{ padding: "8px", fontWeight: 700, color: c.remaining <= 3 ? "#c00" : C.gold }}>{c.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        }
      </div>
    </div>
  );

  return null;
}