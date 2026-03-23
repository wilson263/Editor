import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";

type ViewMode = "desktop" | "tablet" | "mobile";
type SectionType =
  | "header" | "hero" | "hero-split" | "hero-video" | "about" | "features" | "features-grid"
  | "gallery" | "contact" | "footer" | "pricing" | "testimonials" | "cta" | "faq"
  | "team" | "stats" | "blog" | "newsletter" | "portfolio" | "timeline" | "partners" | "video-section";
type AnimationStyle = "none" | "fade-up" | "slide-left" | "zoom" | "bounce";
type Section = {
  id: string; type: SectionType; visible: boolean;
  settings: {
    heading?: string; subheading?: string; buttonText?: string; buttonText2?: string; buttonUrl?: string;
    bgColor?: string; textColor?: string; accentColor?: string; bgImage?: boolean; bgVideo?: boolean;
    columns?: number; align?: "left" | "center" | "right";
    padding?: "xs" | "sm" | "md" | "lg" | "xl";
    navLinks?: string[]; logoText?: string; showCTA?: boolean;
    fontFamily?: string; items?: string[];
    gradient?: boolean; gradientAngle?: number; gradientColor2?: string;
    borderRadius?: number; gap?: number;
    countUp?: boolean; stickyHeader?: boolean;
    animation?: AnimationStyle; parallax?: boolean;
    imageCount?: number; autoplay?: boolean;
    cardStyle?: "flat" | "shadow" | "border" | "glass";
    buttonStyle?: "filled" | "outline" | "ghost" | "gradient";
    overlayOpacity?: number; accentColor2?: string;
    showBadge?: boolean; badgeText?: string;
    sticky?: boolean;
  };
};
type PagePreset = { name: string; icon: string; sections: SectionType[] };

const VIEW_WIDTHS: Record<ViewMode, number> = { desktop: 1280, tablet: 768, mobile: 375 };
const VIEW_HEIGHTS: Record<ViewMode, number> = { desktop: 800, tablet: 1024, mobile: 812 };

const SECTION_ICONS: Record<SectionType, string> = {
  header: "🔝", hero: "🦸", "hero-split": "⬛", "hero-video": "🎬", about: "ℹ️",
  features: "⚡", "features-grid": "⊞", gallery: "🖼️", contact: "📬",
  footer: "⬇️", pricing: "💰", testimonials: "💬", cta: "📣", faq: "❓",
  team: "👥", stats: "📊", blog: "📝", newsletter: "✉️", portfolio: "🗂",
  timeline: "📅", partners: "🤝", "video-section": "▶️",
};

const SECTION_LABELS: Record<SectionType, string> = {
  header: "Header", hero: "Hero", "hero-split": "Hero Split", "hero-video": "Hero Video",
  about: "About", features: "Features", "features-grid": "Features Grid",
  gallery: "Gallery", contact: "Contact", footer: "Footer",
  pricing: "Pricing", testimonials: "Testimonials", cta: "Call to Action", faq: "FAQ",
  team: "Team", stats: "Stats", blog: "Blog Posts", newsletter: "Newsletter",
  portfolio: "Portfolio", timeline: "Timeline", partners: "Partners", "video-section": "Video Section",
};

const SECTION_CATEGORIES: Record<string, SectionType[]> = {
  "Navigation": ["header"],
  "Hero": ["hero", "hero-split", "hero-video"],
  "Content": ["about", "features", "features-grid", "team", "timeline"],
  "Media": ["gallery", "portfolio", "video-section"],
  "Social Proof": ["testimonials", "stats", "partners"],
  "Conversion": ["pricing", "cta", "newsletter", "contact"],
  "Info": ["faq", "blog"],
  "Footer": ["footer"],
};

const FONTS = ["Inter", "Space Grotesk", "Roboto", "Poppins", "Playfair Display", "Montserrat", "Oswald", "Raleway", "Lato", "DM Sans", "Plus Jakarta Sans", "Nunito", "Josefin Sans", "Cabin"];
const COLOR_PALETTES = [
  { name: "Violet", accent: "#7c3aed", accent2: "#ec4899" },
  { name: "Ocean", accent: "#0ea5e9", accent2: "#06b6d4" },
  { name: "Forest", accent: "#059669", accent2: "#10b981" },
  { name: "Sunset", accent: "#f97316", accent2: "#ef4444" },
  { name: "Gold", accent: "#d97706", accent2: "#f59e0b" },
  { name: "Rose", accent: "#e11d48", accent2: "#f43f5e" },
  { name: "Slate", accent: "#475569", accent2: "#334155" },
  { name: "Indigo", accent: "#4f46e5", accent2: "#7c3aed" },
];

const PAGE_PRESETS: PagePreset[] = [
  { name: "SaaS Landing", icon: "🚀", sections: ["header", "hero", "stats", "features", "testimonials", "pricing", "cta", "footer"] },
  { name: "Portfolio", icon: "🗂", sections: ["header", "hero-split", "about", "portfolio", "testimonials", "contact", "footer"] },
  { name: "Agency", icon: "🏢", sections: ["header", "hero", "partners", "features-grid", "team", "testimonials", "cta", "footer"] },
  { name: "Blog", icon: "📝", sections: ["header", "hero", "blog", "newsletter", "footer"] },
  { name: "E-Commerce", icon: "🛒", sections: ["header", "hero", "features", "gallery", "testimonials", "pricing", "footer"] },
  { name: "Startup", icon: "💡", sections: ["header", "hero-split", "stats", "features-grid", "team", "pricing", "faq", "footer"] },
];

