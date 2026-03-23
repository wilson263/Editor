import { useState, useCallback } from "react";
import { useLocation } from "wouter";

type ViewMode = "desktop" | "tablet" | "mobile";
type SectionType = "header" | "hero" | "about" | "features" | "gallery" | "contact" | "footer" | "pricing" | "testimonials" | "cta";
type Section = {
  id: string; type: SectionType; visible: boolean;
  settings: {
    heading?: string; subheading?: string; buttonText?: string; buttonUrl?: string;
    bgColor?: string; textColor?: string; accentColor?: string; bgImage?: boolean;
    columns?: number; align?: "left" | "center" | "right";
    padding?: "sm" | "md" | "lg";
    navLinks?: string[]; logoText?: string; showCTA?: boolean;
    fontFamily?: string; items?: string[];
  };
};

const VIEW_WIDTHS: Record<ViewMode, number> = { desktop: 1280, tablet: 768, mobile: 375 };

const SECTION_ICONS: Record<SectionType, string> = {
  header: "🔝", hero: "🦸", about: "ℹ️", features: "⚡", gallery: "🖼️", contact: "📬",
  footer: "⬇️", pricing: "💰", testimonials: "💬", cta: "📣",
};

const SECTION_LABELS: Record<SectionType, string> = {
  header: "Header", hero: "Hero", about: "About", features: "Features", gallery: "Gallery",
  contact: "Contact", footer: "Footer", pricing: "Pricing", testimonials: "Testimonials", cta: "Call to Action",
};

const FONTS = ["Inter", "Space Grotesk", "Roboto", "Poppins", "Playfair Display", "Montserrat", "Oswald"];

function defaultSection(type: SectionType): Section {
  const base = { id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type, visible: true };
  switch (type) {
    case "header": return { ...base, settings: { logoText: "Brand", navLinks: ["Home", "About", "Features", "Contact"], showCTA: true, bgColor: "#ffffff", textColor: "#111827", accentColor: "#7c3aed" } };
    case "hero": return { ...base, settings: { heading: "Build Something Amazing", subheading: "The fastest way to create stunning websites without writing code.", buttonText: "Get Started Free", bgColor: "#ffffff", textColor: "#111827", accentColor: "#7c3aed", align: "center", padding: "lg", bgImage: false } };
    case "about": return { ...base, settings: { heading: "About Us", subheading: "We are a team of passionate designers and developers building the future of web design.", bgColor: "#f9fafb", textColor: "#374151", align: "center", padding: "md" } };
    case "features": return { ...base, settings: { heading: "Features", subheading: "Everything you need to build a great website.", bgColor: "#ffffff", textColor: "#111827", accentColor: "#7c3aed", columns: 3, padding: "md", items: ["⚡ Lightning Fast", "🎨 Beautiful Design", "📱 Fully Responsive", "🔒 Secure", "🔧 Easy to Use", "🌍 Multi-language"] } };
    case "gallery": return { ...base, settings: { heading: "Gallery", bgColor: "#f9fafb", textColor: "#111827", columns: 3, padding: "md" } };
    case "contact": return { ...base, settings: { heading: "Contact Us", subheading: "We'd love to hear from you.", bgColor: "#ffffff", textColor: "#111827", accentColor: "#7c3aed", align: "center", padding: "md" } };
    case "footer": return { ...base, settings: { logoText: "Brand", bgColor: "#111827", textColor: "#e5e7eb", navLinks: ["Privacy", "Terms", "Contact"] } };
    case "pricing": return { ...base, settings: { heading: "Simple Pricing", subheading: "Choose the plan that fits you best.", bgColor: "#ffffff", textColor: "#111827", accentColor: "#7c3aed", align: "center", padding: "md" } };
    case "testimonials": return { ...base, settings: { heading: "What Our Users Say", bgColor: "#f9fafb", textColor: "#111827", accentColor: "#7c3aed", padding: "md" } };
    case "cta": return { ...base, settings: { heading: "Ready to Get Started?", buttonText: "Start for Free", bgColor: "#7c3aed", textColor: "#ffffff", accentColor: "#ffffff", align: "center", padding: "lg" } };
  }
}

