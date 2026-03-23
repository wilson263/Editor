import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";

type Screen = { id: string; name: string; elements: CanvasElement[]; bgColor: string; notes: string };
type CanvasElement = {
  id: string; type: string; x: number; y: number; w: number; h: number;
  text?: string; color?: string; bg?: string; fontSize?: number; borderRadius?: number;
  opacity?: number; rotation?: number; visible?: boolean; locked?: boolean;
  border?: string; padding?: number; shadow?: string; fontWeight?: string;
  fontFamily?: string; textAlign?: string; gradient?: string; blendMode?: string;
  imageUrl?: string; iconName?: string; checked?: boolean;
};
type DeviceSize = { label: string; w: number; h: number; brand: string };
type AnimationPreset = { name: string; css: string };

const DEVICES: DeviceSize[] = [
  { label: "iPhone 15 Pro", w: 393, h: 852, brand: "apple" },
  { label: "iPhone 15 Max", w: 430, h: 932, brand: "apple" },
  { label: "iPhone SE", w: 375, h: 667, brand: "apple" },
  { label: "iPhone 14", w: 390, h: 844, brand: "apple" },
  { label: "Android L", w: 412, h: 915, brand: "android" },
  { label: "Android M", w: 360, h: 800, brand: "android" },
  { label: "Pixel 8", w: 393, h: 851, brand: "android" },
  { label: "Samsung S24", w: 360, h: 780, brand: "android" },
  { label: "iPad Mini", w: 744, h: 1133, brand: "tablet" },
  { label: "iPad Pro 11", w: 834, h: 1194, brand: "tablet" },
];

const COMPONENT_LIBRARY = [
  // Navigation
  { type: "navbar", label: "Nav Bar", icon: "📱", defaultW: 390, defaultH: 56, color: "#111827", bg: "#ffffff", group: "Navigation" },
  { type: "tab", label: "Tab Bar", icon: "📑", defaultW: 390, defaultH: 72, color: "#374151", bg: "#ffffff", group: "Navigation" },
  { type: "sidebar-nav", label: "Side Nav", icon: "☰", defaultW: 280, defaultH: 600, color: "#111827", bg: "#f9fafb", group: "Navigation" },
  { type: "breadcrumb", label: "Breadcrumb", icon: "🗂", defaultW: 300, defaultH: 32, color: "#6b7280", bg: "transparent", group: "Navigation" },
  // Form
  { type: "button", label: "Button", icon: "⬜", defaultW: 200, defaultH: 48, color: "#fff", bg: "#7c3aed", group: "Form" },
  { type: "button-outline", label: "Btn Outline", icon: "⬜", defaultW: 200, defaultH: 48, color: "#7c3aed", bg: "transparent", group: "Form" },
  { type: "textfield", label: "Text Field", icon: "✏️", defaultW: 280, defaultH: 44, color: "#374151", bg: "#f9fafb", group: "Form" },
  { type: "textarea", label: "Textarea", icon: "📝", defaultW: 280, defaultH: 100, color: "#374151", bg: "#f9fafb", group: "Form" },
  { type: "dropdown", label: "Dropdown", icon: "▾", defaultW: 200, defaultH: 44, color: "#374151", bg: "#ffffff", group: "Form" },
  { type: "checkbox", label: "Checkbox", icon: "☑", defaultW: 200, defaultH: 28, color: "#111827", bg: "transparent", group: "Form" },
  { type: "radio", label: "Radio", icon: "◉", defaultW: 200, defaultH: 28, color: "#111827", bg: "transparent", group: "Form" },
  { type: "switch", label: "Switch", icon: "🔘", defaultW: 60, defaultH: 32, color: "#fff", bg: "#7c3aed", group: "Form" },
  { type: "slider-comp", label: "Slider", icon: "⊻", defaultW: 250, defaultH: 36, color: "#7c3aed", bg: "#e5e7eb", group: "Form" },
  { type: "search-bar", label: "Search Bar", icon: "🔍", defaultW: 320, defaultH: 44, color: "#6b7280", bg: "#f3f4f6", group: "Form" },
  { type: "date-picker", label: "Date Picker", icon: "📅", defaultW: 280, defaultH: 44, color: "#374151", bg: "#ffffff", group: "Form" },
  // Display
  { type: "card", label: "Card", icon: "🃏", defaultW: 280, defaultH: 120, color: "#1a1a2e", bg: "#ffffff", group: "Display" },
  { type: "list-item", label: "List Item", icon: "≡", defaultW: 320, defaultH: 60, color: "#111827", bg: "#ffffff", group: "Display" },
  { type: "image", label: "Image", icon: "🖼️", defaultW: 280, defaultH: 160, color: "#666", bg: "#e5e7eb", group: "Display" },
  { type: "avatar", label: "Avatar", icon: "👤", defaultW: 56, defaultH: 56, color: "#fff", bg: "#7c3aed", group: "Display" },
  { type: "badge", label: "Badge", icon: "🏷️", defaultW: 80, defaultH: 28, color: "#fff", bg: "#ef4444", group: "Display" },
  { type: "chip", label: "Chip", icon: "🏷", defaultW: 100, defaultH: 32, color: "#7c3aed", bg: "rgba(124,58,237,0.1)", group: "Display" },
  { type: "toast", label: "Toast", icon: "💬", defaultW: 300, defaultH: 56, color: "#fff", bg: "#111827", group: "Display" },
  { type: "modal", label: "Modal", icon: "⬛", defaultW: 300, defaultH: 200, color: "#111827", bg: "#ffffff", group: "Display" },
  { type: "divider", label: "Divider", icon: "—", defaultW: 300, defaultH: 1, color: "#e5e7eb", bg: "#e5e7eb", group: "Display" },
  // Data
  { type: "progress-bar", label: "Progress", icon: "▰", defaultW: 280, defaultH: 8, color: "#fff", bg: "#7c3aed", group: "Data" },
  { type: "rating", label: "Rating", icon: "⭐", defaultW: 140, defaultH: 32, color: "#f59e0b", bg: "transparent", group: "Data" },
  { type: "stat-card", label: "Stat Card", icon: "📊", defaultW: 140, defaultH: 90, color: "#111827", bg: "#ffffff", group: "Data" },
  { type: "chart-bar", label: "Bar Chart", icon: "📊", defaultW: 280, defaultH: 120, color: "#7c3aed", bg: "#f9fafb", group: "Data" },
  { type: "chart-line", label: "Line Chart", icon: "📈", defaultW: 280, defaultH: 120, color: "#10b981", bg: "#f9fafb", group: "Data" },
  // Typography
  { type: "text", label: "Text", icon: "T", defaultW: 200, defaultH: 32, color: "#111827", bg: "transparent", group: "Typography" },
  { type: "heading", label: "Heading", icon: "H", defaultW: 280, defaultH: 48, color: "#111827", bg: "transparent", group: "Typography" },
  { type: "label-comp", label: "Label", icon: "Aa", defaultW: 140, defaultH: 20, color: "#6b7280", bg: "transparent", group: "Typography" },
  // Misc
  { type: "icon", label: "Icon", icon: "⭐", defaultW: 48, defaultH: 48, color: "#7c3aed", bg: "transparent", group: "Misc" },
  { type: "spacer", label: "Spacer", icon: "↕", defaultW: 280, defaultH: 20, color: "transparent", bg: "transparent", group: "Misc" },
  { type: "container", label: "Container", icon: "⬜", defaultW: 320, defaultH: 200, color: "transparent", bg: "#f9fafb", group: "Misc" },
];

const COMPONENT_GROUPS = ["Navigation", "Form", "Display", "Data", "Typography", "Misc"];