function defaultSection(type: SectionType): Section {
  const base = { id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type, visible: true };
  const common = { accentColor: "#7c3aed", accentColor2: "#ec4899", bgColor: "#ffffff", textColor: "#111827", padding: "md" as const, animation: "none" as AnimationStyle, cardStyle: "shadow" as const, buttonStyle: "filled" as const };
  switch (type) {
    case "header": return { ...base, settings: { ...common, logoText: "Brand", navLinks: ["Home", "About", "Features", "Pricing", "Contact"], showCTA: true, stickyHeader: true } };
    case "hero": return { ...base, settings: { ...common, heading: "Build Something Amazing", subheading: "The fastest way to create stunning websites without writing code. Powered by AI.", buttonText: "Get Started Free", buttonText2: "Watch Demo", padding: "xl", align: "center", gradient: false, showBadge: true, badgeText: "🚀 Now with AI features" } };
    case "hero-split": return { ...base, settings: { ...common, heading: "Design Faster Than Ever Before", subheading: "Powerful tools, beautiful results. Start creating in seconds.", buttonText: "Start for Free", padding: "xl", align: "left" } };
    case "hero-video": return { ...base, settings: { ...common, heading: "See It in Action", subheading: "Watch how our platform transforms your workflow.", buttonText: "Play Demo", bgVideo: true, overlayOpacity: 60, padding: "xl", align: "center" } };
    case "about": return { ...base, settings: { ...common, heading: "About Us", subheading: "We are a team of passionate designers and developers building the future of web design.", bgColor: "#f9fafb", textColor: "#374151", align: "center", padding: "lg" } };
    case "features": return { ...base, settings: { ...common, heading: "Everything You Need", subheading: "Packed with features to help you build faster and smarter.", bgColor: "#ffffff", columns: 3, items: ["⚡ Lightning Fast", "🎨 Beautiful Design", "📱 Fully Responsive", "🔒 Secure & Reliable", "🤖 AI Powered", "🌍 Multi-language"], cardStyle: "shadow" } };
    case "features-grid": return { ...base, settings: { ...common, heading: "Why Choose Us", subheading: "We stand out from the competition with cutting-edge features.", bgColor: "#f9fafb", columns: 2, items: ["⚡ Speed: Ultra-fast load times", "🎨 Design: Professional templates", "🔒 Security: Enterprise-grade", "🤖 AI: Intelligent automation", "📊 Analytics: Real-time insights", "🌍 Global: CDN in 100+ countries"] } };
    case "gallery": return { ...base, settings: { ...common, heading: "Our Work", bgColor: "#f9fafb", textColor: "#111827", columns: 3, imageCount: 9 } };
    case "contact": return { ...base, settings: { ...common, heading: "Contact Us", subheading: "We'd love to hear from you. Send us a message and we'll respond within 24 hours.", bgColor: "#ffffff", align: "center" } };
    case "footer": return { ...base, settings: { ...common, logoText: "Brand", bgColor: "#111827", textColor: "#e5e7eb", navLinks: ["Privacy", "Terms", "Contact", "About", "Blog"] } };
    case "pricing": return { ...base, settings: { ...common, heading: "Simple, Transparent Pricing", subheading: "No hidden fees. Choose the plan that fits your needs.", bgColor: "#ffffff", align: "center" } };
    case "testimonials": return { ...base, settings: { ...common, heading: "Loved by Thousands", subheading: "Don't just take our word for it. Hear from our happy customers.", bgColor: "#f9fafb", columns: 3 } };
    case "cta": return { ...base, settings: { ...common, heading: "Ready to Get Started?", subheading: "Join 50,000+ companies already using our platform.", buttonText: "Start for Free", buttonText2: "Talk to Sales", bgColor: "#7c3aed", textColor: "#ffffff", align: "center", padding: "xl", gradient: true } };
    case "faq": return { ...base, settings: { ...common, heading: "Frequently Asked Questions", subheading: "Everything you need to know about our platform.", bgColor: "#f9fafb", items: ["How do I get started?", "What's included in the free plan?", "Can I cancel anytime?", "Do you offer discounts?", "Is there a limit on users?", "How does billing work?"] } };
    case "team": return { ...base, settings: { ...common, heading: "Meet the Team", subheading: "The talented people behind our platform.", bgColor: "#ffffff", columns: 4 } };
    case "stats": return { ...base, settings: { ...common, heading: "Trusted by Thousands", bgColor: "#ffffff", items: ["50k+ Users", "99.9% Uptime", "150+ Countries", "4.9/5 Rating"], countUp: true } };
    case "blog": return { ...base, settings: { ...common, heading: "Latest from Our Blog", subheading: "Stay up to date with the latest news and updates.", bgColor: "#f9fafb", columns: 3 } };
    case "newsletter": return { ...base, settings: { ...common, heading: "Stay in the Loop", subheading: "Get the latest updates, tutorials, and tips delivered to your inbox.", bgColor: "#7c3aed", textColor: "#ffffff", buttonText: "Subscribe", align: "center", gradient: true } };
    case "portfolio": return { ...base, settings: { ...common, heading: "Our Portfolio", subheading: "Explore our latest projects and creative work.", bgColor: "#ffffff", columns: 3, imageCount: 6 } };
    case "timeline": return { ...base, settings: { ...common, heading: "Our Journey", subheading: "From a small startup to a global platform.", bgColor: "#f9fafb", items: ["2020 — Founded", "2021 — 1k Users", "2022 — Series A", "2023 — 10k Users", "2024 — Series B", "2025 — 50k Users"] } };
    case "partners": return { ...base, settings: { ...common, heading: "Trusted By", bgColor: "#ffffff", items: ["Acme Corp", "StartupX", "TechCo", "Innovate Inc", "FutureLabs", "GlobalSys"] } };
    case "video-section": return { ...base, settings: { ...common, heading: "See How It Works", subheading: "Watch our 2-minute overview to see what our platform can do for you.", bgColor: "#0f0f1a", textColor: "#ffffff", align: "center", padding: "xl" } };
  }
}

// --- Section Renderers ---
function PreviewHeader({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.stickyHeader ? "rgba(255,255,255,0.95)" : st.bgColor, padding: "0 48px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.07)", boxSizing: "border-box", backdropFilter: st.stickyHeader ? "blur(12px)" : "none", fontFamily: font }}>
      <div style={{ fontWeight: 800, fontSize: 22, color: st.accentColor, letterSpacing: -0.5 }}>{st.logoText}</div>
      <nav style={{ display: "flex", gap: 28 }}>
        {(st.navLinks || []).map((l, i) => <a key={l} href="#" style={{ fontSize: 14, color: i === 0 ? st.accentColor : st.textColor, cursor: "pointer", fontWeight: i === 0 ? 600 : 400, textDecoration: "none" }}>{l}</a>)}
      </nav>
      {st.showCTA && <button style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: st.gradient ? `linear-gradient(135deg,${st.accentColor},${st.accentColor2 || "#ec4899"})` : st.accentColor, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>Get Started</button>}
    </div>
  );
}

function PreviewHero({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const bg = st.gradient ? `linear-gradient(${st.gradientAngle || 135}deg, ${st.bgColor}, ${st.gradientColor2 || st.accentColor2 || "#c4b5fd"})` : st.bgImage ? "linear-gradient(135deg, #1e1b4b, #312e81)" : st.bgColor;
  const textColor = (st.bgImage || st.gradient) ? "#fff" : st.textColor;
  const pad = st.padding === "xl" ? "120px 64px" : st.padding === "lg" ? "80px 64px" : "60px 64px";
  return (
    <div style={{ background: bg, padding: pad, textAlign: st.align as any, boxSizing: "border-box", position: "relative", fontFamily: font }}>
      {st.showBadge && st.badgeText && (
        <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, background: `${st.accentColor}18`, border: `1px solid ${st.accentColor}30`, color: st.accentColor, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>{st.badgeText}</div>
      )}
      <h1 style={{ fontSize: 64, fontWeight: 900, color: textColor, margin: "0 0 24px", lineHeight: 1.05, letterSpacing: -2 }}>{st.heading}</h1>
      <p style={{ fontSize: 20, color: textColor, opacity: 0.7, maxWidth: 600, margin: st.align === "center" ? "0 auto 40px" : "0 0 40px", lineHeight: 1.6, fontWeight: 400 }}>{st.subheading}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: st.align === "center" ? "center" : "flex-start", flexWrap: "wrap" }}>
        {st.buttonText && <button style={{ padding: "16px 36px", borderRadius: 12, border: "none", background: st.gradient ? `linear-gradient(135deg,${st.accentColor},${st.accentColor2 || "#ec4899"})` : st.accentColor, color: "#fff", fontWeight: 700, fontSize: 17, cursor: "pointer", boxShadow: `0 6px 24px ${st.accentColor}50` }}>{st.buttonText} →</button>}
        {st.buttonText2 && <button style={{ padding: "16px 32px", borderRadius: 12, border: `2px solid ${textColor === "#fff" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"}`, background: "transparent", color: textColor, fontWeight: 600, fontSize: 17, cursor: "pointer" }}>▶ {st.buttonText2}</button>}
      </div>
    </div>
  );
}