function PreviewHeader({ s }: { s: Section }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.07)", boxSizing: "border-box" }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: st.accentColor }}>{st.logoText}</div>
      <div style={{ display: "flex", gap: 24 }}>
        {(st.navLinks || []).map(l => <span key={l} style={{ fontSize: 14, color: st.textColor, cursor: "pointer" }}>{l}</span>)}
      </div>
      {st.showCTA && <button style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: st.accentColor, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Get Started</button>}
    </div>
  );
}

function PreviewHero({ s }: { s: Section }) {
  const st = s.settings;
  const bg = st.bgImage ? "linear-gradient(135deg, #1e1b4b, #312e81)" : st.bgColor;
  const textColor = st.bgImage ? "#fff" : st.textColor;
  return (
    <div style={{ background: bg, padding: st.padding === "lg" ? "100px 40px" : "60px 40px", textAlign: st.align as "center", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: 52, fontWeight: 800, color: textColor, margin: "0 0 20px", lineHeight: 1.15, letterSpacing: -1 }}>{st.heading}</h1>
      <p style={{ fontSize: 18, color: textColor, opacity: 0.7, maxWidth: 560, margin: st.align === "center" ? "0 auto 32px" : "0 0 32px", lineHeight: 1.6 }}>{st.subheading}</p>
      {st.buttonText && <button style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: st.accentColor, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>{st.buttonText} →</button>}
    </div>
  );
}

