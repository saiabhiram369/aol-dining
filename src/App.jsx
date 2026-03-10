import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  maroon: "#6B1F1F", gold: "#D4890A", lightGold: "#F5C842",
  cream: "#FDF6EC", dark: "#3B1A1A", soft: "#F9F4EF",
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
  return (
    <div style={{ background: "white", borderRadius: 18, padding: 24,
      boxShadow: "0 3px 16px rgba(107,31,31,0.10)", ...style }}>{children}</div>
  );
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

function AOLLogo({ height = 64 }) {
  return <img src="/logo.jpg" alt="Art of Living" style={{ height, objectFit: "contain", display: "block", margin: "0 auto 4px" }} />;
}

function PinPad({ onSubmit, error }) {
  const [pin, setPin] = useState("");
  useEffect(() => {
    if (pin.length === 4) { onSubmit(pin); setTimeout(() => setPin(""), 600); }
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 260, margin: "0 auto" }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => press(String(n))} style={{
            height: 62, borderRadius: 14, border: `1.5px solid #e0d0c0`,
            background: "white", fontSize: 24, fontWeight: 700, cursor: "pointer", color: C.dark,
            boxShadow: "0 2px 6px rgba(0,0,0,0.07)"
          }}>{n}</button>
        ))}
        <button onClick={del} style={{ height: 62, borderRadius: 14, border: `1.5px solid #e0d0c0`, background: "#fdf0e8", fontSize: 18, fontWeight: 700, cursor: "pointer", color: C.maroon }}>⌫</button>
        <button onClick={() => press("0")} style={{ height: 62, borderRadius: 14, border: `1.5px solid #e0d0c0`, background: "white", fontSize: 24, fontWeight: 700, cursor: "pointer", color: C.dark }}>0</button>
        <button style={{ height: 62, borderRadius: 14, border: "none", background: "#eee", fontSize: 20, cursor: "default", color: "#aaa" }}>✓</button>
      </div>
    </div>
  );
}

const ADMIN = { id: "admin", name: "IT Admin", role: "admin", code: "0000", avatar: "IT" };