function PreviewHeroSplit({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 64, fontFamily: font }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, background: `${st.accentColor}15`, color: st.accentColor, fontSize: 12, fontWeight: 700, marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" as const }}>New ✦</div>
        <h1 style={{ fontSize: 52, fontWeight: 900, color: st.textColor, margin: "0 0 20px", lineHeight: 1.1, letterSpacing: -1.5 }}>{st.heading}</h1>
        <p style={{ fontSize: 18, color: st.textColor, opacity: 0.65, lineHeight: 1.7, marginBottom: 36 }}>{st.subheading}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: st.accentColor, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>{st.buttonText || "Get Started"} →</button>
          <button style={{ padding: "14px 24px", borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.12)", background: "transparent", color: st.textColor, fontWeight: 500, fontSize: 16, cursor: "pointer" }}>Learn More</button>
        </div>
      </div>
      <div style={{ flex: 1, height: 340, borderRadius: 24, background: `linear-gradient(135deg, ${st.accentColor}20, ${st.accentColor2 || "#ec4899"}20)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, border: `1px solid ${st.accentColor}25` }}>
        🚀
      </div>
    </div>
  );
}

function PreviewHeroVideo({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: "#0f0f1a", padding: "100px 64px", textAlign: "center", position: "relative", boxSizing: "border-box", overflow: "hidden", fontFamily: font }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${st.accentColor}30, #000)`, opacity: (st.overlayOpacity ?? 60) / 100 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: 56, fontWeight: 900, color: "#fff", margin: "0 0 20px", letterSpacing: -1.5 }}>{st.heading}</h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>{st.subheading}</p>
        <button style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.4)", color: "#fff", fontSize: 28, cursor: "pointer", backdropFilter: "blur(8px)" }}>▶</button>
      </div>
    </div>
  );
}

function PreviewAbout({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", textAlign: st.align as any, boxSizing: "border-box", fontFamily: font }}>
      <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 100, background: `${st.accentColor}15`, color: st.accentColor, fontSize: 12, fontWeight: 700, marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: 1 }}>About Us</div>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, marginBottom: 20, letterSpacing: -1 }}>{st.heading}</h2>
      <p style={{ fontSize: 18, color: st.textColor, opacity: 0.65, maxWidth: 640, margin: "0 auto", lineHeight: 1.8, fontWeight: 400 }}>{st.subheading}</p>
    </div>
  );
}

