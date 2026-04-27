import React, { useState, useEffect } from "react";

// ============================================================
//  🔧 SETUP: Replace these 2 values with your Supabase project
//  Get them from: supabase.com → your project → Settings → API
// ============================================================
const SUPABASE_URL = "https://hrgzwpdpxnsfeulvlrtp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ3p3cGRweG5zZmV1bHZscnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNjYyNDYsImV4cCI6MjA5Mjg0MjI0Nn0.2_2dfbbesh-lgurJnHyMHXqkvmZEfop2Wm-vL-WFI68";
// ============================================================

const query = async (table, method = "GET", body = null, extra = "") => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${extra}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : [];
};

const TABS = ["🔍 Job Seekers", "🏢 Hiring Now"];

function Avatar({ name, size = 38 }) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#f97316","#06b6d4","#8b5cf6","#10b981","#f43f5e","#eab308","#3b82f6","#ec4899"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.36, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ text, color }) {
  const p = { green: ["#d1fae5","#065f46"], blue: ["#dbeafe","#1e40af"], purple: ["#ede9fe","#6d28d9"], orange: ["#ffedd5","#c2410c"] }[color] || ["#f1f5f9","#334155"];
  return <span style={{ background: p[0], color: p[1], borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.4px" }}>{text}</span>;
}

function SkillPill({ label }) {
  return <span style={{ background: "#f1f5f9", color: "#334155", borderRadius: 8, padding: "3px 9px", fontSize: 11, fontWeight: 600 }}>{label}</span>;
}

function Input({ label, value, onChange, placeholder, textarea, type = "text" }) {
  const base = { width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", background: "#f8fafc", color: "#0d1117", boxSizing: "border-box" };
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, letterSpacing: "0.6px", textTransform: "uppercase" }}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, minHeight: 80, resize: "vertical" }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,15,30,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: "26px 24px", maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 28px 80px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#0d1117" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 15, color: "#64748b", fontWeight: 700 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", background: "#0d1117", color: "#fff", borderRadius: 14, padding: "10px 22px", fontSize: 13, fontWeight: 700, zIndex: 300, whiteSpace: "nowrap", boxShadow: "0 8px 30px rgba(0,0,0,0.3)", animation: "fadeIn 0.2s ease" }}>
      {msg}
    </div>
  );
}

function SeekerCard({ s, onContact }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "18px 20px", marginBottom: 12, boxShadow: "0 2px 16px rgba(79,70,229,0.07)", border: "1px solid #ede9fe" }}>
      <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
        <Avatar name={s.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0d1117", fontFamily: "'Syne', sans-serif" }}>{s.name}</div>
              <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, marginTop: 1 }}>{s.role}</div>
            </div>
            {s.location && <Badge text={`📍 ${s.location}`} color="blue" />}
          </div>
          {s.skills && (
            <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: 5 }}>
              {s.skills.split(",").map((sk, i) => <SkillPill key={i} label={sk.trim()} />)}
            </div>
          )}
          {s.looking_for && (
            <div style={{ marginTop: 9, fontSize: 13, color: "#475569" }}>
              <span style={{ fontWeight: 700, color: "#0d1117" }}>Looking for:</span> {s.looking_for}
            </div>
          )}
          <div style={{ marginTop: 5, fontSize: 11, color: "#94a3b8" }}>
            {s.experience && `⏱ ${s.experience} exp  •  `}Posted {new Date(s.created_at).toLocaleDateString()}
          </div>
          <button onClick={() => onContact(s)} style={{ marginTop: 11, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            💬 I can refer / help
          </button>
        </div>
      </div>
    </div>
  );
}