const FONT_LIST = ["Inter", "Roboto", "Poppins", "Montserrat", "Space Grotesk", "Nunito", "Ubuntu", "SF Pro", "Plus Jakarta Sans"];
const THEME_PRESETS = [
  { name: "iOS Default", bg: "#ffffff", accent: "#007aff", text: "#000000", secondary: "#f2f2f7", radius: 12 },
  { name: "Material", bg: "#ffffff", accent: "#6750a4", text: "#1c1b1f", secondary: "#f5f5f5", radius: 8 },
  { name: "Dark Mode", bg: "#1c1c1e", accent: "#7c3aed", text: "#ffffff", secondary: "#2c2c2e", radius: 12 },
  { name: "Minimal", bg: "#fafafa", accent: "#111827", text: "#111827", secondary: "#f3f4f6", radius: 4 },
  { name: "Vibrant", bg: "#ffffff", accent: "#ec4899", text: "#111827", secondary: "#fdf4ff", radius: 16 },
  { name: "Corporate", bg: "#f8f9fa", accent: "#2563eb", text: "#1e293b", secondary: "#e2e8f0", radius: 6 },
];

const ANIMATION_PRESETS: AnimationPreset[] = [
  { name: "Slide Up", css: "translateY(20px)" },
  { name: "Fade In", css: "opacity: 0" },
  { name: "Scale In", css: "scale(0.9)" },
  { name: "Bounce", css: "scale(1.05)" },
];