function PreviewFeatures({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const cols = st.columns || 3;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 100, background: `${st.accentColor}15`, color: st.accentColor, fontSize: 12, fontWeight: 700, marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: 1 }}>Features</div>
        <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, letterSpacing: -1, marginBottom: 12 }}>{st.heading}</h2>
        <p style={{ fontSize: 18, color: st.textColor, opacity: 0.6, maxWidth: 520, margin: "0 auto" }}>{st.subheading}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: st.gap || 24 }}>
        {(st.items || []).map((item, i) => (
          <div key={i} style={{
            padding: 28, borderRadius: 20,
            background: st.cardStyle === "glass" ? "rgba(255,255,255,0.7)" : st.cardStyle === "flat" ? st.bgColor : "#fff",
            border: st.cardStyle === "border" ? `1.5px solid rgba(0,0,0,0.1)` : st.cardStyle === "flat" ? `1px solid ${st.accentColor}20` : "none",
            boxShadow: st.cardStyle === "shadow" ? "0 4px 24px rgba(0,0,0,0.07)" : "none",
            backdropFilter: st.cardStyle === "glass" ? "blur(12px)" : "none",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${st.accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>
              {item.split(" ")[0]}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: st.textColor, marginBottom: 8 }}>{item.slice(item.indexOf(" ") + 1).split(":")[0]}</div>
            <div style={{ fontSize: 14, color: st.textColor, opacity: 0.55, lineHeight: 1.6 }}>
              {item.includes(":") ? item.split(":")[1] : "High-quality feature that helps you achieve your goals faster."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewFeaturesGrid({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 100, background: `${st.accentColor}15`, color: st.accentColor, fontSize: 12, fontWeight: 700, marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: 1 }}>Why Us</div>
          <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, letterSpacing: -1, marginBottom: 16 }}>{st.heading}</h2>
          <p style={{ fontSize: 17, color: st.textColor, opacity: 0.6, lineHeight: 1.7, marginBottom: 32 }}>{st.subheading}</p>
          <button style={{ padding: "14px 28px", borderRadius: 10, border: "none", background: st.accentColor, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Learn More →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {(st.items || []).slice(0, 4).map((item, i) => (
            <div key={i} style={{ padding: 20, borderRadius: 16, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.split(" ")[0]}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: st.textColor }}>{item.slice(item.indexOf(" ") + 1).split(":")[0]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewStats({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "60px 64px", boxSizing: "border-box", fontFamily: font }}>
      {st.heading && <h2 style={{ fontSize: 36, fontWeight: 800, color: st.textColor, textAlign: "center", marginBottom: 40, letterSpacing: -0.5 }}>{st.heading}</h2>}
      <div style={{ display: "flex", justifyContent: "center", gap: 0 }}>
        {(st.items || []).map((item, i, arr) => (
          <div key={i} style={{ flex: 1, textAlign: "center", padding: "24px 16px", borderRight: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: st.accentColor, letterSpacing: -2, lineHeight: 1 }}>{item.split(" ")[0]}</div>
            <div style={{ fontSize: 15, color: st.textColor, opacity: 0.6, marginTop: 8, fontWeight: 500 }}>{item.split(" ").slice(1).join(" ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTestimonials({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const testimonials = [
    { name: "Sarah Miller", role: "Head of Design @ Acme", quote: "This tool completely transformed how I build websites. We ship 3× faster now!" },
    { name: "John Davidson", role: "CTO @ StartupX", quote: "The best design system I've used. Saves us hours every week. Absolutely love it." },
    { name: "Emily Richards", role: "Founder @ CreativeCo", quote: "I built my entire landing page in 20 minutes. Incredible quality and speed!" },
  ].slice(0, st.columns || 3);
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, letterSpacing: -1, marginBottom: 12 }}>{st.heading}</h2>
        <p style={{ fontSize: 18, color: st.textColor, opacity: 0.55 }}>{st.subheading}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${st.columns || 3}, 1fr)`, gap: 24 }}>
        {testimonials.map(t => (
          <div key={t.name} style={{ padding: 28, borderRadius: 20, background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>{"★★★★★".split("").map((s, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 16 }}>{s}</span>)}</div>
            <p style={{ fontSize: 15, color: st.textColor, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.quote}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${st.accentColor}, ${st.accentColor2 || "#ec4899"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>{t.name[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: st.textColor }}>{t.name}</div>
                <div style={{ fontSize: 12, color: st.accentColor }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewPricing({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const plans = [
    { name: "Starter", price: "Free", period: "", features: ["5 Projects", "Basic Tools", "2GB Storage", "Community Support"] },
    { name: "Pro", price: "$29", period: "/mo", features: ["Unlimited Projects", "AI Tools", "50GB Storage", "Priority Support", "Custom Domain", "Analytics"], highlight: true },
    { name: "Enterprise", price: "$99", period: "/mo", features: ["Everything in Pro", "Unlimited Seats", "SSO & SAML", "SLA Guarantee", "Dedicated Support", "Custom Integrations"] },
  ];
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", textAlign: "center", boxSizing: "border-box", fontFamily: font }}>
      <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 100, background: `${st.accentColor}15`, color: st.accentColor, fontSize: 12, fontWeight: 700, marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: 1 }}>Pricing</div>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, marginBottom: 12, letterSpacing: -1 }}>{st.heading}</h2>
      <p style={{ fontSize: 18, color: st.textColor, opacity: 0.6, marginBottom: 56 }}>{st.subheading}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 960, margin: "0 auto" }}>
        {plans.map(plan => (
          <div key={plan.name} style={{ padding: "32px 28px", borderRadius: 20, border: `2px solid ${plan.highlight ? st.accentColor : "rgba(0,0,0,0.09)"}`, background: plan.highlight ? `linear-gradient(145deg, ${st.accentColor}, ${st.accentColor2 || "#ec4899"})` : "transparent", position: "relative" }}>
            {plan.highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#000", fontSize: 11, fontWeight: 800, padding: "3px 14px", borderRadius: 100 }}>MOST POPULAR</div>}
            <div style={{ fontSize: 17, fontWeight: 700, color: plan.highlight ? "#fff" : st.textColor, marginBottom: 8 }}>{plan.name}</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: plan.highlight ? "#fff" : st.accentColor, lineHeight: 1, marginBottom: 4, letterSpacing: -2 }}>{plan.price}<span style={{ fontSize: 18, fontWeight: 500, opacity: 0.7 }}>{plan.period}</span></div>
            <div style={{ margin: "20px 0", height: 1, background: plan.highlight ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.07)" }} />
            {plan.features.map(f => (
              <div key={f} style={{ fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.88)" : st.textColor, opacity: plan.highlight ? 1 : 0.75, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                <span style={{ color: plan.highlight ? "#fff" : st.accentColor, fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
              </div>
            ))}
            <button style={{ marginTop: 20, width: "100%", padding: "13px 0", borderRadius: 12, border: plan.highlight ? "none" : `1.5px solid ${st.accentColor}`, background: plan.highlight ? "#fff" : "transparent", color: plan.highlight ? st.accentColor : st.accentColor, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Get {plan.name} →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewFAQ({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, letterSpacing: -1, marginBottom: 12 }}>{st.heading}</h2>
        <p style={{ fontSize: 18, color: st.textColor, opacity: 0.6 }}>{st.subheading}</p>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {(st.items || []).map((q, i) => (
          <div key={i} style={{ padding: "20px 24px", borderRadius: 14, background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: st.textColor }}>{q}</span>
              <span style={{ fontSize: 20, color: st.accentColor, fontWeight: 700 }}>+</span>
            </div>
            {i === 0 && <div style={{ marginTop: 12, fontSize: 14, color: st.textColor, opacity: 0.6, lineHeight: 1.7 }}>Getting started is simple. Sign up for a free account, choose your template, and start building right away. No credit card required.</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTeam({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const members = ["Alex Chen", "Sara Park", "Mike Ross", "Lily Wang"];
  const roles = ["CEO & Co-founder", "Head of Design", "Lead Engineer", "Product Manager"];
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, textAlign: "center", marginBottom: 8, letterSpacing: -1 }}>{st.heading}</h2>
      <p style={{ fontSize: 18, color: st.textColor, opacity: 0.55, textAlign: "center", marginBottom: 48 }}>{st.subheading}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${st.columns || 4}, 1fr)`, gap: 24 }}>
        {members.map((name, i) => (
          <div key={name} style={{ textAlign: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: 20, background: `linear-gradient(135deg, ${st.accentColor}30, ${st.accentColor2 || "#ec4899"}30)`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
              {["👩🏻‍💼", "👩🏼‍🎨", "👨🏻‍💻", "👩🏽‍💼"][i]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: st.textColor, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 13, color: st.accentColor, fontWeight: 500 }}>{roles[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewBlog({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, textAlign: "center", marginBottom: 8, letterSpacing: -1 }}>{st.heading}</h2>
      <p style={{ fontSize: 18, color: st.textColor, opacity: 0.55, textAlign: "center", marginBottom: 48 }}>{st.subheading}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${st.columns || 3}, 1fr)`, gap: 24 }}>
        {["Design Trends 2025", "Building Faster UIs", "AI in Web Design"].map((title, i) => (
          <div key={title} style={{ borderRadius: 20, overflow: "hidden", background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ height: 180, background: `linear-gradient(135deg, ${st.accentColor}20, ${st.accentColor2 || "#ec4899"}20)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
              {["✏️", "⚡", "🤖"][i]}
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: st.accentColor, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 8 }}>Mar 2025</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: st.textColor, marginBottom: 8, lineHeight: 1.3 }}>{title}</div>
              <div style={{ fontSize: 14, color: st.textColor, opacity: 0.6, lineHeight: 1.6 }}>An insight into the latest trends shaping the industry...</div>
              <div style={{ marginTop: 16, fontSize: 14, color: st.accentColor, fontWeight: 600, cursor: "pointer" }}>Read More →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewNewsletter({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const bg = st.gradient ? `linear-gradient(135deg, ${st.bgColor}, ${st.accentColor2 || "#ec4899"})` : st.bgColor;
  return (
    <div style={{ background: bg, padding: "80px 64px", textAlign: "center", boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, marginBottom: 12, letterSpacing: -1 }}>{st.heading}</h2>
      <p style={{ fontSize: 18, color: st.textColor, opacity: 0.75, marginBottom: 40 }}>{st.subheading}</p>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", gap: 12 }}>
        <input placeholder="Enter your email" style={{ flex: 1, padding: "16px 20px", borderRadius: 12, border: "none", fontSize: 15, background: "rgba(255,255,255,0.15)", color: "#fff", outline: "none" }} />
        <button style={{ padding: "16px 28px", borderRadius: 12, border: "none", background: "#fff", color: st.bgColor, fontWeight: 700, fontSize: 15, cursor: "pointer", whiteSpace: "nowrap" as const }}>{st.buttonText || "Subscribe"} →</button>
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: st.textColor, opacity: 0.6 }}>No spam. Unsubscribe anytime.</div>
    </div>
  );
}

function PreviewPortfolio({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const cols = st.columns || 3;
  const count = st.imageCount || 6;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, textAlign: "center", marginBottom: 48, letterSpacing: -1 }}>{st.heading}</h2>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ paddingTop: "75%", position: "relative", borderRadius: 16, overflow: "hidden", background: `linear-gradient(135deg, hsl(${260 + i * 25},55%,88%), hsl(${280 + i * 25},50%,78%))`, cursor: "pointer" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 36 }}>{"🎨🖥️📱🎬🎯🖼️"[i] || "🎨"}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", opacity: 0.9 }}>Project {i + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTimeline({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, textAlign: "center", marginBottom: 48, letterSpacing: -1 }}>{st.heading}</h2>
      <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
        <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${st.accentColor}, transparent)` }} />
        {(st.items || []).map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 24, marginBottom: 32, paddingLeft: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: st.accentColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontWeight: 700, fontSize: 14, zIndex: 1 }}>{i + 1}</div>
            <div style={{ paddingTop: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: st.textColor }}>{item.split("—")[0]}</div>
              {item.includes("—") && <div style={{ fontSize: 14, color: st.textColor, opacity: 0.6, marginTop: 4 }}>{item.split("—")[1]}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewPartners({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "48px 64px", boxSizing: "border-box", fontFamily: font }}>
      {st.heading && <div style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: st.textColor, opacity: 0.45, textTransform: "uppercase" as const, letterSpacing: 2, marginBottom: 32 }}>{st.heading}</div>}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
        {(st.items || []).map((name, i) => (
          <div key={i} style={{ fontSize: 18, fontWeight: 800, color: st.textColor, opacity: 0.35, letterSpacing: -0.5 }}>{name}</div>
        ))}
      </div>
    </div>
  );
}

function PreviewVideoSection({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", textAlign: "center", boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, marginBottom: 12, letterSpacing: -1 }}>{st.heading}</h2>
      <p style={{ fontSize: 18, color: st.textColor, opacity: 0.6, marginBottom: 48 }}>{st.subheading}</p>
      <div style={{ maxWidth: 800, margin: "0 auto", borderRadius: 20, overflow: "hidden", background: "#0f0f1a", paddingTop: "42%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${st.accentColor}30, #000)` }}>
          <button style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.4)", color: "#fff", fontSize: 26, cursor: "pointer", backdropFilter: "blur(8px)" }}>▶</button>
        </div>
      </div>
    </div>
  );
}

