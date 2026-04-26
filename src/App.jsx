import { useState, useEffect } from "react";

// ── Brand tokens ──────────────────────────────────────────────
const C = {
  bg: "#06060F",
  surface: "#0D0D1F",
  surfaceUp: "#131328",
  border: "rgba(255,255,255,0.07)",
  cyan: "#00E5FF",
  cyanDim: "rgba(0,229,255,0.12)",
  purple: "#7C3AED",
  purpleDim: "rgba(124,58,237,0.15)",
  text: "#F0F0FF",
  muted: "#7B7B9D",
  success: "#22D3A5",
};

const GOOGLE_FONT = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@700;800&display=swap');
`;

// ── Step data ─────────────────────────────────────────────────
const INDUSTRIES = [
  "Professional Services","Retail & E-commerce","Healthcare & Wellness",
  "Manufacturing","Finance & Accounting","Real Estate","Logistics & Supply Chain",
  "Education & Training","Marketing & Media","Technology / SaaS","Legal","Other",
];

const COMPANY_SIZES = [
  { label:"Solo / Freelancer", sub:"1 person", val:"1" },
  { label:"Micro business", sub:"2–10 people", val:"2-10" },
  { label:"Small business", sub:"11–50 people", val:"11-50" },
  { label:"Mid-market", sub:"51–250 people", val:"51-250" },
];

const WORKFLOW_AREAS = [
  { icon:"✉️", label:"Customer Communication" },
  { icon:"📄", label:"Document Processing" },
  { icon:"📊", label:"Reporting & Analytics" },
  { icon:"🛒", label:"Sales & Lead Generation" },
  { icon:"🧑‍💼", label:"HR & Recruiting" },
  { icon:"🔧", label:"IT & Operations" },
  { icon:"💰", label:"Finance & Invoicing" },
  { icon:"📣", label:"Marketing & Content" },
  { icon:"🗂️", label:"Project Management" },
  { icon:"📦", label:"Inventory & Logistics" },
];

const PAIN_POINTS = [
  "Too many manual, repetitive tasks",
  "Slow response times to customers",
  "Difficulty scaling without hiring",
  "Inconsistent quality across team",
  "Poor visibility into business data",
  "High cost of specialized expertise",
  "Too much time on admin work",
  "Hard to onboard new staff",
];

const BUDGETS = [
  { label:"Bootstrapped", sub:"< €500/mo", val:"low" },
  { label:"Growth", sub:"€500–2,000/mo", val:"medium" },
  { label:"Scale", sub:"€2,000–10,000/mo", val:"high" },
  { label:"Enterprise", sub:"> €10,000/mo", val:"enterprise" },
];

// ── API Call (secure — goes through /api/assess serverless fn) ─
async function runAssessment(answers) {
  const res = await fetch("/api/assess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── UI primitives ─────────────────────────────────────────────
function GlowDot({ color, x, y, size = 300, opacity = 0.18 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity, pointerEvents: "none", transform: "translate(-50%,-50%)", zIndex: 0,
    }} />
  );
}

function Logo({ size = 22 }) {
  return (
    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: size, letterSpacing: "-0.5px", color: C.text }}>
      agent<span style={{ color: C.purple }}>lyze</span>
    </span>
  );
}

function Pill({ children, color = C.cyan }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
      background: `${color}18`, border: `1px solid ${color}40`, color,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = "primary", disabled = false, style = {} }) {
  const base = {
    border: "none", borderRadius: 12, fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .2s", padding: "14px 28px", fontSize: 15,
    opacity: disabled ? 0.45 : 1, ...style,
  };
  const styles = {
    primary: { background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`, color: "#fff" },
    ghost: { background: "transparent", border: `1px solid ${C.border}`, color: C.text },
    outline: { background: "transparent", border: `1px solid ${C.purple}`, color: C.purple },
  };
  return <button onClick={disabled ? null : onClick} style={{ ...base, ...styles[variant] }}>{children}</button>;
}

function Progress({ step, total }) {
  return (
    <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 32 }}>
      <div style={{
        width: `${(step / total) * 100}%`, height: "100%",
        background: `linear-gradient(90deg, ${C.purple}, ${C.cyan})`,
        borderRadius: 99, transition: "width .4s ease",
      }} />
    </div>
  );
}