function HiringCard({ h, onContact }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "18px 20px", marginBottom: 12, boxShadow: "0 2px 16px rgba(16,185,129,0.07)", border: "1px solid #d1fae5" }}>
      <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
        <Avatar name={h.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0d1117", fontFamily: "'Syne', sans-serif" }}>{h.role}</div>
              <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700, marginTop: 1 }}>@ {h.company}</div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {h.employment_type && <Badge text={h.employment_type} color="green" />}
              {h.location && <Badge text={`📍 ${h.location}`} color="purple" />}
            </div>
          </div>
          {h.description && <div style={{ marginTop: 9, fontSize: 13, color: "#475569", lineHeight: 1.55 }}>{h.description}</div>}
          <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
            Posted by {h.name} ({h.contact})  •  {new Date(h.created_at).toLocaleDateString()}
          </div>
          <button onClick={() => onContact(h)} style={{ marginTop: 11, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ✉️ I'm interested
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_S = { name: "", role: "", skills: "", experience: "", location: "", looking_for: "", contact: "" };
const EMPTY_H = { name: "", company: "", role: "", employment_type: "Full-time", location: "", description: "", contact: "" };

export default function App() {
  const [tab, setTab] = useState(0);
  const [seekers, setSeekers] = useState([]);
  const [hirings, setHirings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showSF, setShowSF] = useState(false);
  const [showHF, setShowHF] = useState(false);
  const [sf, setSf] = useState(EMPTY_S);
  const [hf, setHf] = useState(EMPTY_H);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const isConfigured = SUPABASE_URL !== "https://YOUR_PROJECT_ID.supabase.co";

  const fetchAll = async () => {
    if (!isConfigured) { setLoading(false); return; }
    try {
      setLoading(true);
      const [s, h] = await Promise.all([
        query("job_seekers", "GET", null, "?order=created_at.desc"),
        query("hiring_posts", "GET", null, "?order=created_at.desc"),
      ]);
      setSeekers(s);
      setHirings(h);
    } catch (e) {
      setError("Could not connect to database. Check your Supabase URL and key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const addSeeker = async () => {
    if (!sf.name || !sf.role || !sf.contact) return showToast("⚠️ Name, role and contact are required");
    try {
      setSaving(true);
      await query("job_seekers", "POST", sf);
      setSf(EMPTY_S); setShowSF(false);
      await fetchAll();
      showToast("✅ Profile added! Community will help you.");
    } catch { showToast("❌ Failed to save. Check Supabase setup."); }
    finally { setSaving(false); }
  };

  const addHiring = async () => {
    if (!hf.name || !hf.company || !hf.role || !hf.contact) return showToast("⚠️ Name, company, role and contact are required");
    try {
      setSaving(true);
      await query("hiring_posts", "POST", hf);
      setHf(EMPTY_H); setShowHF(false);
      await fetchAll();
      showToast("✅ Hiring post added! Community will reach out.");
    } catch { showToast("❌ Failed to save. Check Supabase setup."); }
    finally { setSaving(false); }
  };

  const fs = seekers.filter(s => [s.name, s.role, s.skills, s.location, s.looking_for].join(" ").toLowerCase().includes(search.toLowerCase()));
  const fh = hirings.filter(h => [h.name, h.company, h.role, h.location, h.description].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f3ff; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 4px; }
      `}</style>

      <Toast msg={toast} />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #0ea5e9 100%)", padding: "26px 20px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 540, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 16, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🤝</div>
            <div>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 21, lineHeight: 1.1 }}>Community Jobs</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500, marginTop: 2 }}>Real-time · Shared · Referral-powered</div>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: isConfigured ? "#4ade80" : "#fbbf24" }} />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{isConfigured ? "Live" : "Setup needed"}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ fontSize: 15 }}>🔎</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, skill, role, company…" style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, flex: 1, fontFamily: "inherit" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 4, background: "rgba(0,0,0,0.18)", borderRadius: 14, padding: 4 }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "9px 0", borderRadius: 11, border: "none", background: tab === i ? "#fff" : "transparent", color: tab === i ? "#4f46e5" : "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Setup Banner */}
      {!isConfigured && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "12px 20px" }}>
          <div style={{ maxWidth: 540, margin: "0 auto", fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
            <strong>⚙️ Setup required:</strong> Open the code and replace <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 4 }}>SUPABASE_URL</code> and <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 4 }}>SUPABASE_ANON_KEY</code> with your Supabase project values. See instructions below the app.
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 16px 100px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 14 }}>Loading community board…</div>
          </div>
        ) : error ? (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: 16, fontSize: 13, color: "#991b1b", marginTop: 8 }}>
            ❌ {error}
          </div>
        ) : tab === 0 ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{fs.length} {fs.length === 1 ? "person" : "people"} looking for opportunities</div>
              <button onClick={() => setShowSF(true)} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                + Add Me
              </button>
            </div>
            {fs.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0", fontSize: 14 }}>No entries yet. Be the first!</div>}
            {fs.map(s => <SeekerCard key={s.id} s={s} onContact={setContact} />)}
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{fh.length} open {fh.length === 1 ? "position" : "positions"} from community</div>
              <button onClick={() => setShowHF(true)} style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                + Post Hiring
              </button>
            </div>
            {fh.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0", fontSize: 14 }}>No hiring posts yet. Know someone hiring?</div>}
            {fh.map(h => <HiringCard key={h.id} h={h} onContact={setContact} />)}
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #ede9fe", padding: "10px 16px", textAlign: "center", fontSize: 12, color: "#94a3b8", zIndex: 50 }}>
        📱 Share the app URL in your WhatsApp community — everyone sees the same data in real time
      </div>

      {/* Seeker Form */}
      {showSF && (
        <Modal title="🔍 I'm Looking for a Job" onClose={() => setShowSF(false)}>
          <Input label="Your Full Name *" value={sf.name} onChange={v => setSf(p => ({ ...p, name: v }))} placeholder="e.g. Priya Sharma" />
          <Input label="Current / Target Role *" value={sf.role} onChange={v => setSf(p => ({ ...p, role: v }))} placeholder="e.g. Software Engineer" />
          <Input label="Key Skills (comma-separated)" value={sf.skills} onChange={v => setSf(p => ({ ...p, skills: v }))} placeholder="e.g. React, Python, SQL" />
          <Input label="Years of Experience" value={sf.experience} onChange={v => setSf(p => ({ ...p, experience: v }))} placeholder="e.g. 4 years" />
          <Input label="City / Location" value={sf.location} onChange={v => setSf(p => ({ ...p, location: v }))} placeholder="e.g. Toronto, Remote" />
          <Input label="What I'm Looking For" value={sf.looking_for} onChange={v => setSf(p => ({ ...p, looking_for: v }))} placeholder="e.g. Senior SWE at product companies" textarea />
          <Input label="WhatsApp / Contact Handle *" value={sf.contact} onChange={v => setSf(p => ({ ...p, contact: v }))} placeholder="e.g. @yourname or +1 234 567 8900" />
          <button onClick={addSeeker} disabled={saving} style={{ width: "100%", background: saving ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 14, padding: "13px 0", fontSize: 15, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Syne', sans-serif", marginTop: 4 }}>
            {saving ? "Saving…" : "🚀 Add My Profile"}
          </button>
        </Modal>
      )}

      {/* Hiring Form */}
      {showHF && (
        <Modal title="🏢 We're Hiring!" onClose={() => setShowHF(false)}>
          <Input label="Your Name *" value={hf.name} onChange={v => setHf(p => ({ ...p, name: v }))} placeholder="e.g. Anil Kapoor" />
          <Input label="Company Name *" value={hf.company} onChange={v => setHf(p => ({ ...p, company: v }))} placeholder="e.g. TechNova Inc." />
          <Input label="Role / Position *" value={hf.role} onChange={v => setHf(p => ({ ...p, role: v }))} placeholder="e.g. Senior Product Manager" />
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, letterSpacing: "0.6px", textTransform: "uppercase" }}>Employment Type</label>
            <select value={hf.employment_type} onChange={e => setHf(p => ({ ...p, employment_type: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", background: "#f8fafc", color: "#0d1117", outline: "none" }}>
              {["Full-time","Part-time","Contract","Internship","Remote"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Location" value={hf.location} onChange={v => setHf(p => ({ ...p, location: v }))} placeholder="e.g. New York, Remote" />
          <Input label="Description & Ideal Candidate" value={hf.description} onChange={v => setHf(p => ({ ...p, description: v }))} placeholder="Briefly describe the role and what you're looking for…" textarea />
          <Input label="Your WhatsApp / Contact *" value={hf.contact} onChange={v => setHf(p => ({ ...p, contact: v }))} placeholder="e.g. @yourname or +1 234 567 8900" />
          <button onClick={addHiring} disabled={saving} style={{ width: "100%", background: saving ? "#6ee7b7" : "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 14, padding: "13px 0", fontSize: 15, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Syne', sans-serif", marginTop: 4 }}>
            {saving ? "Saving…" : "📢 Post Hiring Opportunity"}
          </button>
        </Modal>
      )}

      {/* Contact Modal */}
      {contact && (
        <Modal title="💬 Reach Out Directly" onClose={() => setContact(null)}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <Avatar name={contact.name} size={60} />
            <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif", color: "#0d1117" }}>{contact.name}</div>
            <div style={{ fontSize: 14, color: "#6366f1", fontWeight: 600, marginTop: 2 }}>{contact.role}{contact.company ? ` @ ${contact.company}` : ""}</div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 18px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>Contact on WhatsApp</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0d1117" }}>{contact.contact}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Message them directly and mention you saw their post in the community job board!</div>
          </div>
          <div style={{ background: "#fef3c7", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#92400e" }}>
            💡 <strong>Tip:</strong> Be specific — mention the role or skills when reaching out. It makes a great first impression!
          </div>
        </Modal>
      )}
    </>
  );
}