export default function App() {
  const [users, setUsers]         = useState([]);
  const [log, setLog]             = useState([]);
  const [view, setView]           = useState("login");
  const [who, setWho]             = useState(null);
  const [pinError, setPinError]   = useState("");
  const [checkinResult, setCheckinResult] = useState(null);
  const [form, setForm]           = useState({ name: "", role: "resident" });
  const [loading, setLoading]     = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [myHistory, setMyHistory] = useState([]);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [hostPin, setHostPin]         = useState("");
  const [hostPinError, setHostPinError] = useState("");
  const [hostLoading, setHostLoading] = useState(false);
  const [hostResult, setHostResult]   = useState(null); // { user, remaining } after success

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    if (view === "admin") fetchAll();
    if (view === "host")  fetchLog();
  }, [view]);

  useEffect(() => {
    if (who && who.role !== "admin") fetchMyHistory();
  }, [who]);

  async function fetchAll() {
    setPageLoading(true);
    const { data: u } = await supabase.from("users").select("*").order("created_at");
    const { data: l } = await supabase.from("checkins").select("*").order("checked_in_at", { ascending: false }).limit(200);
    if (u) setUsers(u);
    if (l) setLog(l);
    setPageLoading(false);
  }

  function checkedInToday_user(userId) {
    const today = new Date().toDateString();
    return log.some(c => c.user_id === userId && new Date(c.checked_in_at).toDateString() === today);
  }

  async function fetchLog() {
    const { data } = await supabase.from("checkins").select("*").order("checked_in_at", { ascending: false }).limit(50);
    if (data) setLog(data);
  }

  async function fetchMyHistory() {
    const { data } = await supabase.from("checkins").select("*")
      .eq("user_id", who.id).order("checked_in_at", { ascending: false }).limit(30);
    if (data) {
      setMyHistory(data);
      const today = new Date().toDateString();
      setCheckedInToday(data.some(c => new Date(c.checked_in_at).toDateString() === today));
    }
  }

  async function handleLogin(pin) {
    setPinError("");
    if (pin === ADMIN.code) { setWho(ADMIN); setView("admin"); return; }
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*").eq("code", pin).single();
    setLoading(false);
    if (error || !data) { setPinError("Invalid code. Please try again."); return; }
    setWho(data); setView("checkin");
  }

  // Kiosk check-in
  async function handleHostPin() {
    if (hostPin.length !== 4) return;
    setHostPinError("");
    setHostLoading(true);
    const { data, error } = await supabase.from("users").select("*").eq("code", hostPin).single();
    if (error || !data) {
      setHostPinError("Code not found. Please try again.");
      setHostLoading(false);
      setHostPin("");
      return;
    }
    const today = new Date().toDateString();
    const { data: todayCheckins } = await supabase.from("checkins").select("*").eq("user_id", data.id);
    const alreadyIn = (todayCheckins || []).some(c => new Date(c.checked_in_at).toDateString() === today);
    if (alreadyIn) { setHostPinError(`${data.name} already checked in today.`); setHostLoading(false); setHostPin(""); return; }
    if (data.meals === 0) { setHostPinError(`${data.name} has no meals remaining. Please visit the front desk.`); setHostLoading(false); setHostPin(""); return; }
    const newMeals = data.meals - 1;
    await supabase.from("users").update({ meals: newMeals }).eq("id", data.id);
    await supabase.from("checkins").insert({ user_id: data.id, name: data.name, role: data.role, code: data.code, remaining: newMeals });
    setHostLoading(false);
    setHostPin("");
    setHostResult({ user: { ...data, meals: newMeals } });
    fetchLog();
    // Auto-reset after 4 seconds
    setTimeout(() => setHostResult(null), 4000);
  }

  async function doCheckin() {
    if (!who || who.meals === 0) { setCheckinResult({ noMeals: true }); return; }
    if (checkedInToday) { setCheckinResult({ alreadyCheckedIn: true }); return; }
    setLoading(true);
    const newMeals = who.meals - 1;
    const { data: updated } = await supabase.from("users").update({ meals: newMeals }).eq("id", who.id).select().single();
    await supabase.from("checkins").insert({ user_id: who.id, name: who.name, role: who.role, code: who.code, remaining: newMeals });
    setLoading(false);
    if (updated) { setWho(updated); setCheckinResult({ ok: true, user: updated }); setCheckedInToday(true); fetchMyHistory(); }
  }

  async function addUser() {
    if (!form.name.trim()) return;
    const code = genCode(form.role);
    const avatar = form.name.trim().split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    setLoading(true);
    const { data } = await supabase.from("users").insert({ name: form.name.trim(), role: form.role, code, avatar, meals: 14 }).select().single();
    setLoading(false);
    if (data) { setUsers(prev => [...prev, data]); setForm({ name: "", role: "resident" }); }
  }

  async function renewUser(id)       { await supabase.from("users").update({ meals: 14 }).eq("id", id); setUsers(p => p.map(u => u.id === id ? { ...u, meals: 14 } : u)); }
  async function removeUser(id)      { await supabase.from("users").delete().eq("id", id); setUsers(p => p.filter(u => u.id !== id)); }
  async function regenCode(id, role) { const code = genCode(role); await supabase.from("users").update({ code }).eq("id", id); setUsers(p => p.map(u => u.id === id ? { ...u, code } : u)); }

  const signOut = () => { setWho(null); setView("login"); setCheckinResult(null); setPinError(""); setMyHistory([]); setCheckedInToday(false); };

  const Header = ({ extra }) => (
    <div style={{ background: `linear-gradient(135deg,${C.maroon},${C.dark})`, color: "white", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <img src="/logo.jpg" alt="Art of Living" style={{ height: 48, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {extra}
        <Btn label="Sign out" onClick={signOut} variant="outline" small style={{ borderColor: "rgba(255,255,255,0.4)", color: "white", fontSize: 11 }} />
      </div>
    </div>
  );

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (view === "login") return (
    <div style={{ minHeight: "100vh", width: "100%", background: `linear-gradient(160deg,${C.cream},#efe5d5)`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Georgia,serif" }}>
      <Card style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <AOLLogo />
        <div style={{ fontWeight: 800, color: C.maroon, fontSize: 15, letterSpacing: 1.5 }}>THE ART OF LIVING</div>
        <div style={{ color: C.gold, fontSize: 12, marginBottom: 6 }}>Retreat Center · Dining Hall</div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 28 }}>Enter your 4-digit code to check in</div>
        {loading ? <div style={{ padding: 30, color: C.maroon, fontWeight: 700 }}>Checking code…</div>
          : <PinPad onSubmit={handleLogin} error={pinError} />}
        <div style={{ marginTop: 20 }}>
          <Btn label="📺 Host Display (no login needed)" onClick={() => setView("host")} variant="ghost" small />
        </div>
      </Card>
    </div>
  );

  // ── HOST DISPLAY ───────────────────────────────────────────────────────────
  if (view === "host") return (
    <div style={{ minHeight: "100vh", width: "100%", background: `linear-gradient(160deg,${C.cream},#efe5d5)`, fontFamily: "Georgia,serif" }}>
      <div style={{ background: `linear-gradient(135deg,${C.maroon},${C.dark})`, color: "white", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src="/logo.jpg" alt="Art of Living" style={{ height: 48, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        <Btn label="← Back" onClick={() => setView("login")} variant="outline" small style={{ borderColor: "rgba(255,255,255,0.4)", color: "white" }} />
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>

        {/* Status banner */}
        <Card style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Now Serving</div>
          <div style={{ color: C.maroon, fontSize: 28, fontWeight: 800, marginBottom: 2 }}>Dining Hall Open</div>
          <div style={{ color: "#999", fontSize: 13, marginBottom: 24 }}>{dateStr} · {timeStr}</div>

          {/* Kiosk pin pad or success screen */}
          {hostResult ? (
            <div style={{ background: "#e6f9ee", border: "2px solid #2a9d4e", borderRadius: 16, padding: "clamp(16px,3vw,28px) clamp(14px,3vw,24px)", textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 800, color: "#1a7a3e", fontSize: 22, marginBottom: 4 }}>
                Welcome, {hostResult.user.name}!
              </div>
              <div style={{ color: "#2a9d4e", fontSize: 14, marginBottom: 16 }}>Enjoy your meal 🙏</div>
              <MealDots remaining={hostResult.user.meals} />
              <div style={{ fontWeight: 800, fontSize: 20, color: hostResult.user.meals <= 3 ? "#c00" : C.maroon, marginTop: 6 }}>
                {hostResult.user.meals} <span style={{ fontWeight: 400, fontSize: 14, color: "#999" }}>/ 14 meals remaining</span>
              </div>
              {hostResult.user.meals <= 3 && (
                <div style={{ marginTop: 10, color: "#c00", fontSize: 12, fontWeight: 700 }}>⚠️ Please renew at the front desk soon!</div>
              )}
              <div style={{ marginTop: 18, color: "#999", fontSize: 12 }}>Resetting in a moment…</div>
            </div>
          ) : (
            <div style={{ background: C.soft, borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ fontWeight: 800, color: C.maroon, fontSize: 16, marginBottom: 4 }}>Enter Your 4-Digit Code</div>
              <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>
                Staff codes start with <b style={{ color: C.maroon }}>9</b> · Resident codes start with <b style={{ color: C.maroon }}>6</b>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{
                    width: 48, height: 56, borderRadius: 12,
                    border: `2px solid ${i < hostPin.length ? C.maroon : "#ddd"}`,
                    background: i < hostPin.length ? "#fff5f0" : "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 800, color: C.maroon,
                    transition: "all 0.15s"
                  }}>{hostPin[i] ? "●" : ""}</div>
                ))}
              </div>
              {hostPinError && <div style={{ color: "#c00", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{hostPinError}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 240, margin: "0 auto" }}>
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n}
                    onClick={() => { if (hostPin.length < 4) { const p = hostPin + n; setHostPin(p); if (p.length === 4) setTimeout(() => handleHostPin(), 0); } }}
                    style={{ height: 56, borderRadius: 12, border: `1.5px solid #e0d0c0`, background: "white", fontSize: 22, fontWeight: 700, cursor: "pointer", color: C.dark, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>{n}</button>
                ))}
                <button onClick={() => { setHostPin(p => p.slice(0,-1)); setHostPinError(""); }}
                  style={{ height: 56, borderRadius: 12, border: `1.5px solid #e0d0c0`, background: "#fdf0e8", fontSize: 16, fontWeight: 700, cursor: "pointer", color: C.maroon }}>⌫</button>
                <button onClick={() => { if (hostPin.length < 4) { const p = hostPin + "0"; setHostPin(p); if (p.length === 4) setTimeout(() => handleHostPin(), 0); } }}
                  style={{ height: 56, borderRadius: 12, border: `1.5px solid #e0d0c0`, background: "white", fontSize: 22, fontWeight: 700, cursor: "pointer", color: C.dark }}>0</button>
                <button onClick={handleHostPin} disabled={hostPin.length !== 4 || hostLoading}
                  style={{ height: 56, borderRadius: 12, border: "none", background: hostPin.length === 4 ? `linear-gradient(135deg,${C.maroon},${C.dark})` : "#eee", fontSize: 18, fontWeight: 700, cursor: hostPin.length === 4 ? "pointer" : "default", color: hostPin.length === 4 ? "white" : "#aaa" }}>
                  {hostLoading ? "…" : "✓"}
                </button>
              </div>
            </div>
          )}
          </Card>
          </div>

          {/* Right column — live check-ins */}
          <div>
          <Card style={{ height: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, color: C.maroon, fontSize: "clamp(14px,1.5vw,18px)" }}>Live Check-ins Today</div>
              <Btn label="🔄 Refresh" onClick={fetchLog} variant="outline" small />
            </div>
            {log.filter(c => new Date(c.checked_in_at).toDateString() === new Date().toDateString()).length === 0
              && <div style={{ color: "#ccc", fontSize: 13 }}>No check-ins yet.</div>}
            <div style={{ maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {log.filter(c => new Date(c.checked_in_at).toDateString() === new Date().toDateString()).map((c, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #f0e0cc" : "none" }}>
                  <Avatar initials={(c.name || "?").split(" ").map(n => n[0]).join("")} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#999" }}><Badge label={c.role} /> · {new Date(c.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Code: {c.code}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: c.remaining <= 3 ? "#c00" : C.gold }}>{c.remaining} left</div>
                </div>
              ))}
            </div>
          </Card>
          </div>

          </div>{/* end grid */}
        </div>
  );

  // ── CHECK-IN ───────────────────────────────────────────────────────────────
  if (view === "checkin") return (
    <div style={{ minHeight: "100vh", width: "100%", background: `linear-gradient(160deg,${C.cream},#efe5d5)`, fontFamily: "Georgia,serif" }}>
      <Header extra={
        <div style={{ fontSize: 13, fontWeight: 700, color: "white", textAlign: "right" }}>
          <div>{who.name}</div>
          <div style={{ fontSize: 10, color: `${C.lightGold}bb` }}>Code: {who.code}</div>
        </div>
      } />
      <div style={{ maxWidth: 480, margin: "24px auto", padding: "0 16px", textAlign: "center" }}>
        {!checkinResult && (
          <Card>
            <Avatar initials={who.avatar} size={64} />
            <div style={{ fontWeight: 800, fontSize: 22, color: C.maroon, marginTop: 12 }}>{who.name}</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "8px 0 16px" }}>
              <Badge label={who.role} />
            </div>
            {checkedInToday && (
              <div style={{ background: "#e6f9ee", border: "1.5px solid #2a9d4e", borderRadius: 12, padding: 12, color: "#1a7a3e", fontSize: 13, marginBottom: 14, fontWeight: 700 }}>
                ✅ You already checked in today!
              </div>
            )}
            {who.meals <= 3 && who.meals > 0 && (
              <div style={{ background: "#fff3e0", border: "1.5px solid #e05", borderRadius: 12, padding: 12, color: "#c00", fontSize: 13, marginBottom: 14, fontWeight: 700 }}>
                ⚠️ Only {who.meals} meal{who.meals !== 1 ? "s" : ""} left — renew at the front desk soon!
              </div>
            )}
            <div style={{ fontWeight: 700, color: C.dark, marginBottom: 4 }}>Meal Balance</div>
            <MealDots remaining={who.meals} />
            <div style={{ fontWeight: 800, fontSize: 26, color: who.meals <= 3 ? "#c00" : C.maroon, margin: "6px 0" }}>
              {who.meals} <span style={{ fontSize: 16, fontWeight: 400, color: "#999" }}>/ 14 meals</span>
            </div>
            {who.meals === 0
              ? <div style={{ background: "#fde8e8", borderRadius: 12, padding: 14, color: "#b00", fontSize: 13, margin: "14px 0" }}>
                  Balance is 0. Please visit the front desk to renew your 14-meal plan.
                </div>
              : !checkedInToday
                ? <Btn label={loading ? "Checking in…" : "✅ Check In This Meal"} onClick={doCheckin} disabled={loading} style={{ marginTop: 14, width: "100%" }} />
                : null
            }
            {myHistory.length > 0 && (
              <div style={{ marginTop: 24, textAlign: "left" }}>
                <div style={{ fontWeight: 800, color: C.maroon, fontSize: 15, marginBottom: 10 }}>📅 Your Check-in History</div>
                <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {myHistory.map((c, i) => {
                    const d = new Date(c.checked_in_at);
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 14px", borderRadius: 10,
                        background: isToday ? "#e6f9ee" : C.soft,
                        border: `1px solid ${isToday ? "#2a9d4e" : "#f0e0cc"}`
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: isToday ? "#1a7a3e" : C.dark }}>
                            {isToday ? "✅ Today" : d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                            {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: c.remaining <= 3 ? "#c00" : C.gold }}>
                          {c.remaining} meals left
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

        {checkinResult?.ok && (
          <Card>
            <div style={{ fontSize: 64 }}>✅</div>
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

        {checkinResult?.alreadyCheckedIn && (
          <Card>
            <div style={{ fontSize: 64 }}>✅</div>
            <div style={{ color: "#2a9d4e", fontWeight: 800, fontSize: 22, margin: "10px 0" }}>Already checked in today!</div>
            <div style={{ color: "#777", fontSize: 13, marginBottom: 20 }}>You've already used your meal for today. See you next meal!</div>
            <MealDots remaining={who.meals} />
            <div style={{ fontWeight: 800, fontSize: 20, color: who.meals <= 3 ? "#c00" : C.maroon, margin: "8px 0" }}>{who.meals} meals remaining</div>
            <Btn label="Back" onClick={() => setCheckinResult(null)} style={{ marginTop: 16, width: "100%" }} />
          </Card>
        )}

        {checkinResult?.noMeals && (
          <Card>
            <div style={{ fontSize: 56 }}>⚠️</div>
            <div style={{ color: C.maroon, fontWeight: 800, fontSize: 20, margin: "10px 0" }}>No Meals Remaining</div>
            <div style={{ color: "#777", marginBottom: 20 }}>Please visit the front desk to renew your 14-meal plan.</div>
            <Btn label="Back" onClick={() => setCheckinResult(null)} style={{ width: "100%" }} />
          </Card>
        )}
      </div>
    </div>
  );

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  if (view === "admin") return (
    <div style={{ minHeight: "100vh", width: "100%", background: `linear-gradient(160deg,${C.cream},#efe5d5)`, fontFamily: "Georgia,serif" }}>
      <Header extra={
        <Btn label="📺 Host View" onClick={() => setView("host")} variant="outline" small style={{ borderColor: "rgba(255,255,255,0.4)", color: "white", fontSize: 11 }} />
      } />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
        {pageLoading ? <div style={{ textAlign: "center", padding: 60, color: C.maroon, fontWeight: 700 }}>Loading…</div> : <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
            {[
              { label: "Total Users",       val: users.length },
              { label: "Checked In Today",  val: users.filter(u => checkedInToday_user(u.id)).length, good: true },
              { label: "Not Yet Today",     val: users.filter(u => !checkedInToday_user(u.id)).length },
              { label: "Low Balance ⚠️",    val: users.filter(u => u.meals <= 3).length, warn: true },
            ].map(s => (
              <Card key={s.label} style={{ textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.warn && s.val > 0 ? "#c00" : s.good ? "#1a7a3e" : C.maroon }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, color: C.maroon, fontSize: 15, marginBottom: 14 }}>➕ Add New User</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                style={{ flex: 2, minWidth: 160, padding: "10px 14px", borderRadius: 10, border: `2px solid ${C.gold}`, fontSize: 14, outline: "none" }} />
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{ flex: 1, minWidth: 150, padding: "10px 12px", borderRadius: 10, border: `2px solid ${C.gold}`, fontSize: 14, background: "white" }}>
                <option value="resident">Resident (6xxx)</option>
                <option value="staff">Staff (9xxx)</option>
              </select>
              <Btn label={loading ? "Adding…" : "Add User"} onClick={addUser} disabled={!form.name.trim() || loading} variant="gold" />
            </div>
            <div style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>Code is auto-generated · Staff → 9xxx · Resident → 6xxx</div>
          </Card>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, color: C.maroon, fontSize: 15, marginBottom: 14 }}>👥 All Users</div>
            {users.length === 0 && <div style={{ color: "#ccc", fontSize: 13 }}>No users yet. Add one above.</div>}
            {users.map((u, i) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < users.length - 1 ? "1px solid #f0e0cc" : "none" }}>
                <Avatar initials={u.avatar} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                  <div style={{ display: "flex", gap: 5, margin: "4px 0", flexWrap: "wrap", alignItems: "center" }}>
                    <Badge label={u.role} />
                    {checkedInToday_user(u.id)
                      ? <span style={{ fontSize: 11, fontWeight: 700, color: "#1a7a3e", background: "#e6f9ee", padding: "2px 8px", borderRadius: 20 }}>✅ Checked in today</span>
                      : <span style={{ fontSize: 11, fontWeight: 700, color: "#999", background: "#f5f5f5", padding: "2px 8px", borderRadius: 20 }}>⬜ Not yet today</span>
                    }
                    {u.meals <= 3 && <span style={{ fontSize: 11, color: "#c00", fontWeight: 700 }}>⚠️ Low balance</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <div style={{ background: C.soft, borderRadius: 8, padding: "4px 14px", fontFamily: "monospace", fontWeight: 800, fontSize: 22, color: C.maroon, letterSpacing: 5, border: `1.5px solid ${C.gold}` }}>{u.code}</div>
                    <button onClick={() => regenCode(u.id, u.role)} title="Regenerate code" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.gold }}>🔄</button>
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
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, color: C.maroon, fontSize: 15 }}>📋 Check-in Log</div>
              <Btn label="🔄 Refresh" onClick={fetchAll} variant="outline" small />
            </div>
            {log.length === 0 && <div style={{ color: "#ccc", fontSize: 13 }}>No check-ins yet.</div>}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid #f0e0cc`, color: "#999", fontWeight: 700, fontSize: 11, textAlign: "left" }}>
                    <th style={{ padding: "6px 8px" }}>Name</th>
                    <th style={{ padding: "6px 8px" }}>Code</th>
                    <th style={{ padding: "6px 8px" }}>Role</th>
                    <th style={{ padding: "6px 8px" }}>Date</th>
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
                      <td style={{ padding: "8px", color: "#999" }}>{new Date(c.checked_in_at).toLocaleDateString([], { month: "short", day: "numeric" })}</td>
                      <td style={{ padding: "8px", color: "#999" }}>{new Date(c.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td style={{ padding: "8px", fontWeight: 700, color: c.remaining <= 3 ? "#c00" : C.gold }}>{c.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>}
      </div>
    </div>
  );

  return null;
}