function PreviewAbout({ s }: { s: Section }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 40px", textAlign: st.align as "center", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: st.textColor, marginBottom: 16 }}>{st.heading}</h2>
      <p style={{ fontSize: 16, color: st.textColor, opacity: 0.65, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>{st.subheading}</p>
    </div>
  );
}

function PreviewFeatures({ s }: { s: Section }) {
  const st = s.settings;
  const cols = st.columns || 3;
  return (
    <div style={{ background: st.bgColor, padding: "80px 40px", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: st.textColor, textAlign: "center", marginBottom: 8 }}>{st.heading}</h2>
      <p style={{ fontSize: 16, color: st.textColor, opacity: 0.6, textAlign: "center", marginBottom: 48 }}>{st.subheading}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
        {(st.items || []).map((item, i) => (
          <div key={i} style={{ padding: 24, borderRadius: 12, background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: st.textColor }}>{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewGallery({ s }: { s: Section }) {
  const st = s.settings;
  const cols = st.columns || 3;
  const items = Array.from({ length: 6 });
  return (
    <div style={{ background: st.bgColor, padding: "80px 40px", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: st.textColor, textAlign: "center", marginBottom: 40 }}>{st.heading}</h2>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
        {items.map((_, i) => (
          <div key={i} style={{ paddingTop: "75%", position: "relative", borderRadius: 12, overflow: "hidden", background: `hsl(${260 + i * 20}, 50%, 88%)` }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🖼️</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewContact({ s }: { s: Section }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 40px", textAlign: st.align as "center", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: st.textColor, marginBottom: 12 }}>{st.heading}</h2>
      <p style={{ fontSize: 16, color: st.textColor, opacity: 0.6, marginBottom: 40 }}>{st.subheading}</p>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {["Name", "Email", "Message"].map(f => f === "Message"
          ? <textarea key={f} placeholder={f} rows={4} style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, resize: "none", fontFamily: "inherit" }} />
          : <input key={f} placeholder={f} style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
        )}
        <button style={{ padding: "14px 0", borderRadius: 10, border: "none", background: st.accentColor, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Send Message</button>
      </div>
    </div>
  );
}

function PreviewPricing({ s }: { s: Section }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 40px", textAlign: "center", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: st.textColor, marginBottom: 8 }}>{st.heading}</h2>
      <p style={{ fontSize: 16, color: st.textColor, opacity: 0.6, marginBottom: 48 }}>{st.subheading}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 900, margin: "0 auto" }}>
        {[{ name: "Starter", price: "Free", features: ["5 Projects", "Basic Tools", "Community Support"] },
          { name: "Pro", price: "$12/mo", features: ["Unlimited Projects", "AI Tools", "Priority Support", "Custom Domain"], highlight: true },
          { name: "Team", price: "$29/mo", features: ["Everything in Pro", "5 Seats", "Team Collaboration", "Analytics"] }
        ].map(plan => (
          <div key={plan.name} style={{ padding: 28, borderRadius: 16, border: `2px solid ${plan.highlight ? st.accentColor : "rgba(0,0,0,0.1)"}`, background: plan.highlight ? st.accentColor : "transparent" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: plan.highlight ? "#fff" : st.textColor }}>{plan.name}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: plan.highlight ? "#fff" : st.textColor, margin: "12px 0" }}>{plan.price}</div>
            {plan.features.map(f => <div key={f} style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,0.8)" : st.textColor, opacity: plan.highlight ? 1 : 0.7, marginBottom: 6 }}>✓ {f}</div>)}
            <button style={{ marginTop: 16, width: "100%", padding: "10px 0", borderRadius: 8, border: plan.highlight ? "none" : `1.5px solid ${st.accentColor}`, background: plan.highlight ? "#fff" : "transparent", color: plan.highlight ? st.accentColor : st.accentColor, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Get {plan.name}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTestimonials({ s }: { s: Section }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 40px", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: st.textColor, textAlign: "center", marginBottom: 48 }}>{st.heading}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {[
          { name: "Sarah M.", role: "Designer", quote: "This tool completely transformed how I build websites. Absolutely love it!" },
          { name: "John D.", role: "Developer", quote: "The fastest prototyping tool I've ever used. It's a game changer." },
          { name: "Emily R.", role: "Marketer", quote: "I built my entire landing page in 20 minutes. Incredible!" },
        ].map(t => (
          <div key={t.name} style={{ padding: 24, borderRadius: 16, background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 14, color: st.textColor, lineHeight: 1.6, marginBottom: 16 }}>"{t.quote}"</p>
            <div style={{ fontWeight: 700, fontSize: 13, color: st.textColor }}>{t.name}</div>
            <div style={{ fontSize: 12, color: st.accentColor }}>{t.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewCTA({ s }: { s: Section }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "100px 40px", textAlign: "center", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 48, fontWeight: 800, color: st.textColor, marginBottom: 32, letterSpacing: -1 }}>{st.heading}</h2>
      {st.buttonText && <button style={{ padding: "16px 40px", borderRadius: 12, border: `2px solid ${st.textColor}`, background: "transparent", color: st.textColor, fontWeight: 700, fontSize: 18, cursor: "pointer" }}>{st.buttonText} →</button>}
    </div>
  );
}

function PreviewFooter({ s }: { s: Section }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: "#a78bfa" }}>{st.logoText}</div>
      <div style={{ display: "flex", gap: 20 }}>
        {(st.navLinks || []).map(l => <span key={l} style={{ fontSize: 13, color: st.textColor, opacity: 0.6, cursor: "pointer" }}>{l}</span>)}
      </div>
      <div style={{ fontSize: 12, color: st.textColor, opacity: 0.4 }}>© 2026 {st.logoText}. All rights reserved.</div>
    </div>
  );
}

function SectionPreview({ s, view }: { s: Section; view: ViewMode }) {
  if (!s.visible) return null;
  switch (s.type) {
    case "header": return <PreviewHeader s={s} />;
    case "hero": return <PreviewHero s={s} />;
    case "about": return <PreviewAbout s={s} />;
    case "features": return <PreviewFeatures s={s} />;
    case "gallery": return <PreviewGallery s={s} />;
    case "contact": return <PreviewContact s={s} />;
    case "pricing": return <PreviewPricing s={s} />;
    case "testimonials": return <PreviewTestimonials s={s} />;
    case "cta": return <PreviewCTA s={s} />;
    case "footer": return <PreviewFooter s={s} />;
    default: return null;
  }
}

export default function WebUIDesigner() {
  const [, navigate] = useLocation();
  const [sections, setSections] = useState<Section[]>([
    defaultSection("header"), defaultSection("hero"), defaultSection("features"), defaultSection("contact"), defaultSection("footer"),
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [rightTab, setRightTab] = useState<"add" | "settings" | "style" | "ai">("add");
  const [font, setFont] = useState("Inter");
  const [zoom, setZoom] = useState(0.7);
  const [aiPrompt, setAiPrompt] = useState("");

  const selectedSection = sections.find(s => s.id === selected);

  const addSection = (type: SectionType) => {
    const sec = defaultSection(type);
    setSections(prev => [...prev, sec]);
    setSelected(sec.id);
  };

  const updateSection = useCallback((id: string, patch: Partial<Section["settings"]>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, settings: { ...s.settings, ...patch } } : s));
  }, []);

  const moveSection = (id: string, dir: -1 | 1) => {
    setSections(prev => {
      const i = prev.findIndex(s => s.id === id);
      if (i + dir < 0 || i + dir >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    if (selected === id) setSelected(null);
  };

  const exportHTML = () => {
    alert("Export HTML/CSS: In production this would generate clean HTML and CSS from your layout. CSS custom properties and responsive styles would be included.");
  };

  const previewW = VIEW_WIDTHS[viewMode];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f0f1a", color: "#e5e7eb", fontFamily: `'${font}', sans-serif` }}>
      {/* Top Bar */}
      <div style={{ height: 52, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 22, cursor: "pointer" }}>✦</button>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Web UI Designer</span>
        <div style={{ marginLeft: 16, display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
          {(["desktop", "tablet", "mobile"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: viewMode === v ? "rgba(124,58,237,0.4)" : "transparent", color: viewMode === v ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 16 }}>
              {v === "desktop" ? "🖥️" : v === "tablet" ? "📱" : "📲"}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#4b5563" }}>{previewW}px</span>

        <div style={{ marginLeft: 8, display: "flex", gap: 4 }}>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", borderRadius: 4, width: 26, height: 26, cursor: "pointer", fontSize: 16 }}>−</button>
          <span style={{ fontSize: 12, color: "#6b7280", minWidth: 40, textAlign: "center", lineHeight: "26px" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.2, z + 0.1))} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", borderRadius: 4, width: 26, height: 26, cursor: "pointer", fontSize: 16 }}>+</button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={exportHTML} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 13 }}>⬇ HTML/CSS</button>
          <button style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🚀 Publish</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left - Section List */}
        <div style={{ width: 180, background: "#13131f", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Page Structure</div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {sections.map((s, i) => (
              <div key={s.id} onClick={() => { setSelected(s.id); setRightTab("settings"); }}
                style={{ padding: "8px 10px", borderRadius: 6, marginBottom: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  background: s.id === selected ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${s.id === selected ? "#7c3aed" : "rgba(255,255,255,0.06)"}`,
                  opacity: s.visible ? 1 : 0.4 }}>
                <span style={{ fontSize: 14 }}>{SECTION_ICONS[s.type]}</span>
                <span style={{ fontSize: 12, color: "#d1d5db", flex: 1 }}>{SECTION_LABELS[s.type]}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, -1); }} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", lineHeight: 1, padding: 0, fontSize: 10 }}>▲</button>
                  <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 1); }} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", lineHeight: 1, padding: 0, fontSize: 10 }}>▼</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setRightTab("add")} style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px dashed rgba(124,58,237,0.4)", background: "rgba(124,58,237,0.05)", color: "#a78bfa", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add Section</button>
          </div>
        </div>

        {/* Canvas Preview */}
        <div style={{ flex: 1, overflow: "auto", background: "#0a0a14", display: "flex", justifyContent: "center", padding: 32 }}>
          <div style={{ width: previewW * zoom, flexShrink: 0, boxShadow: "0 8px 60px rgba(0,0,0,0.8)", borderRadius: viewMode === "desktop" ? 8 : viewMode === "tablet" ? 16 : 28 }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: previewW, background: "#fff", minHeight: 600, overflow: "hidden", borderRadius: viewMode === "desktop" ? 8 : viewMode === "tablet" ? 16 : 28 }}>
              {sections.map(s => (
                <div key={s.id} style={{ position: "relative", outline: s.id === selected ? "2px solid #7c3aed" : "none", outlineOffset: -2, cursor: "pointer" }}
                  onClick={() => { setSelected(s.id); setRightTab("settings"); }}>
                  <SectionPreview s={s} view={viewMode} />
                  {s.id === selected && (
                    <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 4, zIndex: 10 }}>
                      <button onClick={(e) => { e.stopPropagation(); setSections(prev => prev.map(x => x.id === s.id ? { ...x, visible: !x.visible } : x)); }}
                        style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", fontSize: 12 }}>
                        {s.visible ? "👁 Hide" : "👁 Show"}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSection(s.id); }}
                        style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: "rgba(239,68,68,0.8)", color: "#fff", cursor: "pointer", fontSize: 12 }}>
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 280, background: "#13131f", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {(["add", "settings", "style", "ai"] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                style={{ flex: 1, padding: "10px 0", fontSize: 11, cursor: "pointer", border: "none", background: "none",
                  color: rightTab === tab ? "#a78bfa" : "#6b7280", fontWeight: rightTab === tab ? 700 : 400,
                  borderBottom: rightTab === tab ? "2px solid #7c3aed" : "2px solid transparent" }}>
                {tab === "add" ? "➕" : tab === "settings" ? "⚙️" : tab === "style" ? "🎨" : "🤖"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {rightTab === "add" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Add Section</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {(Object.keys(SECTION_ICONS) as SectionType[]).map(type => (
                    <button key={type} onClick={() => { addSection(type); setRightTab("settings"); }}
                      style={{ padding: "12px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
                      <span style={{ fontSize: 20 }}>{SECTION_ICONS[type]}</span>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{SECTION_LABELS[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rightTab === "settings" && selectedSection && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>{SECTION_LABELS[selectedSection.type]} Settings</div>
                {["heading", "subheading", "buttonText", "logoText"].map(key => (
                  (selectedSection.settings as Record<string, string | undefined>)[key] !== undefined && (
                    <div key={key}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</div>
                      <input value={(selectedSection.settings as Record<string, string>)[key] ?? ""}
                        onChange={e => updateSection(selectedSection.id, { [key]: e.target.value } as Partial<Section["settings"]>)}
                        style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "7px 10px", color: "#e5e7eb", fontSize: 13 }} />
                    </div>
                  )
                ))}
                {selectedSection.settings.align !== undefined && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Text Align</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(["left", "center", "right"] as const).map(a => (
                        <button key={a} onClick={() => updateSection(selectedSection.id, { align: a })}
                          style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid", borderColor: selectedSection.settings.align === a ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedSection.settings.align === a ? "rgba(124,58,237,0.2)" : "transparent", color: selectedSection.settings.align === a ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12, textTransform: "capitalize" }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedSection.settings.navLinks && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Nav Links (comma separated)</div>
                    <input value={(selectedSection.settings.navLinks || []).join(", ")}
                      onChange={e => updateSection(selectedSection.id, { navLinks: e.target.value.split(",").map(s => s.trim()) })}
                      style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "7px 10px", color: "#e5e7eb", fontSize: 13 }} />
                  </div>
                )}
                {selectedSection.settings.columns !== undefined && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Columns</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[2, 3, 4].map(c => (
                        <button key={c} onClick={() => updateSection(selectedSection.id, { columns: c })}
                          style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid", borderColor: selectedSection.settings.columns === c ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedSection.settings.columns === c ? "rgba(124,58,237,0.2)" : "transparent", color: selectedSection.settings.columns === c ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 13 }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedSection.settings.bgImage !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" id="bgimg" checked={selectedSection.settings.bgImage} onChange={e => updateSection(selectedSection.id, { bgImage: e.target.checked })} />
                    <label htmlFor="bgimg" style={{ fontSize: 12, color: "#9ca3af", cursor: "pointer" }}>Use gradient background</label>
                  </div>
                )}
                <button onClick={() => deleteSection(selectedSection.id)}
                  style={{ padding: "8px 0", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 13, marginTop: 4 }}>
                  🗑 Remove Section
                </button>
              </div>
            )}

            {rightTab === "settings" && !selectedSection && (
              <div style={{ padding: 24, textAlign: "center", color: "#4b5563", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                Click a section to edit its settings
              </div>
            )}

            {rightTab === "style" && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>Global Style</div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Font Family</div>
                  <select value={font} onChange={e => setFont(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "7px 10px", color: "#e5e7eb", fontSize: 13 }}>
                    {FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                {selectedSection && (
                  <>
                    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginTop: 4 }}>Section Colors</div>
                    {[
                      { label: "Background", key: "bgColor" as keyof Section["settings"] },
                      { label: "Text", key: "textColor" as keyof Section["settings"] },
                      { label: "Accent", key: "accentColor" as keyof Section["settings"] },
                    ].map(({ label, key }) => (
                      (selectedSection.settings as Record<string, string | undefined>)[key as string] !== undefined && (
                        <div key={key as string} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ flex: 1, fontSize: 12, color: "#6b7280" }}>{label}</span>
                          <input type="color" value={(selectedSection.settings as Record<string, string>)[key as string] ?? "#ffffff"}
                            onChange={e => updateSection(selectedSection.id, { [key]: e.target.value } as Partial<Section["settings"]>)}
                            style={{ width: 40, height: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                      )
                    ))}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Padding</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {(["sm", "md", "lg"] as const).map(p => (
                          <button key={p} onClick={() => updateSection(selectedSection.id, { padding: p })}
                            style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid", borderColor: selectedSection.settings.padding === p ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedSection.settings.padding === p ? "rgba(124,58,237,0.2)" : "transparent", color: selectedSection.settings.padding === p ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12, textTransform: "uppercase" }}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>Color Presets</div>
                  {[
                    { label: "Purple Dark", bg: "#7c3aed", text: "#fff", accent: "#a78bfa" },
                    { label: "Ocean Blue", bg: "#1e40af", text: "#fff", accent: "#60a5fa" },
                    { label: "Emerald", bg: "#065f46", text: "#fff", accent: "#34d399" },
                    { label: "Sunset", bg: "#f59e0b", text: "#1a1a1a", accent: "#ef4444" },
                    { label: "Clean White", bg: "#ffffff", text: "#111827", accent: "#7c3aed" },
                  ].map(preset => selectedSection && (
                    <button key={preset.label} onClick={() => updateSection(selectedSection.id, { bgColor: preset.bg, textColor: preset.text, accentColor: preset.accent })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, marginBottom: 4, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: preset.bg, border: "1px solid rgba(255,255,255,0.1)" }} />
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rightTab === "ai" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>🤖 AI Website Builder</div>
                <textarea rows={3} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder='e.g. "Portfolio website for a freelance designer"'
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#e5e7eb", fontSize: 13, marginBottom: 8, resize: "none" }} />
                <button onClick={() => {
                  setSections([
                    defaultSection("header"), defaultSection("hero"), defaultSection("features"),
                    defaultSection("testimonials"), defaultSection("pricing"), defaultSection("cta"), defaultSection("footer"),
                  ]);
                  setAiPrompt("");
                }} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, marginBottom: 16 }}>
                  ✨ Generate Layout
                </button>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Quick Prompts</div>
                {["Portfolio for developer", "SaaS landing page", "Restaurant website", "Agency showcase", "E-commerce store", "Blog homepage"].map(p => (
                  <button key={p} onClick={() => setAiPrompt(p)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: 12, marginBottom: 4 }}>
                    → {p}
                  </button>
                ))}
                <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, marginBottom: 8 }}>Export Options</div>
                  <button onClick={exportHTML} style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#d1d5db", cursor: "pointer", fontSize: 12, marginBottom: 4 }}>📄 Export HTML/CSS</button>
                  <button style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#d1d5db", cursor: "pointer", fontSize: 12 }}>⚛️ Export React Components</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