function renderElement(el: CanvasElement, selected: boolean, onClick: () => void, onDrag: (dx: number, dy: number) => void) {
  if (!el.visible && el.visible !== undefined) return null;
  const base: React.CSSProperties = {
    position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h,
    cursor: el.locked ? "not-allowed" : "move",
    userSelect: "none",
    outline: selected ? "2px solid #7c3aed" : "none",
    outlineOffset: 2,
    boxSizing: "border-box",
    opacity: (el.opacity ?? 100) / 100,
    transform: `rotate(${el.rotation ?? 0}deg)`,
    fontFamily: el.fontFamily || "Inter",
  };

  if (el.shadow) base.boxShadow = el.shadow;

  let inner: React.ReactNode = null;
  let style: React.CSSProperties = { ...base, background: el.gradient || el.bg || "transparent", borderRadius: el.borderRadius ?? 8, color: el.color || "#111" };

  switch (el.type) {
    case "button":
      style = { ...style, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: el.fontWeight || "600", fontSize: el.fontSize ?? 15, borderRadius: el.borderRadius ?? 12, background: el.gradient || el.bg || "#7c3aed", boxShadow: el.shadow || "0 4px 14px rgba(124,58,237,0.3)" };
      inner = el.text || "Button";
      break;
    case "button-outline":
      style = { ...style, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: el.fontWeight || "600", fontSize: el.fontSize ?? 15, borderRadius: el.borderRadius ?? 12, background: "transparent", border: `2px solid ${el.color || "#7c3aed"}`, color: el.color || "#7c3aed" };
      inner = el.text || "Button";
      break;
    case "card":
      style = { ...style, boxShadow: el.shadow || "0 2px 16px rgba(0,0,0,0.08)", border: `${el.border || "1px solid #f0f0f0"}`, padding: el.padding ?? 16, display: "flex", flexDirection: "column" as const, gap: 6 };
      inner = (
        <div style={{ fontFamily: el.fontFamily || "Inter" }}>
          <div style={{ fontWeight: 700, fontSize: el.fontSize ?? 16, marginBottom: 4, color: el.color || "#111827" }}>{el.text || "Card Title"}</div>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>Supporting text goes here</div>
        </div>
      );
      break;
    case "image":
      style = { ...style, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, borderRadius: el.borderRadius ?? 12 };
      inner = el.imageUrl ? <img src={el.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🖼️";
      break;
    case "textfield":
      style = { ...style, border: el.border || "1.5px solid #d1d5db", borderRadius: el.borderRadius ?? 10, padding: "0 14px", display: "flex", alignItems: "center", fontSize: el.fontSize ?? 14, background: el.bg || "#f9fafb" };
      inner = <span style={{ opacity: 0.5, color: el.color || "#374151" }}>{el.text || "Enter text..."}</span>;
      break;
    case "textarea":
      style = { ...style, border: el.border || "1.5px solid #d1d5db", borderRadius: el.borderRadius ?? 10, padding: "12px 14px", display: "flex", alignItems: "flex-start", fontSize: el.fontSize ?? 14, background: el.bg || "#f9fafb" };
      inner = <span style={{ opacity: 0.5, color: el.color || "#374151" }}>{el.text || "Type your message..."}</span>;
      break;
    case "search-bar":
      style = { ...style, border: "none", borderRadius: el.borderRadius ?? 22, padding: "0 14px 0 40px", display: "flex", alignItems: "center", fontSize: el.fontSize ?? 14, background: el.bg || "#f3f4f6", position: "relative" };
      inner = <><span style={{ position: "absolute", left: 14, fontSize: 16 }}>🔍</span><span style={{ opacity: 0.5, color: el.color || "#6b7280" }}>{el.text || "Search..."}</span></>;
      break;
    case "date-picker":
      style = { ...style, border: el.border || "1.5px solid #d1d5db", borderRadius: el.borderRadius ?? 10, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: el.fontSize ?? 14, background: el.bg || "#ffffff" };
      inner = <><span style={{ opacity: 0.7 }}>{el.text || "Select date"}</span><span>📅</span></>;
      break;
    case "dropdown":
      style = { ...style, border: el.border || "1.5px solid #d1d5db", borderRadius: el.borderRadius ?? 10, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: el.fontSize ?? 14, background: el.bg || "#ffffff" };
      inner = <><span style={{ opacity: 0.7 }}>{el.text || "Select option"}</span><span style={{ fontSize: 12 }}>▾</span></>;
      break;
    case "navbar":
      style = { ...style, borderRadius: 0, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", boxShadow: el.shadow || "0 1px 0 #e5e7eb", background: el.bg || "#ffffff" };
      inner = <>
        <span style={{ fontWeight: 700, fontSize: 22, color: el.color || "#111827" }}>◀</span>
        <span style={{ fontWeight: 700, fontSize: 17, color: el.color || "#111827" }}>{el.text || "Page Title"}</span>
        <span style={{ fontSize: 22, color: el.color || "#111827" }}>⋯</span>
      </>;
      break;
    case "text":
      style = { ...style, display: "flex", alignItems: "center", fontSize: el.fontSize ?? 16, fontWeight: el.fontWeight || "400", color: el.color || "#111827", textAlign: (el.textAlign as any) || "left" };
      inner = el.text || "Text Label";
      break;
    case "heading":
      style = { ...style, display: "flex", alignItems: "center", fontSize: el.fontSize ?? 24, fontWeight: el.fontWeight || "700", color: el.color || "#111827" };
      inner = el.text || "Heading";
      break;
    case "label-comp":
      style = { ...style, display: "flex", alignItems: "center", fontSize: el.fontSize ?? 12, fontWeight: el.fontWeight || "500", color: el.color || "#6b7280", textTransform: "uppercase" as const, letterSpacing: 0.5 };
      inner = el.text || "Label";
      break;
    case "icon":
      style = { ...style, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, borderRadius: (el.borderRadius ?? 0) > 0 ? el.borderRadius : undefined, color: el.color || "#7c3aed" };
      inner = el.iconName || "⭐";
      break;
    case "divider":
      style = { ...style, borderRadius: 1, height: el.h || 1, background: el.bg || "#e5e7eb" };
      break;
    case "avatar":
      style = { ...style, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: el.fontSize ?? 22, background: el.gradient || el.bg || "#7c3aed", color: el.color || "#fff" };
      inner = el.imageUrl ? <img src={el.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : (el.text || "A").charAt(0).toUpperCase();
      break;
    case "badge":
      style = { ...style, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: el.fontSize ?? 12, fontWeight: 700 };
      inner = el.text || "New";
      break;
    case "chip":
      style = { ...style, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: el.fontSize ?? 13, fontWeight: 500, padding: "0 12px" };
      inner = el.text || "Tag";
      break;
    case "switch":
      style = { ...style, borderRadius: 20, display: "flex", alignItems: "center", padding: "0 4px", justifyContent: el.checked ? "flex-end" : "flex-start", background: el.checked ? (el.bg || "#7c3aed") : "#d1d5db" };
      inner = <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />;
      break;
    case "checkbox":
      style = { ...style, display: "flex", alignItems: "center", gap: 10, background: "transparent", borderRadius: 0 };
      inner = <>
        <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${el.color || "#7c3aed"}`, background: el.checked ? (el.color || "#7c3aed") : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {el.checked && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
        </div>
        <span style={{ fontSize: el.fontSize ?? 14, color: el.color || "#111827" }}>{el.text || "Checkbox label"}</span>
      </>;
      break;
    case "radio":
      style = { ...style, display: "flex", alignItems: "center", gap: 10, background: "transparent", borderRadius: 0 };
      inner = <>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${el.color || "#7c3aed"}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {el.checked && <div style={{ width: 10, height: 10, borderRadius: "50%", background: el.color || "#7c3aed" }} />}
        </div>
        <span style={{ fontSize: el.fontSize ?? 14, color: el.color || "#111827" }}>{el.text || "Radio option"}</span>
      </>;
      break;
    case "slider-comp":
      style = { ...style, display: "flex", alignItems: "center", background: "transparent", borderRadius: 0 };
      inner = <div style={{ width: "100%", position: "relative" }}>
        <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, width: "100%", position: "relative" }}>
          <div style={{ height: "100%", background: el.color || "#7c3aed", borderRadius: 2, width: "60%" }} />
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: el.color || "#7c3aed", position: "absolute", top: -8, left: "60%", transform: "translateX(-50%)", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
        </div>
      </div>;
      break;
    case "progress-bar":
      style = { ...style, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" };
      inner = <div style={{ height: "100%", background: el.gradient || el.bg || "#7c3aed", borderRadius: 4, width: "65%", transition: "width 0.3s" }} />;
      break;
    case "rating":
      style = { ...style, display: "flex", alignItems: "center", gap: 4, background: "transparent", borderRadius: 0 };
      inner = <>{"★★★★☆".split("").map((s, i) => <span key={i} style={{ fontSize: el.fontSize ?? 20, color: i < 4 ? (el.color || "#f59e0b") : "#d1d5db" }}>{s}</span>)}</>;
      break;
    case "stat-card":
      style = { ...style, boxShadow: el.shadow || "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", padding: 16, display: "flex", flexDirection: "column" as const, justifyContent: "space-between" };
      inner = <>
        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{el.text || "Total Users"}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: el.color || "#111827" }}>42.3k</div>
        <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>↑ 12.4% vs last month</div>
      </>;
      break;
    case "chart-bar":
      style = { ...style, padding: 12, display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "space-between" };
      inner = <>
        {[60, 80, 45, 95, 70, 55, 88].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: el.gradient || el.bg || el.color || "#7c3aed", borderRadius: "3px 3px 0 0", opacity: i === 3 ? 1 : 0.6 }} />
        ))}
      </>;
      break;
    case "chart-line":
      style = { ...style, padding: 12, position: "relative", overflow: "hidden" };
      inner = <svg width="100%" height="100%" viewBox="0 0 280 80" preserveAspectRatio="none">
        <polyline points="0,60 40,40 80,55 120,20 160,35 200,15 240,30 280,10" fill="none" stroke={el.color || "#10b981"} strokeWidth="2" />
        <polyline points="0,60 40,40 80,55 120,20 160,35 200,15 240,30 280,10 280,80 0,80" fill={`${el.color || "#10b981"}20`} />
      </svg>;
      break;
    case "list-item":
      style = { ...style, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, borderBottom: "1px solid #f0f0f0", borderRadius: 0 };
      inner = <>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0 }}>A</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: el.color || "#111827" }}>{el.text || "List Item"}</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Subtitle text here</div>
        </div>
        <span style={{ color: "#9ca3af", fontSize: 16 }}>›</span>
      </>;
      break;
    case "toast":
      style = { ...style, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" };
      inner = <><span style={{ fontSize: 20 }}>✅</span><span style={{ fontSize: 14, color: el.color || "#fff", fontWeight: 500 }}>{el.text || "Action completed"}</span></>;
      break;
    case "modal":
      style = { ...style, borderRadius: 20, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column" as const, gap: 12 };
      inner = <>
        <div style={{ fontWeight: 700, fontSize: 18, color: el.color || "#111827" }}>{el.text || "Modal Title"}</div>
        <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>This is the modal body content. It can contain any information.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "transparent", color: "#374151", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
          <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Confirm</button>
        </div>
      </>;
      break;
    case "sidebar-nav":
      style = { ...style, padding: 16, display: "flex", flexDirection: "column" as const, gap: 4, borderRight: "1px solid #e5e7eb" };
      inner = <>
        <div style={{ fontSize: 18, fontWeight: 800, color: el.color || "#111827", marginBottom: 16 }}>🗺 Menu</div>
        {["🏠 Home", "🔍 Explore", "📬 Messages", "❤️ Favorites", "👤 Profile", "⚙️ Settings"].map(item => (
          <div key={item} style={{ padding: "10px 12px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: el.color || "#374151", cursor: "pointer", background: item.includes("Home") ? "rgba(124,58,237,0.1)" : "transparent", color: item.includes("Home") ? "#7c3aed" : el.color || "#374151" }}>{item}</div>
        ))}
      </>;
      break;
    case "breadcrumb":
      style = { ...style, display: "flex", alignItems: "center", gap: 6, background: "transparent", borderRadius: 0 };
      inner = <>
        {["Home", "Products", "Details"].map((s, i, arr) => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: el.fontSize ?? 13, color: i === arr.length - 1 ? (el.color || "#111827") : "#9ca3af", fontWeight: i === arr.length - 1 ? 600 : 400 }}>{s}</span>
            {i < arr.length - 1 && <span style={{ color: "#d1d5db", fontSize: 12 }}>›</span>}
          </span>
        ))}
      </>;
      break;
    case "container":
      style = { ...style, borderRadius: el.borderRadius ?? 12, border: el.border || "1px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" };
      inner = <span style={{ fontSize: 12, color: "#9ca3af" }}>Container</span>;
      break;
    case "spacer":
      style = { ...style, background: "transparent", borderRadius: 0, border: "1px dashed rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" };
      inner = <span style={{ fontSize: 10, color: "rgba(124,58,237,0.4)" }}>↕ {el.h}px</span>;
      break;
    case "tab":
      style = { ...style, borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-around", fontSize: 22, borderRadius: 0, background: el.bg || "#ffffff" };
      inner = <>
        {["🏠", "🔍", "➕", "❤️", "👤"].map((icon, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 22, opacity: i === 0 ? 1 : 0.4, filter: i === 0 ? "none" : "grayscale(1)" }}>{icon}</span>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: i === 0 ? "#7c3aed" : "transparent" }} />
          </div>
        ))}
      </>;
      break;
  }

  return (
    <div key={el.id} style={style} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseDown={(e) => {
        if (el.locked) return;
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        const move = (me: MouseEvent) => onDrag(me.clientX - startX, me.clientY - startY);
        const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      }}>
      {inner}
      {selected && (
        <>
          <div style={{ position: "absolute", top: -22, left: 0, background: "#7c3aed", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", zIndex: 10 }}>
            {el.type} · {Math.round(el.w)}×{Math.round(el.h)}
          </div>
          <div style={{ position: "absolute", bottom: -5, right: -5, width: 10, height: 10, background: "#7c3aed", borderRadius: 2, cursor: "se-resize", border: "2px solid #fff" }} />
        </>
      )}
    </div>
  );
}

export default function AppUIDesigner() {
  const [, navigate] = useLocation();
  const [device, setDevice] = useState(DEVICES[0]);
  const [screens, setScreens] = useState<Screen[]>([
    { id: "s1", name: "Home", elements: [], bgColor: "#ffffff", notes: "" },
    { id: "s2", name: "Login", elements: [], bgColor: "#ffffff", notes: "" },
    { id: "s3", name: "Profile", elements: [], bgColor: "#ffffff", notes: "" },
  ]);
  const [activeScreen, setActiveScreen] = useState("s1");
  const [selected, setSelected] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [zoom, setZoom] = useState(0.75);
  const [aiPrompt, setAiPrompt] = useState("");
  const [rightTab, setRightTab] = useState<"components" | "properties" | "layers" | "ai" | "prototype" | "theme">("components");
  const [componentGroup, setComponentGroup] = useState("All");
  const [theme, setTheme] = useState(THEME_PRESETS[0]);
  const [darkMode, setDarkMode] = useState(false);
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [showPrototypeMode, setShowPrototypeMode] = useState(false);
  const [searchComponent, setSearchComponent] = useState("");
  const [history, setHistory] = useState<Screen[][]>([[{ id: "s1", name: "Home", elements: [], bgColor: "#ffffff", notes: "" }, { id: "s2", name: "Login", elements: [], bgColor: "#ffffff", notes: "" }, { id: "s3", name: "Profile", elements: [], bgColor: "#ffffff", notes: "" }]]);
  const [histIdx, setHistIdx] = useState(0);
  const [exportFormat, setExportFormat] = useState<"PNG" | "SVG" | "Flutter" | "React Native" | "SwiftUI">("PNG");
  const [copiedEl, setCopiedEl] = useState<CanvasElement | null>(null);
  const [renameScreen, setRenameScreen] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentScreen = screens.find(s => s.id === activeScreen)!;
  const selectedEl = currentScreen?.elements.find(e => e.id === selected);

  const pushHistory = useCallback((newScreens: Screen[]) => {
    setHistory(prev => [...prev.slice(0, histIdx + 1), newScreens].slice(-30));
    setHistIdx(i => Math.min(i + 1, 29));
  }, [histIdx]);

  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    setScreens(history[histIdx - 1]);
    setHistIdx(i => i - 1);
  }, [history, histIdx]);

  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return;
    setScreens(history[histIdx + 1]);
    setHistIdx(i => i + 1);
  }, [history, histIdx]);

  const addElement = useCallback((comp: typeof COMPONENT_LIBRARY[0]) => {
    const newEl: CanvasElement = {
      id: `el_${Date.now()}`,
      type: comp.type,
      x: Math.round(device.w / 2 - comp.defaultW / 2),
      y: Math.round(device.h / 2 - comp.defaultH / 2),
      w: comp.defaultW,
      h: comp.defaultH,
      text: comp.label,
      color: comp.color,
      bg: comp.bg,
      borderRadius: 10,
      opacity: 100,
      rotation: 0,
      visible: true,
      locked: false,
      fontFamily: theme.name === "Minimal" ? "Inter" : "Inter",
    };
    const newScreens = screens.map(s => s.id === activeScreen ? { ...s, elements: [...s.elements, newEl] } : s);
    setScreens(newScreens);
    setSelected(newEl.id);
    pushHistory(newScreens);
  }, [activeScreen, device, screens, theme, pushHistory]);

  const updateSelected = useCallback((patch: Partial<CanvasElement>) => {
    if (!selected) return;
    setScreens(prev => prev.map(s => s.id === activeScreen
      ? { ...s, elements: s.elements.map(e => e.id === selected ? { ...e, ...patch } : e) }
      : s));
  }, [selected, activeScreen]);

  const commitSelected = useCallback((patch: Partial<CanvasElement>) => {
    if (!selected) return;
    const newScreens = screens.map(s => s.id === activeScreen
      ? { ...s, elements: s.elements.map(e => e.id === selected ? { ...e, ...patch } : e) }
      : s);
    setScreens(newScreens);
    pushHistory(newScreens);
  }, [selected, activeScreen, screens, pushHistory]);

  const dragElement = useCallback((id: string, dx: number, dy: number) => {
    setScreens(prev => {
      const el = prev.find(s => s.id === activeScreen)?.elements.find(e => e.id === id);
      if (!el || el.locked) return prev;
      return prev.map(s => s.id === activeScreen
        ? { ...s, elements: s.elements.map(e => e.id === id ? { ...e, x: Math.round(el.x + dx / zoom), y: Math.round(el.y + dy / zoom) } : e) }
        : s);
    });
  }, [activeScreen, zoom]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    const newScreens = screens.map(s => s.id === activeScreen ? { ...s, elements: s.elements.filter(e => e.id !== selected) } : s);
    setScreens(newScreens);
    setSelected(null);
    pushHistory(newScreens);
  }, [selected, activeScreen, screens, pushHistory]);

  const duplicateEl = useCallback(() => {
    if (!selectedEl) return;
    const newEl = { ...selectedEl, id: `el_${Date.now()}`, x: selectedEl.x + 20, y: selectedEl.y + 20 };
    const newScreens = screens.map(s => s.id === activeScreen ? { ...s, elements: [...s.elements, newEl] } : s);
    setScreens(newScreens);
    setSelected(newEl.id);
    pushHistory(newScreens);
  }, [selectedEl, screens, activeScreen, pushHistory]);

  const copyEl = () => { if (selectedEl) setCopiedEl({ ...selectedEl }); };
  const pasteEl = () => {
    if (!copiedEl) return;
    const newEl = { ...copiedEl, id: `el_${Date.now()}`, x: copiedEl.x + 30, y: copiedEl.y + 30 };
    const newScreens = screens.map(s => s.id === activeScreen ? { ...s, elements: [...s.elements, newEl] } : s);
    setScreens(newScreens);
    setSelected(newEl.id);
    pushHistory(newScreens);
  };

  const addScreen = (name?: string) => {
    const id = `s${Date.now()}`;
    const newScreen: Screen = { id, name: name || `Screen ${screens.length + 1}`, elements: [], bgColor: theme.bg, notes: "" };
    const newScreens = [...screens, newScreen];
    setScreens(newScreens);
    setActiveScreen(id);
    pushHistory(newScreens);
  };

  const deleteScreen = (id: string) => {
    if (screens.length <= 1) return;
    const newScreens = screens.filter(s => s.id !== id);
    setScreens(newScreens);
    if (activeScreen === id) setActiveScreen(newScreens[0].id);
    pushHistory(newScreens);
  };

  const duplicateScreen = (id: string) => {
    const src = screens.find(s => s.id === id);
    if (!src) return;
    const newId = `s${Date.now()}`;
    const newScreen: Screen = { ...src, id: newId, name: `${src.name} Copy`, elements: src.elements.map(e => ({ ...e, id: `el_${Date.now()}_${e.id}` })) };
    const newScreens = [...screens, newScreen];
    setScreens(newScreens);
    setActiveScreen(newId);
    pushHistory(newScreens);
  };

  const moveLayerOrder = (id: string, dir: -1 | 1) => {
    setScreens(prev => prev.map(s => {
      if (s.id !== activeScreen) return s;
      const elements = [...s.elements];
      const i = elements.findIndex(e => e.id === id);
      if (i + dir < 0 || i + dir >= elements.length) return s;
      [elements[i], elements[i + dir]] = [elements[i + dir], elements[i]];
      return { ...s, elements };
    }));
  };

  const applyTheme = (t: typeof THEME_PRESETS[0]) => {
    setTheme(t);
    const bg = darkMode ? "#1c1c1e" : t.bg;
    const newScreens = screens.map(s => ({ ...s, bgColor: bg }));
    setScreens(newScreens);
  };

  const generateAI = (type: string) => {
    const d = device;
    const accent = theme.accent || "#7c3aed";
    const templates: Record<string, CanvasElement[]> = {
      home: [
        { id: `g1_${Date.now()}`, type: "navbar", x: 0, y: 0, w: d.w, h: 56, text: "App", color: "#111", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `g2_${Date.now()}`, type: "image", x: 16, y: 72, w: d.w - 32, h: 180, color: "#666", bg: "#e5e7eb", borderRadius: 16, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `g3_${Date.now()}`, type: "heading", x: 16, y: 268, w: d.w - 32, h: 40, text: "Welcome Back! 👋", color: "#111827", bg: "transparent", fontSize: 24, fontWeight: "800", opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `g4_${Date.now()}`, type: "label-comp", x: 16, y: 316, w: d.w - 32, h: 20, text: "Recommended for you", color: "#6b7280", bg: "transparent", opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `g5_${Date.now()}`, type: "card", x: 16, y: 348, w: d.w - 32, h: 100, text: "Featured Item", color: "#111", bg: "#fff", borderRadius: 16, opacity: 100, rotation: 0, visible: true, locked: false, shadow: "0 2px 16px rgba(0,0,0,0.08)" },
        { id: `g6_${Date.now()}`, type: "button", x: 16, y: 464, w: d.w - 32, h: 52, text: "Explore More →", color: "#fff", bg: accent, borderRadius: 14, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `g7_${Date.now()}`, type: "tab", x: 0, y: d.h - 72, w: d.w, h: 72, color: "#374151", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
      ],
      login: [
        { id: `l1_${Date.now()}`, type: "heading", x: 24, y: 80, w: d.w - 48, h: 56, text: "Sign In 🔐", color: "#111827", bg: "transparent", fontSize: 32, fontWeight: "800", opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `l2_${Date.now()}`, type: "label-comp", x: 24, y: 144, w: d.w - 48, h: 20, text: "Email", color: "#374151", bg: "transparent", opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `l3_${Date.now()}`, type: "textfield", x: 24, y: 170, w: d.w - 48, h: 52, text: "Enter your email", color: "#374151", bg: "#f9fafb", borderRadius: 12, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `l4_${Date.now()}`, type: "label-comp", x: 24, y: 238, w: d.w - 48, h: 20, text: "Password", color: "#374151", bg: "transparent", opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `l5_${Date.now()}`, type: "textfield", x: 24, y: 264, w: d.w - 48, h: 52, text: "Enter your password", color: "#374151", bg: "#f9fafb", borderRadius: 12, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `l6_${Date.now()}`, type: "button", x: 24, y: 340, w: d.w - 48, h: 56, text: "Sign In", color: "#fff", bg: accent, borderRadius: 14, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `l7_${Date.now()}`, type: "text", x: 24, y: 412, w: d.w - 48, h: 32, text: "Forgot Password?", color: accent, bg: "transparent", fontSize: 15, textAlign: "center", opacity: 100, rotation: 0, visible: true, locked: false },
      ],
      dashboard: [
        { id: `d1_${Date.now()}`, type: "navbar", x: 0, y: 0, w: d.w, h: 56, text: "Dashboard", color: "#111", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `d2_${Date.now()}`, type: "stat-card", x: 16, y: 72, w: (d.w - 40) / 2, h: 90, text: "Revenue", color: "#111", bg: "#fff", borderRadius: 16, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `d3_${Date.now()}`, type: "stat-card", x: 24 + (d.w - 40) / 2, y: 72, w: (d.w - 40) / 2, h: 90, text: "Orders", color: "#111", bg: "#fff", borderRadius: 16, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `d4_${Date.now()}`, type: "chart-bar", x: 16, y: 178, w: d.w - 32, h: 140, color: accent, bg: "#f9fafb", borderRadius: 16, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `d5_${Date.now()}`, type: "tab", x: 0, y: d.h - 72, w: d.w, h: 72, color: "#374151", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
      ],
      profile: [
        { id: `p1_${Date.now()}`, type: "navbar", x: 0, y: 0, w: d.w, h: 56, text: "Profile", color: "#111", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `p2_${Date.now()}`, type: "avatar", x: d.w / 2 - 50, y: 80, w: 100, h: 100, text: "J", color: "#fff", bg: accent, borderRadius: 50, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `p3_${Date.now()}`, type: "heading", x: 24, y: 200, w: d.w - 48, h: 40, text: "John Doe", color: "#111827", bg: "transparent", fontSize: 24, fontWeight: "700", textAlign: "center", opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `p4_${Date.now()}`, type: "text", x: 24, y: 248, w: d.w - 48, h: 28, text: "UX Designer @ Acme Corp", color: "#6b7280", bg: "transparent", fontSize: 15, textAlign: "center", opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `p5_${Date.now()}`, type: "list-item", x: 0, y: 310, w: d.w, h: 60, text: "My Orders", color: "#111827", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `p6_${Date.now()}`, type: "list-item", x: 0, y: 370, w: d.w, h: 60, text: "Settings", color: "#111827", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `p7_${Date.now()}`, type: "list-item", x: 0, y: 430, w: d.w, h: 60, text: "Help & Support", color: "#111827", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
        { id: `p8_${Date.now()}`, type: "tab", x: 0, y: d.h - 72, w: d.w, h: 72, color: "#374151", bg: "#fff", borderRadius: 0, opacity: 100, rotation: 0, visible: true, locked: false },
      ],
    };
    const key = type || "home";
    const generated = (templates[key] || templates.home).map(e => ({ ...e, id: `ai_${Date.now()}_${e.id}` }));
    const newScreens = screens.map(s => s.id === activeScreen ? { ...s, elements: generated } : s);
    setScreens(newScreens);
    pushHistory(newScreens);
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z") { e.preventDefault(); undo(); }
      else if (ctrl && e.key === "y") { e.preventDefault(); redo(); }
      else if (ctrl && e.key === "c") { e.preventDefault(); copyEl(); }
      else if (ctrl && e.key === "v") { e.preventDefault(); pasteEl(); }
      else if (ctrl && e.key === "d") { e.preventDefault(); duplicateEl(); }
      else if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      else if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [undo, redo, duplicateEl, deleteSelected, selectedEl]);

  const filteredComponents = COMPONENT_LIBRARY.filter(c =>
    (componentGroup === "All" || c.group === componentGroup) &&
    (!searchComponent || c.label.toLowerCase().includes(searchComponent.toLowerCase()) || c.type.toLowerCase().includes(searchComponent.toLowerCase()))
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f0f1a", color: "#e5e7eb", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar */}
      <div style={{ height: 52, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 20, cursor: "pointer" }}>✦</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>App UI Designer</span>

        {/* Device Selector */}
        <div style={{ marginLeft: 8, display: "flex", gap: 3, overflowX: "auto", maxWidth: 320 }}>
          {DEVICES.slice(0, 5).map(d => (
            <button key={d.label} onClick={() => setDevice(d)}
              style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, cursor: "pointer", border: "1px solid", flexShrink: 0,
                borderColor: device.label === d.label ? "#7c3aed" : "rgba(255,255,255,0.1)",
                background: device.label === d.label ? "rgba(124,58,237,0.2)" : "transparent",
                color: device.label === d.label ? "#a78bfa" : "#9ca3af" }}>
              {d.brand === "apple" ? "🍎" : d.brand === "android" ? "🤖" : "📱"} {d.label}
            </button>
          ))}
        </div>

        {/* View controls */}
        <div style={{ display: "flex", gap: 3 }}>
          <button onClick={() => setShowGrid(g => !g)} title="Grid" style={{ padding: "4px 7px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: showGrid ? "rgba(124,58,237,0.2)" : "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>Grid</button>
          <button onClick={() => setShowSafeArea(s => !s)} title="Safe Area" style={{ padding: "4px 7px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: showSafeArea ? "rgba(124,58,237,0.2)" : "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>Safe</button>
          <button onClick={() => setShowDeviceFrame(f => !f)} title="Device Frame" style={{ padding: "4px 7px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: showDeviceFrame ? "rgba(124,58,237,0.2)" : "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>Frame</button>
          <button onClick={() => setDarkMode(d => !d)} title="Dark Mode Preview" style={{ padding: "4px 7px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: darkMode ? "rgba(124,58,237,0.2)" : "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>🌙</button>
        </div>

        {/* Undo/Redo */}
        <button onClick={undo} disabled={histIdx <= 0} style={{ padding: "4px 8px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.05)", color: histIdx <= 0 ? "#3b3b4f" : "#9ca3af", cursor: histIdx <= 0 ? "not-allowed" : "pointer", fontSize: 13 }}>↩</button>
        <button onClick={redo} disabled={histIdx >= history.length - 1} style={{ padding: "4px 8px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.05)", color: histIdx >= history.length - 1 ? "#3b3b4f" : "#9ca3af", cursor: histIdx >= history.length - 1 ? "not-allowed" : "pointer", fontSize: 13 }}>↪</button>

        {/* Zoom */}
        <input type="range" min={30} max={150} value={zoom * 100} onChange={e => setZoom(Number(e.target.value) / 100)} style={{ width: 60 }} />
        <span style={{ fontSize: 11, color: "#6b7280", minWidth: 30 }}>{Math.round(zoom * 100)}%</span>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {selected && (
            <>
              <button onClick={copyEl} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>⎘ Copy</button>
              <button onClick={duplicateEl} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>⧉ Dup</button>
              <button onClick={deleteSelected} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 11 }}>🗑</button>
            </>
          )}
          <button onClick={() => setShowPrototypeMode(p => !p)} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${showPrototypeMode ? "#7c3aed" : "rgba(255,255,255,0.15)"}`, background: showPrototypeMode ? "#7c3aed" : "transparent", color: showPrototypeMode ? "#fff" : "#a78bfa", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>▶ Preview</button>
          <button onClick={() => alert(`Exporting as ${exportFormat}...\nIn production this generates actual code.`)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>⬇ Export</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left - Screens */}
        <div style={{ width: 168, background: "#13131f", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Screens ({screens.length})</span>
            <button onClick={() => addScreen()} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#a78bfa", width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {screens.map(s => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                {renameScreen === s.id ? (
                  <input value={renameValue} autoFocus onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => { setScreens(prev => prev.map(sc => sc.id === s.id ? { ...sc, name: renameValue || sc.name } : sc)); setRenameScreen(null); }}
                    onKeyDown={e => { if (e.key === "Enter") { setScreens(prev => prev.map(sc => sc.id === s.id ? { ...sc, name: renameValue || sc.name } : sc)); setRenameScreen(null); } }}
                    style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.1)", border: "1px solid #7c3aed", borderRadius: 4, padding: "3px 6px", color: "#fff", fontSize: 11 }} />
                ) : (
                  <div onClick={() => { setActiveScreen(s.id); setSelected(null); }} style={{ cursor: "pointer" }}>
                    <div style={{ borderRadius: 8, border: `2px solid ${s.id === activeScreen ? "#7c3aed" : "rgba(255,255,255,0.08)"}`, background: s.id === activeScreen ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)", overflow: "hidden" }}>
                      <div style={{ width: "100%", paddingTop: "177.78%", position: "relative", background: darkMode ? "#1c1c1e" : s.bgColor || "#ffffff" }}>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 10, flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 16 }}>{s.elements.length > 0 ? "📱" : "+"}</span>
                          <span>{s.elements.length} layers</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <span style={{ textAlign: "center", fontSize: 10, color: s.id === activeScreen ? "#a78bfa" : "#6b7280", flex: 1 }} onDoubleClick={() => { setRenameScreen(s.id); setRenameValue(s.name); }}>{s.name}</span>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button onClick={(e) => { e.stopPropagation(); duplicateScreen(s.id); }} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 10, padding: 0 }} title="Duplicate">⧉</button>
                        {screens.length > 1 && <button onClick={(e) => { e.stopPropagation(); deleteScreen(s.id); }} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 10, padding: 0 }} title="Delete">✕</button>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Screen templates */}
            <div style={{ marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
              <div style={{ fontSize: 9, color: "#4b5563", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Quick Add</div>
              {["Home", "Login", "Dashboard", "Profile", "Settings", "Onboarding", "Feed", "Checkout"].map(name => (
                <button key={name} onClick={() => addScreen(name)} style={{ display: "block", width: "100%", marginBottom: 3, padding: "5px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 10, textAlign: "left" }}>
                  + {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", background: "#0d0d1a", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 40 }}
          onClick={() => setSelected(null)}>
          <div style={{ position: "relative" }}>
            {/* Device name label */}
            <div style={{ textAlign: "center", fontSize: 11, color: "#4b5563", marginBottom: 10 }}>
              {device.brand === "apple" ? "🍎" : "🤖"} {device.label} · {device.w}×{device.h}
            </div>
            <div style={{
              width: device.w * zoom,
              height: device.h * zoom,
              background: darkMode ? "#1c1c1e" : (currentScreen?.bgColor || "#ffffff"),
              borderRadius: showDeviceFrame ? (device.brand === "tablet" ? 24 * zoom : 44 * zoom) : 8,
              overflow: "hidden",
              boxShadow: showDeviceFrame ? "0 20px 80px rgba(0,0,0,0.8), 0 0 0 10px #1a1a2e, 0 0 0 11px rgba(255,255,255,0.05)" : "0 8px 40px rgba(0,0,0,0.6)",
              position: "relative", flexShrink: 0,
            }}>
              {/* Device status bar */}
              {showDeviceFrame && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44 * zoom, background: darkMode ? "#1c1c1e" : (currentScreen?.bgColor || "#fff"), zIndex: 10, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6 }}>
                  {device.brand === "apple" && <div style={{ width: 120 * zoom, height: 12 * zoom, background: "#111827", borderRadius: 20 }} />}
                  {device.brand === "android" && <div style={{ width: 10 * zoom, height: 10 * zoom, background: "#111827", borderRadius: "50%" }} />}
                </div>
              )}
              {/* Safe area indicator */}
              {showSafeArea && (
                <div style={{ position: "absolute", top: 44 * zoom, left: 0, right: 0, bottom: 34 * zoom, border: "1px dashed rgba(0,120,255,0.15)", pointerEvents: "none", zIndex: 5 }} />
              )}
              {/* Canvas area */}
              <div ref={canvasRef} style={{
                position: "absolute",
                top: showDeviceFrame ? 44 * zoom : 0,
                left: 0, right: 0,
                bottom: showDeviceFrame ? 34 * zoom : 0,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                width: device.w,
                height: device.h - (showDeviceFrame ? 78 : 0),
                overflow: "hidden",
                fontFamily: theme.name.includes("Sans") || theme.name.includes("Minimal") ? "Inter" : "Inter",
              }}>
                {showGrid && (
                  <svg style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} width={device.w} height={device.h}>
                    <defs>
                      <pattern id="appgrid" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#7c3aed" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#appgrid)" />
                  </svg>
                )}
                {currentScreen?.elements.map(el =>
                  renderElement(el, el.id === selected, () => setSelected(el.id),
                    (dx, dy) => dragElement(el.id, dx, dy))
                )}
                {showPrototypeMode && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(124,58,237,0.03)", pointerEvents: "none", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 12, padding: "8px 16px", color: "#fff", fontSize: 13 }}>Preview Mode</div>
                  </div>
                )}
              </div>
              {/* Home indicator */}
              {showDeviceFrame && device.brand === "apple" && (
                <div style={{ position: "absolute", bottom: 8 * zoom, left: "50%", transform: "translateX(-50%)", width: 120 * zoom, height: 5 * zoom, background: "#374151", borderRadius: 10 }} />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 288, background: "#13131f", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
            {(["components", "properties", "layers", "ai", "theme"] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                style={{ flex: "0 0 auto", padding: "9px 8px", fontSize: 10, cursor: "pointer", border: "none", background: "none",
                  color: rightTab === tab ? "#a78bfa" : "#6b7280", fontWeight: rightTab === tab ? 700 : 400, textTransform: "capitalize",
                  borderBottom: rightTab === tab ? "2px solid #7c3aed" : "2px solid transparent", whiteSpace: "nowrap" }}>
                {tab === "components" ? "🧩 Comp" : tab === "properties" ? "⚙️ Props" : tab === "layers" ? "🗂️ Layers" : tab === "ai" ? "🤖 AI" : "🎨 Theme"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {rightTab === "components" && (
              <div style={{ padding: 10 }}>
                <input value={searchComponent} onChange={e => setSearchComponent(e.target.value)} placeholder="Search components..."
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 10px", color: "#e5e7eb", fontSize: 12, marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 10 }}>
                  {["All", ...COMPONENT_GROUPS].map(g => (
                    <button key={g} onClick={() => setComponentGroup(g)}
                      style={{ padding: "3px 8px", borderRadius: 12, border: "1px solid", borderColor: componentGroup === g ? "#7c3aed" : "rgba(255,255,255,0.1)", background: componentGroup === g ? "rgba(124,58,237,0.2)" : "transparent", color: componentGroup === g ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 10 }}>
                      {g}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {filteredComponents.map(comp => (
                    <button key={comp.type} onClick={() => addElement(comp)}
                      style={{ padding: "10px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                      <span style={{ fontSize: 18 }}>{comp.icon}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af", textAlign: "center" }}>{comp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rightTab === "properties" && (
              <div style={{ padding: 12 }}>
                {selectedEl ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase" }}>{selectedEl.type}</div>

                    {/* Position & Size */}
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Position & Size</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[{ l: "X", k: "x" }, { l: "Y", k: "y" }, { l: "W", k: "w" }, { l: "H", k: "h" }].map(({ l, k }) => (
                        <div key={k}>
                          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>{l}</div>
                          <input type="number" value={(selectedEl as any)[k] ?? 0}
                            onChange={e => updateSelected({ [k]: Number(e.target.value) } as Partial<CanvasElement>)}
                            onBlur={e => commitSelected({ [k]: Number(e.target.value) } as Partial<CanvasElement>)}
                            style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "4px 8px", color: "#e5e7eb", fontSize: 13 }} />
                        </div>
                      ))}
                    </div>

                    {/* Transform */}
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Transform</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#6b7280", width: 60 }}>Opacity</span>
                      <input type="range" min={0} max={100} value={selectedEl.opacity ?? 100} onChange={e => updateSelected({ opacity: Number(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 32 }}>{selectedEl.opacity ?? 100}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#6b7280", width: 60 }}>Rotation</span>
                      <input type="range" min={-180} max={180} value={selectedEl.rotation ?? 0} onChange={e => updateSelected({ rotation: Number(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 32 }}>{selectedEl.rotation ?? 0}°</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#6b7280", width: 60 }}>Radius</span>
                      <input type="range" min={0} max={64} value={selectedEl.borderRadius ?? 0} onChange={e => updateSelected({ borderRadius: Number(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 24 }}>{selectedEl.borderRadius ?? 0}</span>
                    </div>

                    {/* Content */}
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Content</div>
                    <div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Text</div>
                      <input value={selectedEl.text ?? ""} onChange={e => updateSelected({ text: e.target.value })}
                        style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }} />
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Font Size</div>
                        <input type="number" value={selectedEl.fontSize ?? 16} onChange={e => updateSelected({ fontSize: Number(e.target.value) })}
                          style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Font Weight</div>
                        <select value={selectedEl.fontWeight || "400"} onChange={e => updateSelected({ fontWeight: e.target.value })}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }}>
                          {["300", "400", "500", "600", "700", "800", "900"].map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Font Family</div>
                      <select value={selectedEl.fontFamily || "Inter"} onChange={e => updateSelected({ fontFamily: e.target.value })}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }}>
                        {FONT_LIST.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Colors */}
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Colors</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Text Color</div>
                        <input type="color" value={selectedEl.color ?? "#000000"} onChange={e => updateSelected({ color: e.target.value })}
                          style={{ width: "100%", height: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Background</div>
                        <input type="color" value={selectedEl.bg ?? "#ffffff"} onChange={e => updateSelected({ bg: e.target.value })}
                          style={{ width: "100%", height: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                      </div>
                    </div>

                    {/* Shadow */}
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Shadow</div>
                    <select value={selectedEl.shadow || "none"} onChange={e => updateSelected({ shadow: e.target.value === "none" ? undefined : e.target.value })}
                      style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 12 }}>
                      <option value="none">No Shadow</option>
                      <option value="0 1px 3px rgba(0,0,0,0.1)">Small</option>
                      <option value="0 4px 12px rgba(0,0,0,0.12)">Medium</option>
                      <option value="0 8px 30px rgba(0,0,0,0.18)">Large</option>
                      <option value="0 20px 60px rgba(0,0,0,0.25)">Extra Large</option>
                      <option value="0 4px 14px rgba(124,58,237,0.3)">Purple Glow</option>
                    </select>

                    {/* Toggle / Checkbox state */}
                    {(selectedEl.type === "switch" || selectedEl.type === "checkbox" || selectedEl.type === "radio") && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>Active State</span>
                        <input type="checkbox" checked={selectedEl.checked || false} onChange={e => updateSelected({ checked: e.target.checked })} style={{ cursor: "pointer" }} />
                      </div>
                    )}

                    {/* Gradient */}
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Gradient Background</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {[
                        ["none", "None"],
                        ["linear-gradient(135deg,#7c3aed,#ec4899)", "Purple-Pink"],
                        ["linear-gradient(135deg,#0ea5e9,#06b6d4)", "Ocean"],
                        ["linear-gradient(135deg,#f97316,#ef4444)", "Sunset"],
                        ["linear-gradient(135deg,#10b981,#06b6d4)", "Emerald"],
                        ["linear-gradient(135deg,#f59e0b,#ef4444)", "Fire"],
                      ].map(([val, label]) => (
                        <button key={val} onClick={() => updateSelected({ gradient: val === "none" ? undefined : val })}
                          style={{ flex: 1, minWidth: 48, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: val === "none" ? "rgba(255,255,255,0.05)" : val, color: val === "none" ? "#6b7280" : "transparent", fontSize: 9 }}>
                          {val === "none" ? "None" : ""}
                        </button>
                      ))}
                    </div>

                    {/* Layer controls */}
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      <button onClick={() => moveLayerOrder(selected!, -1)} style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>↑ Forward</button>
                      <button onClick={() => moveLayerOrder(selected!, 1)} style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>↓ Backward</button>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => updateSelected({ locked: !selectedEl.locked })}
                        style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: selectedEl.locked ? "rgba(124,58,237,0.2)" : "transparent", color: selectedEl.locked ? "#a78bfa" : "#9ca3af", cursor: "pointer", fontSize: 11 }}>
                        {selectedEl.locked ? "🔒 Locked" : "🔓 Lock"}
                      </button>
                      <button onClick={() => updateSelected({ visible: !selectedEl.visible })}
                        style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>
                        {selectedEl.visible === false ? "👁 Show" : "👁 Hide"}
                      </button>
                    </div>
                    <button onClick={deleteSelected} style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 12 }}>🗑 Delete Element</button>
                  </div>
                ) : (
                  <div style={{ padding: 24, textAlign: "center", color: "#4b5563", fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                    Select an element to edit properties
                  </div>
                )}
              </div>
            )}

            {rightTab === "layers" && (
              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Layers ({currentScreen?.elements.length})</div>
                  <button onClick={() => { const newScreens = screens.map(s => s.id === activeScreen ? { ...s, elements: [] } : s); setScreens(newScreens); setSelected(null); }} style={{ fontSize: 10, color: "#f87171", background: "none", border: "none", cursor: "pointer" }}>Clear All</button>
                </div>
                {currentScreen?.elements.length === 0 && (
                  <div style={{ textAlign: "center", color: "#4b5563", fontSize: 13, padding: 24 }}>No layers yet.</div>
                )}
                {[...currentScreen?.elements || []].reverse().map((el, i) => (
                  <div key={el.id} onClick={() => setSelected(el.id)}
                    style={{ padding: "6px 8px", borderRadius: 6, marginBottom: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      background: el.id === selected ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${el.id === selected ? "#7c3aed" : "rgba(255,255,255,0.06)"}`,
                      opacity: el.visible === false ? 0.4 : 1 }}>
                    <span style={{ fontSize: 14 }}>{COMPONENT_LIBRARY.find(c => c.type === el.type)?.icon ?? "▪"}</span>
                    <span style={{ fontSize: 11, color: "#d1d5db", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{el.text || el.type}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateSelected({ visible: el.visible === false ? true : false }); setSelected(el.id); }}
                      style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 11, padding: 0 }}>👁</button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayerOrder(el.id, -1); }}
                      style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 10, padding: 0 }}>↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayerOrder(el.id, 1); }}
                      style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 10, padding: 0 }}>↓</button>
                  </div>
                ))}
                {/* Notes */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Screen Notes</div>
                  <textarea value={currentScreen?.notes || ""} onChange={e => setScreens(prev => prev.map(s => s.id === activeScreen ? { ...s, notes: e.target.value } : s))}
                    placeholder="Add notes or comments for this screen..."
                    style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", color: "#e5e7eb", fontSize: 12, resize: "vertical", minHeight: 60 }} />
                </div>
              </div>
            )}

            {rightTab === "ai" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>🤖 AI Screen Generator</div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Generate Screen Layout</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      ["home", "🏠 Home Screen"],
                      ["login", "🔐 Login Screen"],
                      ["dashboard", "📊 Dashboard"],
                      ["profile", "👤 Profile Page"],
                    ].map(([type, label]) => (
                      <button key={type} onClick={() => { generateAI(type); }}
                        style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#d1d5db", cursor: "pointer", fontSize: 12, textAlign: "left", fontWeight: 500 }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Custom Prompt</div>
                  <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder='Describe your screen...' rows={3}
                    style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 10px", color: "#e5e7eb", fontSize: 12, resize: "none", marginBottom: 8 }} />
                  <button onClick={() => generateAI("home")} style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                    ✨ Generate
                  </button>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Smart Components</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {["Add full login form", "Add nav + tab bar", "Add stat cards row", "Add feed list items", "Add settings list", "Add onboarding slide"].map(prompt => (
                      <button key={prompt} onClick={() => {
                        if (prompt.includes("login form")) {
                          ["textfield", "textfield", "button"].forEach((t, i) => {
                            const comp = COMPONENT_LIBRARY.find(c => c.type === t)!;
                            setTimeout(() => addElement(comp), i * 50);
                          });
                        } else if (prompt.includes("nav")) {
                          addElement(COMPONENT_LIBRARY.find(c => c.type === "navbar")!);
                          addElement(COMPONENT_LIBRARY.find(c => c.type === "tab")!);
                        } else if (prompt.includes("stat")) {
                          [0, 1, 2].forEach(i => setTimeout(() => addElement(COMPONENT_LIBRARY.find(c => c.type === "stat-card")!), i * 50));
                        }
                      }}
                        style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 11, textAlign: "left" }}>
                        + {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Export Code</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                    {(["PNG", "SVG", "Flutter", "React Native", "SwiftUI"] as const).map(f => (
                      <button key={f} onClick={() => setExportFormat(f)}
                        style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid", borderColor: exportFormat === f ? "#7c3aed" : "rgba(255,255,255,0.1)", background: exportFormat === f ? "rgba(124,58,237,0.2)" : "transparent", color: exportFormat === f ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 10 }}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => alert(`Exporting ${screens.length} screen(s) as ${exportFormat}.\n\nThis would generate production-ready code targeting ${device.label}.`)}
                    style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "none", background: "rgba(124,58,237,0.3)", color: "#a78bfa", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    Export {exportFormat} →
                  </button>
                </div>
              </div>
            )}

            {rightTab === "theme" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>🎨 Design System</div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Theme Presets</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {THEME_PRESETS.map(t => (
                      <button key={t.name} onClick={() => applyTheme(t)}
                        style={{ padding: "10px 8px", borderRadius: 8, border: `2px solid ${theme.name === t.name ? "#7c3aed" : "rgba(255,255,255,0.07)"}`, background: t.bg, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                        <span style={{ width: "100%", height: 4, borderRadius: 2, background: t.accent }} />
                        <span style={{ fontSize: 10, color: t.text, fontWeight: 600 }}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Color System</div>
                  {[
                    { label: "Primary", key: "bg", value: theme.bg },
                    { label: "Accent", key: "accent", value: theme.accent },
                    { label: "Text", key: "text", value: theme.text },
                    { label: "Secondary", key: "secondary", value: theme.secondary },
                  ].map(({ label, key, value }) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ flex: 1, fontSize: 12, color: "#6b7280" }}>{label}</span>
                      <input type="color" value={value} onChange={e => setTheme(prev => ({ ...prev, [key]: e.target.value }))}
                        style={{ width: 36, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                      <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace" }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Typography</div>
                  <select defaultValue="Inter" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "6px 8px", color: "#e5e7eb", fontSize: 12, marginBottom: 8 }}>
                    {FONT_LIST.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Xs", "Sm", "Md", "Lg", "Xl", "2Xl"].map((s, i) => (
                      <div key={s} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: [10, 12, 14, 16, 20, 24][i], color: "#e5e7eb", fontWeight: 600 }}>Aa</div>
                        <div style={{ fontSize: 8, color: "#4b5563" }}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Spacing Scale</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
                    {[4, 8, 12, 16, 24, 32, 48].map(s => (
                      <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 8, background: "#7c3aed", borderRadius: 2, height: s / 2 }} />
                        <span style={{ fontSize: 9, color: "#4b5563" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Border Radius</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {[0, 4, 8, 12, 16, 9999].map(r => (
                      <div key={r} style={{ width: 28, height: 28, borderRadius: r, background: "#7c3aed", opacity: theme.radius === r ? 1 : 0.4, cursor: "pointer" }} onClick={() => setTheme(prev => ({ ...prev, radius: r }))} />
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Screen Settings</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>Screen BG</span>
                    <input type="color" value={currentScreen?.bgColor || "#ffffff"} onChange={e => setScreens(prev => prev.map(s => s.id === activeScreen ? { ...s, bgColor: e.target.value } : s))}
                      style={{ width: 36, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Dark Mode Preview</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