function PreviewContact({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", textAlign: st.align as any, boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, marginBottom: 12, letterSpacing: -1 }}>{st.heading}</h2>
      <p style={{ fontSize: 18, color: st.textColor, opacity: 0.6, marginBottom: 48 }}>{st.subheading}</p>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {["Full Name", "Email Address", "Subject"].map(f => <input key={f} placeholder={f} style={{ padding: "14px 18px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 15, background: "#fafafa", color: st.textColor }} />)}
        <textarea placeholder="Your message..." rows={5} style={{ padding: "14px 18px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 15, resize: "none", background: "#fafafa", fontFamily: font }} />
        <button style={{ padding: "16px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${st.accentColor}, ${st.accentColor2 || "#ec4899"})`, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Send Message →</button>
      </div>
    </div>
  );
}

function PreviewGallery({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const cols = st.columns || 3;
  const count = st.imageCount || 6;
  return (
    <div style={{ background: st.bgColor, padding: "80px 64px", boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 44, fontWeight: 800, color: st.textColor, textAlign: "center", marginBottom: 48, letterSpacing: -1 }}>{st.heading}</h2>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ paddingTop: "75%", position: "relative", borderRadius: 16, overflow: "hidden", background: `hsl(${250 + i * 18}, 50%, 88%)` }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🖼️</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewCTA({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  const bg = st.gradient ? `linear-gradient(135deg, ${st.bgColor}, ${st.accentColor2 || "#ec4899"})` : st.bgColor;
  return (
    <div style={{ background: bg, padding: "100px 64px", textAlign: "center", boxSizing: "border-box", fontFamily: font }}>
      <h2 style={{ fontSize: 56, fontWeight: 900, color: st.textColor, marginBottom: 20, letterSpacing: -2, lineHeight: 1.05 }}>{st.heading}</h2>
      {st.subheading && <p style={{ fontSize: 20, color: st.textColor, opacity: 0.75, marginBottom: 48, maxWidth: 500, margin: "0 auto 48px" }}>{st.subheading}</p>}
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        {st.buttonText && <button style={{ padding: "18px 40px", borderRadius: 14, border: "none", background: "#fff", color: st.bgColor, fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>{st.buttonText} →</button>}
        {st.buttonText2 && <button style={{ padding: "18px 32px", borderRadius: 14, border: `2px solid rgba(255,255,255,0.4)`, background: "transparent", color: st.textColor, fontWeight: 700, fontSize: 18, cursor: "pointer" }}>{st.buttonText2}</button>}
      </div>
    </div>
  );
}

function PreviewFooter({ s, font }: { s: Section; font: string }) {
  const st = s.settings;
  return (
    <div style={{ background: st.bgColor, padding: "48px 64px", boxSizing: "border-box", fontFamily: font }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: st.accentColor, marginBottom: 10 }}>{st.logoText}</div>
          <div style={{ fontSize: 14, color: st.textColor, opacity: 0.5, maxWidth: 240, lineHeight: 1.6 }}>Building the future of design tools. Made with ❤️</div>
        </div>
        <div style={{ display: "flex", gap: 48 }}>
          {["Product", "Company", "Resources"].map(cat => (
            <div key={cat}>
              <div style={{ fontSize: 12, fontWeight: 700, color: st.textColor, opacity: 0.4, textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 16 }}>{cat}</div>
              {(st.navLinks || []).slice(0, 4).map(l => <div key={l} style={{ fontSize: 14, color: st.textColor, opacity: 0.6, marginBottom: 10, cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: st.textColor, opacity: 0.35 }}>© 2026 {st.logoText}. All rights reserved.</div>
        <div style={{ display: "flex", gap: 16 }}>
          {["🐦", "💼", "📘", "🐙"].map((icon, i) => <button key={i} style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", fontSize: 16 }}>{icon}</button>)}
        </div>
      </div>
    </div>
  );
}

function SectionPreview({ s, view, font }: { s: Section; view: ViewMode; font: string }) {
  if (!s.visible) return null;
  const props = { s, font };
  switch (s.type) {
    case "header": return <PreviewHeader {...props} />;
    case "hero": return <PreviewHero {...props} />;
    case "hero-split": return <PreviewHeroSplit {...props} />;
    case "hero-video": return <PreviewHeroVideo {...props} />;
    case "about": return <PreviewAbout {...props} />;
    case "features": return <PreviewFeatures {...props} />;
    case "features-grid": return <PreviewFeaturesGrid {...props} />;
    case "stats": return <PreviewStats {...props} />;
    case "gallery": return <PreviewGallery {...props} />;
    case "contact": return <PreviewContact {...props} />;
    case "pricing": return <PreviewPricing {...props} />;
    case "testimonials": return <PreviewTestimonials {...props} />;
    case "cta": return <PreviewCTA {...props} />;
    case "faq": return <PreviewFAQ {...props} />;
    case "team": return <PreviewTeam {...props} />;
    case "blog": return <PreviewBlog {...props} />;
    case "newsletter": return <PreviewNewsletter {...props} />;
    case "portfolio": return <PreviewPortfolio {...props} />;
    case "timeline": return <PreviewTimeline {...props} />;
    case "partners": return <PreviewPartners {...props} />;
    case "video-section": return <PreviewVideoSection {...props} />;
    case "footer": return <PreviewFooter {...props} />;
    default: return null;
  }
}

export default function WebUIDesigner() {
  const [, navigate] = useLocation();
  const [sections, setSections] = useState<Section[]>([
    defaultSection("header"), defaultSection("hero"), defaultSection("stats"),
    defaultSection("features"), defaultSection("testimonials"), defaultSection("cta"), defaultSection("footer"),
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [rightTab, setRightTab] = useState<"add" | "settings" | "style" | "ai" | "export">("add");
  const [font, setFont] = useState("Inter");
  const [zoom, setZoom] = useState(0.65);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [history, setHistory] = useState<Section[][]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [searchSection, setSearchSection] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePalette, setActivePalette] = useState(COLOR_PALETTES[0]);
  const [globalPrimaryColor, setGlobalPrimaryColor] = useState("#7c3aed");
  const [globalBgColor, setGlobalBgColor] = useState("#ffffff");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [exportFormat, setExportFormat] = useState<"HTML" | "React" | "Next.js" | "Vue" | "Angular">("HTML");
  const [sectionCopyBuffer, setSectionCopyBuffer] = useState<Section | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedSection = sections.find(s => s.id === selected);

  const pushHistory = useCallback((newSections: Section[]) => {
    setHistory(prev => [...prev.slice(0, histIdx + 1), newSections].slice(-30));
    setHistIdx(i => Math.min(i + 1, 29));
  }, [histIdx]);

  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    setSections(history[histIdx - 1]);
    setHistIdx(i => i - 1);
  }, [history, histIdx]);

  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return;
    setSections(history[histIdx + 1]);
    setHistIdx(i => i + 1);
  }, [history, histIdx]);

  const addSection = (type: SectionType) => {
    const sec = defaultSection(type);
    sec.settings.accentColor = globalPrimaryColor;
    const newSections = [...sections, sec];
    setSections(newSections);
    setSelected(sec.id);
    pushHistory(newSections);
    setRightTab("settings");
  };

  const updateSection = useCallback((id: string, patch: Partial<Section["settings"]>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, settings: { ...s.settings, ...patch } } : s));
  }, []);

  const commitSection = useCallback((id: string, patch: Partial<Section["settings"]>) => {
    const newSections = sections.map(s => s.id === id ? { ...s, settings: { ...s.settings, ...patch } } : s);
    setSections(newSections);
    pushHistory(newSections);
  }, [sections, pushHistory]);

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
    const newSections = sections.filter(s => s.id !== id);
    setSections(newSections);
    if (selected === id) setSelected(null);
    pushHistory(newSections);
  };

  const duplicateSection = (id: string) => {
    const src = sections.find(s => s.id === id);
    if (!src) return;
    const dup: Section = { ...src, id: `sec_${Date.now()}` };
    const idx = sections.findIndex(s => s.id === id);
    const newSections = [...sections.slice(0, idx + 1), dup, ...sections.slice(idx + 1)];
    setSections(newSections);
    setSelected(dup.id);
    pushHistory(newSections);
  };

  const applyPreset = (preset: PagePreset) => {
    const newSections = preset.sections.map(type => {
      const sec = defaultSection(type);
      sec.settings.accentColor = globalPrimaryColor;
      return sec;
    });
    setSections(newSections);
    setSelected(null);
    pushHistory(newSections);
  };

  const applyPalette = (palette: typeof COLOR_PALETTES[0]) => {
    setActivePalette(palette);
    setGlobalPrimaryColor(palette.accent);
    setSections(prev => prev.map(s => ({
      ...s,
      settings: {
        ...s.settings,
        accentColor: s.settings.accentColor ? palette.accent : s.settings.accentColor,
        accentColor2: palette.accent2,
      }
    })));
  };

  const generateAIPage = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const types: SectionType[] = ["header", "hero", "stats", "features", "testimonials", "pricing", "cta", "footer"];
      const newSections = types.map(type => {
        const sec = defaultSection(type);
        sec.settings.accentColor = globalPrimaryColor;
        if (aiPrompt) sec.settings.heading = aiPrompt.includes("heading:") ? aiPrompt.split("heading:")[1].trim() : sec.settings.heading;
        return sec;
      });
      setSections(newSections);
      pushHistory(newSections);
      setAiGenerating(false);
    }, 1500);
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z") { e.preventDefault(); undo(); }
      else if (ctrl && e.key === "y") { e.preventDefault(); redo(); }
      else if (ctrl && e.key === "c" && selected) { e.preventDefault(); const s = sections.find(sec => sec.id === selected); if (s) setSectionCopyBuffer({ ...s }); }
      else if (ctrl && e.key === "v" && sectionCopyBuffer) { e.preventDefault(); const dup: Section = { ...sectionCopyBuffer, id: `sec_${Date.now()}` }; const newSections = [...sections, dup]; setSections(newSections); pushHistory(newSections); }
      else if (ctrl && e.key === "d" && selected) { e.preventDefault(); duplicateSection(selected); }
      else if ((e.key === "Delete" || e.key === "Backspace") && selected) deleteSection(selected);
      else if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [undo, redo, selected, sections, sectionCopyBuffer]);

  const previewW = VIEW_WIDTHS[viewMode];
  const allSectionTypes = Object.values(SECTION_CATEGORIES).flat();
  const filteredSections = allSectionTypes.filter(type =>
    (selectedCategory === "All" || SECTION_CATEGORIES[selectedCategory]?.includes(type)) &&
    (!searchSection || SECTION_LABELS[type].toLowerCase().includes(searchSection.toLowerCase()))
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f0f1a", color: "#e5e7eb", fontFamily: `'Inter', sans-serif` }}>
      {/* Top Bar */}
      <div style={{ height: 52, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 10px", gap: 6, flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 20, cursor: "pointer" }}>✦</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Web UI Designer</span>

        {/* Viewport selector */}
        <div style={{ marginLeft: 8, display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
          {(["desktop", "tablet", "mobile"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ padding: "4px 10px", borderRadius: 5, border: "none", background: viewMode === v ? "rgba(124,58,237,0.4)" : "transparent", color: viewMode === v ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 14 }}>
              {v === "desktop" ? "🖥️" : v === "tablet" ? "📱" : "📲"}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "#4b5563" }}>{previewW}px</span>

        {/* Zoom */}
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <button onClick={() => setZoom(z => Math.max(0.25, z - 0.05))} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", borderRadius: 4, width: 22, height: 22, cursor: "pointer", fontSize: 14 }}>−</button>
          <span style={{ fontSize: 11, color: "#6b7280", minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.05))} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", borderRadius: 4, width: 22, height: 22, cursor: "pointer", fontSize: 14 }}>+</button>
          <button onClick={() => setZoom(viewMode === "desktop" ? 0.65 : viewMode === "tablet" ? 0.85 : 1)} style={{ padding: "2px 6px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.04)", color: "#6b7280", cursor: "pointer", fontSize: 10 }}>Fit</button>
        </div>

        {/* Undo/Redo */}
        <button onClick={undo} disabled={histIdx <= 0} style={{ padding: "4px 7px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.05)", color: histIdx <= 0 ? "#3b3b4f" : "#9ca3af", cursor: "pointer", fontSize: 13 }}>↩</button>
        <button onClick={redo} disabled={histIdx >= history.length - 1} style={{ padding: "4px 7px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.05)", color: histIdx >= history.length - 1 ? "#3b3b4f" : "#9ca3af", cursor: "pointer", fontSize: 13 }}>↪</button>

        {/* Global color */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Accent</span>
          <input type="color" value={globalPrimaryColor} onChange={e => { setGlobalPrimaryColor(e.target.value); setSections(prev => prev.map(s => ({ ...s, settings: { ...s.settings, accentColor: e.target.value } }))); }}
            style={{ width: 28, height: 24, border: "none", borderRadius: 4, cursor: "pointer", background: "transparent" }} />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {selected && (
            <>
              <button onClick={() => duplicateSection(selected)} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>⧉ Dup</button>
              <button onClick={() => deleteSection(selected)} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 11 }}>🗑</button>
            </>
          )}
          <button onClick={() => setRightTab("export")} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>⬇ Export</button>
          <button style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>🚀 Publish</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left - Page Structure */}
        <div style={{ width: 188, background: "#13131f", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Page ({sections.length})</span>
            <button onClick={() => setRightTab("add")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#a78bfa", width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {sections.map((s, i) => (
              <div key={s.id} onClick={() => { setSelected(s.id); setRightTab("settings"); }}
                style={{ padding: "7px 8px", borderRadius: 6, marginBottom: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  background: s.id === selected ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${s.id === selected ? "#7c3aed" : "rgba(255,255,255,0.06)"}`,
                  opacity: s.visible ? 1 : 0.4 }}>
                <span style={{ fontSize: 13 }}>{SECTION_ICONS[s.type]}</span>
                <span style={{ fontSize: 11, color: "#d1d5db", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{SECTION_LABELS[s.type]}</span>
                <div style={{ display: "flex", gap: 2 }}>
                  <button onClick={(e) => { e.stopPropagation(); setSections(prev => prev.map(x => x.id === s.id ? { ...x, visible: !x.visible } : x)); }}
                    style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", lineHeight: 1, padding: 0, fontSize: 11 }}>👁</button>
                  <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, -1); }}
                    style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", lineHeight: 1, padding: 0, fontSize: 10 }}>▲</button>
                  <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 1); }}
                    style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", lineHeight: 1, padding: 0, fontSize: 10 }}>▼</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setRightTab("add")} style={{ width: "100%", padding: "7px 0", borderRadius: 6, border: "1px dashed rgba(124,58,237,0.4)", background: "rgba(124,58,237,0.05)", color: "#a78bfa", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>+ Add Section</button>
          </div>
        </div>

        {/* Canvas Preview */}
        <div style={{ flex: 1, overflow: "auto", background: "#0a0a14", display: "flex", justifyContent: "center", padding: 24 }} ref={canvasRef}>
          <div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#4b5563", marginBottom: 12 }}>
              {viewMode === "desktop" ? "🖥️" : viewMode === "tablet" ? "📱" : "📲"} {previewW}px preview
            </div>
            <div style={{ width: previewW * zoom, flexShrink: 0, boxShadow: "0 8px 60px rgba(0,0,0,0.8)", borderRadius: viewMode === "desktop" ? 8 : viewMode === "tablet" ? 16 : 28, overflow: "hidden" }}>
              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: previewW, background: globalBgColor, minHeight: 400, fontFamily: `'${font}', sans-serif` }}>
                {sections.map(s => (
                  <div key={s.id} style={{ position: "relative", outline: s.id === selected ? "2px solid #7c3aed" : "none", outlineOffset: -2, cursor: "pointer", transition: "outline 0.15s" }}
                    onClick={() => { setSelected(s.id); setRightTab("settings"); }}>
                    <SectionPreview s={s} view={viewMode} font={font} />
                    {s.id === selected && (
                      <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4, zIndex: 10 }}>
                        <div style={{ fontSize: 11, color: "#fff", background: "#7c3aed", padding: "2px 8px", borderRadius: 4 }}>{SECTION_LABELS[s.type]}</div>
                        <button onClick={(e) => { e.stopPropagation(); setSections(prev => prev.map(x => x.id === s.id ? { ...x, visible: !x.visible } : x)); }}
                          style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", fontSize: 11 }}>
                          {s.visible ? "👁 Hide" : "👁 Show"}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); duplicateSection(s.id); }}
                          style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", fontSize: 11 }}>⧉</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteSection(s.id); }}
                          style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: "rgba(239,68,68,0.8)", color: "#fff", cursor: "pointer", fontSize: 11 }}>🗑</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 288, background: "#13131f", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
            {(["add", "settings", "style", "ai", "export"] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                style={{ flex: "0 0 auto", padding: "9px 8px", fontSize: 10, cursor: "pointer", border: "none", background: "none",
                  color: rightTab === tab ? "#a78bfa" : "#6b7280", fontWeight: rightTab === tab ? 700 : 400,
                  borderBottom: rightTab === tab ? "2px solid #7c3aed" : "2px solid transparent", whiteSpace: "nowrap" }}>
                {tab === "add" ? "➕ Add" : tab === "settings" ? "⚙️ Edit" : tab === "style" ? "🎨 Style" : tab === "ai" ? "🤖 AI" : "⬇ Export"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {rightTab === "add" && (
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 10 }}>Page Presets</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 14 }}>
                  {PAGE_PRESETS.map(p => (
                    <button key={p.name} onClick={() => applyPreset(p)}
                      style={{ padding: "10px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                      <span style={{ fontSize: 20 }}>{p.icon}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af", textAlign: "center" }}>{p.name}</span>
                    </button>
                  ))}
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 10 }} />
                <input value={searchSection} onChange={e => setSearchSection(e.target.value)} placeholder="Search sections..."
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 10px", color: "#e5e7eb", fontSize: 12, marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 10 }}>
                  {["All", ...Object.keys(SECTION_CATEGORIES)].map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      style={{ padding: "3px 8px", borderRadius: 12, border: "1px solid", borderColor: selectedCategory === cat ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedCategory === cat ? "rgba(124,58,237,0.2)" : "transparent", color: selectedCategory === cat ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 10 }}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {filteredSections.map(type => (
                    <button key={type} onClick={() => addSection(type)}
                      style={{ padding: "10px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "border-color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                      <span style={{ fontSize: 18 }}>{SECTION_ICONS[type]}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af", textAlign: "center" }}>{SECTION_LABELS[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rightTab === "settings" && selectedSection && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>{SECTION_LABELS[selectedSection.type]}</div>

                {/* Text content */}
                {["heading", "subheading", "buttonText", "buttonText2", "logoText", "badgeText"].map(key => (
                  (selectedSection.settings as Record<string, any>)[key] !== undefined && (
                    <div key={key}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</div>
                      <input value={(selectedSection.settings as Record<string, string>)[key] ?? ""}
                        onChange={e => updateSection(selectedSection.id, { [key]: e.target.value } as Partial<Section["settings"]>)}
                        onBlur={e => commitSection(selectedSection.id, { [key]: e.target.value } as Partial<Section["settings"]>)}
                        style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "6px 10px", color: "#e5e7eb", fontSize: 12 }} />
                    </div>
                  )
                ))}

                {/* Alignment */}
                {selectedSection.settings.align !== undefined && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Text Align</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(["left", "center", "right"] as const).map(a => (
                        <button key={a} onClick={() => updateSection(selectedSection.id, { align: a })}
                          style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid", borderColor: selectedSection.settings.align === a ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedSection.settings.align === a ? "rgba(124,58,237,0.2)" : "transparent", color: selectedSection.settings.align === a ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 11 }}>
                          {a === "left" ? "⬤◌◌" : a === "center" ? "◌⬤◌" : "◌◌⬤"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                {selectedSection.settings.navLinks && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Nav Links (comma-separated)</div>
                    <input value={(selectedSection.settings.navLinks || []).join(", ")}
                      onChange={e => updateSection(selectedSection.id, { navLinks: e.target.value.split(",").map(s => s.trim()) })}
                      style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "6px 10px", color: "#e5e7eb", fontSize: 12 }} />
                  </div>
                )}

                {/* Columns */}
                {selectedSection.settings.columns !== undefined && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Columns</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[2, 3, 4, 6].map(c => (
                        <button key={c} onClick={() => updateSection(selectedSection.id, { columns: c })}
                          style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid", borderColor: selectedSection.settings.columns === c ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedSection.settings.columns === c ? "rgba(124,58,237,0.2)" : "transparent", color: selectedSection.settings.columns === c ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12 }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Padding */}
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Padding</div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {(["xs", "sm", "md", "lg", "xl"] as const).map(p => (
                      <button key={p} onClick={() => updateSection(selectedSection.id, { padding: p })}
                        style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", borderColor: selectedSection.settings.padding === p ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedSection.settings.padding === p ? "rgba(124,58,237,0.2)" : "transparent", color: selectedSection.settings.padding === p ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 10, textTransform: "uppercase" }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Style */}
                {selectedSection.settings.cardStyle !== undefined && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Card Style</div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {(["flat", "shadow", "border", "glass"] as const).map(s => (
                        <button key={s} onClick={() => updateSection(selectedSection.id, { cardStyle: s })}
                          style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", borderColor: selectedSection.settings.cardStyle === s ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedSection.settings.cardStyle === s ? "rgba(124,58,237,0.2)" : "transparent", color: selectedSection.settings.cardStyle === s ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 10 }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items list */}
                {selectedSection.settings.items && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Items (one per line)</div>
                    <textarea value={(selectedSection.settings.items || []).join("\n")}
                      onChange={e => updateSection(selectedSection.id, { items: e.target.value.split("\n").filter(s => s.trim()) })}
                      rows={5}
                      style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "6px 10px", color: "#e5e7eb", fontSize: 12, resize: "vertical" }} />
                  </div>
                )}

                {/* Toggles */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["gradient", "Gradient BG"],
                    ["bgImage", "Use Image BG"],
                    ["showCTA", "Show CTA Button"],
                    ["stickyHeader", "Sticky Header"],
                    ["showBadge", "Show Badge"],
                    ["countUp", "Animate Numbers"],
                  ].map(([key, label]) => (
                    (selectedSection.settings as Record<string, any>)[key] !== undefined && (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={(selectedSection.settings as Record<string, any>)[key] || false}
                          onChange={e => updateSection(selectedSection.id, { [key]: e.target.checked } as Partial<Section["settings"]>)} />
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
                      </label>
                    )
                  ))}
                </div>

                <button onClick={() => deleteSection(selectedSection.id)}
                  style={{ padding: "8px 0", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 12, marginTop: 4 }}>
                  🗑 Remove Section
                </button>
              </div>
            )}

            {rightTab === "settings" && !selectedSection && (
              <div style={{ padding: 24, textAlign: "center", color: "#4b5563", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                Click a section on the canvas to edit its settings
              </div>
            )}

            {rightTab === "style" && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>Global Design System</div>

                {/* Color Palettes */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Color Palettes</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {COLOR_PALETTES.map(p => (
                      <button key={p.name} onClick={() => applyPalette(p)}
                        style={{ padding: "8px 10px", borderRadius: 8, border: `2px solid ${activePalette.name === p.name ? p.accent : "rgba(255,255,255,0.07)"}`, background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", gap: 6, alignItems: "center" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: p.accent, flexShrink: 0 }} />
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: p.accent2, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Colors */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Custom Colors</div>
                  {[
                    { label: "Accent", key: "accentColor" },
                    { label: "Accent 2", key: "accentColor2" },
                    { label: "Background", key: "bgColor" },
                    { label: "Text", key: "textColor" },
                  ].map(({ label, key }) => selectedSection && (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ flex: 1, fontSize: 12, color: "#6b7280" }}>{label}</span>
                      <input type="color" value={(selectedSection.settings as Record<string, string>)[key] ?? "#ffffff"}
                        onChange={e => updateSection(selectedSection.id, { [key]: e.target.value } as Partial<Section["settings"]>)}
                        style={{ width: 36, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                    </div>
                  ))}
                </div>

                {/* Font */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Typography</div>
                  <select value={font} onChange={e => setFont(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "7px 10px", color: "#e5e7eb", fontSize: 12, marginBottom: 8 }}>
                    {FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <div style={{ fontSize: 14, fontFamily: font, color: "#e5e7eb", textAlign: "center", opacity: 0.6 }}>
                    The quick brown fox jumps
                  </div>
                </div>

                {/* Global BG */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Page Background</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="color" value={globalBgColor} onChange={e => setGlobalBgColor(e.target.value)}
                      style={{ width: 36, height: 32, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent" }} />
                    <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{globalBgColor}</span>
                  </div>
                </div>

                {/* Gradient for selected */}
                {selectedSection && (
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Section Gradient</div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}>
                      <input type="checkbox" checked={selectedSection.settings.gradient || false}
                        onChange={e => updateSection(selectedSection.id, { gradient: e.target.checked })} />
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>Enable Gradient</span>
                    </label>
                    {selectedSection.settings.gradient && (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: "#6b7280", flex: 1 }}>Color 2</span>
                          <input type="color" value={selectedSection.settings.gradientColor2 || "#c4b5fd"}
                            onChange={e => updateSection(selectedSection.id, { gradientColor2: e.target.value })}
                            style={{ width: 36, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "#6b7280", flex: 1 }}>Angle</span>
                          <input type="range" min={0} max={360} value={selectedSection.settings.gradientAngle || 135}
                            onChange={e => updateSection(selectedSection.id, { gradientAngle: Number(e.target.value) })}
                            style={{ flex: 2 }} />
                          <span style={{ fontSize: 11, color: "#6b7280", minWidth: 32 }}>{selectedSection.settings.gradientAngle || 135}°</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Overlay opacity for hero-video */}
                {selectedSection?.type === "hero-video" && (
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Video Overlay</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>Opacity</span>
                      <input type="range" min={0} max={100} value={selectedSection.settings.overlayOpacity ?? 60}
                        onChange={e => updateSection(selectedSection.id, { overlayOpacity: Number(e.target.value) })}
                        style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#6b7280" }}>{selectedSection.settings.overlayOpacity ?? 60}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {rightTab === "ai" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>🤖 AI Page Builder</div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>✨ Generate Full Page</div>
                  <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder='Describe your website, e.g. "A SaaS product for project management"' rows={4}
                    style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 10px", color: "#e5e7eb", fontSize: 12, resize: "none", marginBottom: 8 }} />
                  <button onClick={generateAIPage} disabled={aiGenerating}
                    style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: aiGenerating ? "#4b3b6d" : "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, cursor: aiGenerating ? "not-allowed" : "pointer", fontSize: 13 }}>
                    {aiGenerating ? "⏳ Generating..." : "✨ Generate Page"}
                  </button>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Quick Add Sections</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {Object.entries(SECTION_CATEGORIES).map(([cat, types]) => (
                      <div key={cat}>
                        <div style={{ fontSize: 10, color: "#4b5563", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, marginTop: 6 }}>{cat}</div>
                        {types.map(type => (
                          <button key={type} onClick={() => addSection(type)}
                            style={{ display: "block", width: "100%", marginBottom: 3, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 11, textAlign: "left" }}>
                            {SECTION_ICONS[type]} {SECTION_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Smart Fill Selected</div>
                  {selectedSection ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button onClick={() => updateSection(selectedSection.id, { heading: "Unlock Your Creative Potential", subheading: "Join thousands of designers building faster and better with AI-powered tools." })}
                        style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 11, textAlign: "left" }}>
                        ✨ Generate Compelling Copy
                      </button>
                      <button onClick={() => updateSection(selectedSection.id, { gradient: true, accentColor2: "#ec4899" })}
                        style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 11, textAlign: "left" }}>
                        🌈 Apply Gradient
                      </button>
                      <button onClick={() => updateSection(selectedSection.id, { cardStyle: "glass" })}
                        style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 11, textAlign: "left" }}>
                        🪟 Apply Glass Style
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: "#4b5563", fontSize: 12 }}>Select a section first</div>
                  )}
                </div>
              </div>
            )}

            {rightTab === "export" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>⬇ Export</div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Export Format</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(["HTML", "React", "Next.js", "Vue", "Angular"] as const).map(f => (
                      <button key={f} onClick={() => setExportFormat(f)}
                        style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid", borderColor: exportFormat === f ? "#7c3aed" : "rgba(255,255,255,0.1)", background: exportFormat === f ? "rgba(124,58,237,0.2)" : "transparent", color: exportFormat === f ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Export Summary</div>
                  {[
                    { k: "Sections", v: sections.length },
                    { k: "Format", v: exportFormat },
                    { k: "Font", v: font },
                    { k: "Viewport", v: viewMode },
                    { k: "Visible Sections", v: sections.filter(s => s.visible).length },
                  ].map(({ k, v }) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: "#6b7280" }}>{k}</span>
                      <span style={{ color: "#a78bfa", fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => alert(`Exporting ${sections.length} sections as ${exportFormat} with ${font} font.\n\nIn production this generates clean, production-ready code.`)}
                  style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, marginBottom: 6 }}>
                  ⬇ Download {exportFormat} Code
                </button>
                <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12, marginBottom: 6 }}>
                  📷 Export as PNG
                </button>
                <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12, marginBottom: 6 }}>
                  🔗 Share Preview Link
                </button>
                <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>
                  ☁ Save to Cloud
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