// ── Step shell ────────────────────────────────────────────────
function StepShell({ step, total, title, subtitle, children, onBack, onNext, nextLabel = "Continue →", nextDisabled = false }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px" }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Logo />
          <span style={{ color: C.muted, fontSize: 13 }}>{step} / {total}</span>
        </div>
        <Progress step={step} total={total} />
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>Step {step} of {total}</p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</h2>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>{subtitle}</p>
        {children}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {onBack && <Btn variant="ghost" onClick={onBack} style={{ flex: 1 }}>← Back</Btn>}
          <Btn onClick={onNext} disabled={nextDisabled} style={{ flex: 2 }}>{nextLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Screens ───────────────────────────────────────────────────
function Landing({ onStart }) {
  const features = [
    { icon: "🎯", title: "AI Opportunity Scan", desc: "Identify highest-value use cases for your specific business" },
    { icon: "🔧", title: "Tool Recommendations", desc: "Curated AI tools matched to your workflows and budget" },
    { icon: "📈", title: "ROI Projections", desc: "Concrete estimates of time and cost savings before you invest" },
    { icon: "🗺️", title: "Implementation Roadmap", desc: "Step-by-step plan to go from 0 to measurable results" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
      <GlowDot color={C.purple} x="20%" y="20%" size={500} opacity={0.12} />
      <GlowDot color={C.cyan} x="80%" y="10%" size={400} opacity={0.1} />
      <GlowDot color={C.purple} x="70%" y="70%" size={400} opacity={0.08} />
      <nav style={{ width: "100%", maxWidth: 1100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", position: "relative", zIndex: 10 }}>
        <Logo size={24} />
        <Pill>✦ AI Adoption Platform</Pill>
      </nav>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 24px 40px", position: "relative", zIndex: 5, maxWidth: 800 }}>
        <div style={{ marginBottom: 20 }}><Pill color={C.cyan}>Free Assessment · 3 minutes</Pill></div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 800, lineHeight: 1.05, margin: "0 0 24px", color: C.text }}>
          Stop overthinking.<br />
          <span style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start implementing.</span>
        </h1>
        <p style={{ fontSize: 18, color: C.muted, maxWidth: 560, lineHeight: 1.7, margin: "0 0 40px" }}>
          Agentlyze helps small and mid-sized businesses discover their highest-value AI opportunities, pick the right tools, and implement them — without an IT team.
        </p>
        <Btn onClick={onStart} style={{ fontSize: 16, padding: "16px 36px", borderRadius: 14 }}>
          Get My Free AI Assessment →
        </Btn>
        <div style={{ marginTop: 32, display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {["✓ No IT team required", "✓ Secure & compliant", "✓ Measurable results", "✓ Results from day one"].map(t => (
            <span key={t} style={{ color: C.muted, fontSize: 13 }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 1000, padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, position: "relative", zIndex: 5 }}>
        {features.map(f => (
          <div key={f.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 20px" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, color: C.text, marginBottom: 8 }}>{f.title}</div>
            <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIndustry({ data, onChange, onNext, onBack }) {
  return (
    <StepShell step={1} total={5} title="What industry are you in?" subtitle="We'll tailor your AI opportunities to your sector's specific workflows and tools." onBack={onBack} onNext={onNext} nextDisabled={!data.industry}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {INDUSTRIES.map(ind => (
          <button key={ind} onClick={() => onChange("industry", ind)} style={{
            background: data.industry === ind ? C.purpleDim : C.surface,
            border: `1px solid ${data.industry === ind ? C.purple : C.border}`,
            borderRadius: 12, padding: "14px 16px", textAlign: "left", cursor: "pointer",
            color: data.industry === ind ? C.text : C.muted,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            fontWeight: data.industry === ind ? 600 : 400, transition: "all .15s",
          }}>{ind}</button>
        ))}
      </div>
    </StepShell>
  );
}

function StepSize({ data, onChange, onNext, onBack }) {
  return (
    <StepShell step={2} total={5} title="How big is your team?" subtitle="Your company size shapes which AI solutions are practical and cost-effective." onBack={onBack} onNext={onNext} nextDisabled={!data.companySize}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {COMPANY_SIZES.map(s => (
          <button key={s.val} onClick={() => onChange("companySize", s.val)} style={{
            background: data.companySize === s.val ? C.purpleDim : C.surface,
            border: `1px solid ${data.companySize === s.val ? C.purple : C.border}`,
            borderRadius: 14, padding: "18px 20px", display: "flex",
            justifyContent: "space-between", alignItems: "center",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
          }}>
            <div>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 15 }}>{s.label}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{s.sub}</div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: 99,
              border: `2px solid ${data.companySize === s.val ? C.purple : C.border}`,
              background: data.companySize === s.val ? C.purple : "transparent", transition: "all .15s",
            }} />
          </button>
        ))}
      </div>
    </StepShell>
  );
}

function StepWorkflows({ data, onChange, onNext, onBack }) {
  const toggle = (w) => {
    const arr = data.workflows || [];
    onChange("workflows", arr.includes(w) ? arr.filter(x => x !== w) : [...arr, w]);
  };
  const sel = data.workflows || [];
  return (
    <StepShell step={3} total={5} title="Which workflows need improvement?" subtitle="Select all areas where you spend too much time or make avoidable mistakes." onBack={onBack} onNext={onNext} nextDisabled={sel.length === 0}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {WORKFLOW_AREAS.map(w => {
          const on = sel.includes(w.label);
          return (
            <button key={w.label} onClick={() => toggle(w.label)} style={{
              background: on ? C.purpleDim : C.surface,
              border: `1px solid ${on ? C.purple : C.border}`,
              borderRadius: 12, padding: "14px 14px", display: "flex",
              alignItems: "center", gap: 10, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
            }}>
              <span style={{ fontSize: 20 }}>{w.icon}</span>
              <span style={{ color: on ? C.text : C.muted, fontWeight: on ? 600 : 400, fontSize: 13 }}>{w.label}</span>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}

function StepPains({ data, onChange, onNext, onBack }) {
  const toggle = (p) => {
    const arr = data.painPoints || [];
    onChange("painPoints", arr.includes(p) ? arr.filter(x => x !== p) : [...arr, p]);
  };
  const sel = data.painPoints || [];
  return (
    <StepShell step={4} total={5} title="What are your biggest pain points?" subtitle="Be honest — this helps us find the highest-impact opportunities for your business." onBack={onBack} onNext={onNext} nextDisabled={sel.length === 0}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {PAIN_POINTS.map(p => {
          const on = sel.includes(p);
          return (
            <button key={p} onClick={() => toggle(p)} style={{
              background: on ? C.purpleDim : C.surface,
              border: `1px solid ${on ? C.purple : C.border}`,
              borderRadius: 12, padding: "14px 16px", textAlign: "left", cursor: "pointer",
              color: on ? C.text : C.muted, fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: on ? 600 : 400, transition: "all .15s",
            }}>{on ? "✓ " : ""}{p}</button>
          );
        })}
      </div>
      <div>
        <label style={{ color: C.muted, fontSize: 13, display: "block", marginBottom: 8 }}>Tools you currently use (optional)</label>
        <textarea value={data.currentTools || ""} onChange={e => onChange("currentTools", e.target.value)}
          placeholder="e.g. Excel, Slack, HubSpot, Google Workspace..."
          rows={2} style={{
            width: "100%", background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, color: C.text, fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, padding: "12px 16px", resize: "vertical", outline: "none", boxSizing: "border-box",
          }} />
      </div>
    </StepShell>
  );
}

function StepBudget({ data, onChange, onNext, onBack, error }) {
  return (
    <StepShell step={5} total={5} title="What's your AI budget range?" subtitle="This helps us recommend tools that fit your investment capacity." onBack={onBack} onNext={onNext} nextLabel="Run My Assessment →" nextDisabled={!data.budget}>
      {error && (
        <div style={{ background: "#FF444422", border: "1px solid #FF444466", borderRadius: 10, padding: "12px 16px", color: "#FF8888", fontSize: 13, marginBottom: 20 }}>
          ⚠️ {error} — please try again.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {BUDGETS.map(b => (
          <button key={b.val} onClick={() => onChange("budget", b.val)} style={{
            background: data.budget === b.val ? C.purpleDim : C.surface,
            border: `1px solid ${data.budget === b.val ? C.purple : C.border}`,
            borderRadius: 14, padding: "18px 16px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", textAlign: "left", transition: "all .15s",
          }}>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 15, marginBottom: 4 }}>{b.label}</div>
            <div style={{ color: C.muted, fontSize: 13 }}>{b.sub}</div>
          </button>
        ))}
      </div>
      <div>
        <label style={{ color: C.muted, fontSize: 13, display: "block", marginBottom: 8 }}>Anything else we should know? (optional)</label>
        <textarea value={data.freeText || ""} onChange={e => onChange("freeText", e.target.value)}
          placeholder="e.g. We're a bakery chain trying to reduce order errors..."
          rows={3} style={{
            width: "100%", background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, color: C.text, fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, padding: "12px 16px", resize: "vertical", outline: "none", boxSizing: "border-box",
          }} />
      </div>
    </StepShell>
  );
}

function Loading() {
  const [msgIdx, setMsgIdx] = useState(0);
  const msgs = [
    "Scanning your workflow patterns…",
    "Mapping AI opportunities to your industry…",
    "Calculating ROI projections…",
    "Selecting best-fit tools…",
    "Building your implementation roadmap…",
  ];
  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <GlowDot color={C.purple} x="50%" y="50%" size={600} opacity={0.15} />
      <Logo size={28} />
      <div style={{ marginTop: 48 }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          <circle cx={40} cy={40} r={34} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
          <circle cx={40} cy={40} r={34} fill="none" stroke="url(#lg)" strokeWidth={6}
            strokeLinecap="round" strokeDasharray="60 153"
            style={{ animation: "spin 1.4s linear infinite", transformOrigin: "40px 40px" }} />
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.purple} />
              <stop offset="100%" stopColor={C.cyan} />
            </linearGradient>
          </defs>
        </svg>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
      <p style={{ marginTop: 28, color: C.muted, fontSize: 15, minWidth: 280, textAlign: "center" }}>{msgs[msgIdx]}</p>
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 44, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={55} cy={55} r={r} fill="none" stroke="url(#sr)" strokeWidth={8}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 55 55)" />
        <defs>
          <linearGradient id="sr" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.purple} />
            <stop offset="100%" stopColor={C.cyan} />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: C.text }}>{score}</span>
        <span style={{ color: C.muted, fontSize: 10 }}>/ 100</span>
      </div>
    </div>
  );
}

function Results({ result, onRestart }) {
  const [expanded, setExpanded] = useState(null);
  const sorted = [...result.opportunities].sort((a, b) => (b.quickWin ? 1 : 0) - (a.quickWin ? 1 : 0));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 20px 80px", position: "relative", overflow: "hidden" }}>
      <GlowDot color={C.purple} x="80%" y="10%" size={400} opacity={0.1} />
      <GlowDot color={C.cyan} x="10%" y="60%" size={350} opacity={0.08} />
      <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 5 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <Logo />
          <Btn variant="ghost" onClick={onRestart} style={{ padding: "10px 18px", fontSize: 13 }}>New Assessment</Btn>
        </div>

        {/* Score card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Your AI Readiness Report</div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <ScoreRing score={result.readinessScore} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>
                AI Readiness: {result.readinessLabel}
              </h2>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{result.readinessSummary}</p>
            </div>
          </div>
          <div style={{ marginTop: 20, padding: "14px 18px", background: `linear-gradient(135deg, ${C.purpleDim}, ${C.cyanDim})`, borderRadius: 12, border: `1px solid rgba(124,58,237,0.2)` }}>
            <span style={{ color: C.cyan, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>✦ KEY INSIGHT  </span>
            <span style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{result.topInsight}</span>
          </div>
        </div>

        {/* ROI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Time Saved", val: result.estimatedROI.timesSaved, icon: "⏱️" },
            { label: "Est. Annual Saving", val: result.estimatedROI.costSaving, icon: "💰" },
            { label: "Payback Period", val: `~${result.estimatedROI.paybackMonths} months`, icon: "📅" },
          ].map(r => (
            <div key={r.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: C.cyan }}>{r.val}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* Opportunities */}
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 14 }}>Top AI Opportunities</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {sorted.map((opp, i) => {
            const open = expanded === i;
            return (
              <div key={i} style={{ background: C.surface, border: `1px solid ${open ? C.purple : C.border}`, borderRadius: 16, overflow: "hidden", transition: "border-color .2s" }}>
                <button onClick={() => setExpanded(open ? null : i)} style={{ width: "100%", background: "transparent", border: "none", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 99, background: `linear-gradient(135deg,${C.purple},${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{opp.title}</span>
                      {opp.quickWin && <Pill color={C.success}>⚡ Quick Win</Pill>}
                      <span style={{ color: C.muted, fontSize: 12 }}>{opp.category}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: C.muted, fontSize: 10 }}>Impact</div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: opp.impact >= 8 ? C.cyan : opp.impact >= 6 ? C.success : C.muted, background: `${opp.impact >= 8 ? C.cyan : C.success}18`, borderRadius: 6, padding: "2px 8px" }}>{opp.impact}/10</span>
                    </div>
                    <div style={{ color: C.muted, fontSize: 18 }}>{open ? "▲" : "▼"}</div>
                  </div>
                </button>
                {open && (
                  <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
                    <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 14, paddingTop: 14 }}>{opp.description}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      <span style={{ color: C.muted, fontSize: 13 }}>Recommended tools:</span>
                      {opp.tools.map(t => <span key={t} style={{ background: C.cyanDim, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 8, padding: "3px 10px", fontSize: 12, color: C.cyan }}>{t}</span>)}
                    </div>
                    <span style={{ color: C.muted, fontSize: 13 }}>Effort: <span style={{ color: C.text, fontWeight: 600 }}>{opp.effort}/10</span></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Roadmap */}
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 14 }}>Implementation Roadmap</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {result.roadmap.map((phase, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{phase.phase}</span>
                <span style={{ color: C.muted, fontSize: 12, background: "rgba(255,255,255,0.05)", borderRadius: 99, padding: "3px 12px" }}>{phase.duration}</span>
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                {phase.items.map((item, j) => <li key={j} style={{ color: C.muted, fontSize: 14, lineHeight: 1.8 }}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Risk flags */}
        {result.riskFlags?.length > 0 && (
          <>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 14 }}>⚠️ Watch Out For</h3>
            <div style={{ background: C.surface, border: `1px solid rgba(255,200,0,0.15)`, borderRadius: 16, padding: "18px 22px", marginBottom: 24 }}>
              <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                {result.riskFlags.map((r, i) => <li key={i} style={{ color: C.muted, fontSize: 14, lineHeight: 1.8 }}>{r}</li>)}
              </ul>
            </div>
          </>
        )}

        {/* CTA */}
        <div style={{ background: `linear-gradient(135deg, ${C.purpleDim}, ${C.cyanDim})`, border: `1px solid rgba(124,58,237,0.25)`, borderRadius: 20, padding: "32px 28px", textAlign: "center" }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 12 }}>Ready to implement?</h3>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>Agentlyze guides you through every step — tool selection, configuration, and measuring ROI — with no IT team needed.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn style={{ fontSize: 15, padding: "14px 28px" }} onClick={() => window.Calendly?.initPopupWidget({ url: "https://calendly.com/agentlyze/30min" })}>Book a Free Strategy Call</Btn>
            <Btn variant="ghost" onClick={onRestart} style={{ fontSize: 15 }}>Retake Assessment</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [answers, setAnswers] = useState({ industry: "", companySize: "", workflows: [], painPoints: [], currentTools: "", budget: "", freeText: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (key, val) => setAnswers(a => ({ ...a, [key]: val }));

  const doAssessment = async () => {
    setError(null);
    setScreen("loading");
    try {
      const r = await runAssessment(answers);
      setResult(r);
      setScreen("results");
    } catch (e) {
      setError(e.message || "Something went wrong");
      setScreen("step5");
    }
  };

  const restart = () => {
    setAnswers({ industry: "", companySize: "", workflows: [], painPoints: [], currentTools: "", budget: "", freeText: "" });
    setResult(null);
    setError(null);
    setScreen("landing");
  };

  return (
    <>
      <style>{GOOGLE_FONT}{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.text}}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.surface};border-radius:99px}
        button:hover{filter:brightness(1.1)}
        textarea:focus{border-color:${C.purple}!important}
      `}</style>
      {screen === "landing" && <Landing onStart={() => setScreen("step1")} />}
      {screen === "step1"   && <StepIndustry data={answers} onChange={set} onNext={() => setScreen("step2")} onBack={() => setScreen("landing")} />}
      {screen === "step2"   && <StepSize data={answers} onChange={set} onNext={() => setScreen("step3")} onBack={() => setScreen("step1")} />}
      {screen === "step3"   && <StepWorkflows data={answers} onChange={set} onNext={() => setScreen("step4")} onBack={() => setScreen("step2")} />}
      {screen === "step4"   && <StepPains data={answers} onChange={set} onNext={() => setScreen("step5")} onBack={() => setScreen("step3")} />}
      {screen === "step5"   && <StepBudget data={answers} onChange={set} onNext={doAssessment} onBack={() => setScreen("step4")} error={error} />}
      {screen === "loading" && <Loading />}
      {screen === "results" && result && <Results result={result} onRestart={restart} />}
    </>
  );
}
