import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const introRef = useRef<HTMLDivElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  function launchEditor() {
    navigate("/editor");
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try to play the video
    video.play().catch(() => setVideoError(true));

    function handleEnded() {
      setIntroDone(true);
      setTimeout(() => {
        if (introRef.current) {
          introRef.current.style.opacity = "0";
          introRef.current.style.pointerEvents = "none";
        }
        if (siteRef.current) siteRef.current.style.opacity = "1";
        setTimeout(() => {
          if (introRef.current) introRef.current.style.display = "none";
        }, 1000);
      }, 300);
    }

    video.addEventListener("ended", handleEnded);

    // If video fails to load, fallback after 5s
    const fallback = setTimeout(() => {
      setVideoError(true);
      handleEnded();
    }, 8000);

    return () => {
      video.removeEventListener("ended", handleEnded);
      clearTimeout(fallback);
    };
  }, []);

  // If video errors out, skip intro
  useEffect(() => {
    if (videoError && !introDone) {
      setIntroDone(true);
      setTimeout(() => {
        if (introRef.current) {
          introRef.current.style.opacity = "0";
          introRef.current.style.pointerEvents = "none";
        }
        if (siteRef.current) siteRef.current.style.opacity = "1";
        setTimeout(() => {
          if (introRef.current) introRef.current.style.display = "none";
        }, 1000);
      }, 200);
    }
  }, [videoError, introDone]);

  return (
    <div style={{ background: "#000", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --violet: #8b5cf6;
          --violet-dark: #6d28d9;
          --violet-light: #a78bfa;
          --pink: #ec4899;
          --cyan: #06b6d4;
          --orange: #f59e0b;
          --emerald: #10b981;
          --red: #ef4444;
        }
        html { scroll-behavior: smooth; }

        /* ═══════════════ INTRO ═══════════════ */
        .landing-intro {
          position: fixed; inset: 0; z-index: 9999;
          background: #000;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 1s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }

        .intro-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .intro-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.15) 0%,
            rgba(0,0,0,0) 30%,
            rgba(0,0,0,0) 70%,
            rgba(0,0,0,0.6) 100%
          );
          z-index: 1;
        }

        .intro-brand-overlay {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 16px;
          animation: introBrandFade 1.5s ease 0.5s both;
        }

        .intro-logo-wrap {
          width: 96px; height: 96px; border-radius: 26px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 0 60px rgba(139,92,246,0.9),
            0 0 120px rgba(236,72,153,0.5),
            0 0 200px rgba(139,92,246,0.3);
          animation: logoPulse 3s ease-in-out infinite;
        }

        .intro-logo-sym {
          font-size: 44px; font-weight: 900; color: white;
          text-shadow: 0 0 30px rgba(255,255,255,0.9);
        }

        .intro-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 64px; font-weight: 800;
          letter-spacing: -3px;
          background: linear-gradient(135deg, #fff 0%, #c4b5fd 40%, #f9a8d4 75%, #67e8f9 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          line-height: 1;
        }

        .intro-sub-text {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.5);
          letter-spacing: 6px;
          text-transform: uppercase;
        }

        .intro-skip-btn {
          position: absolute; bottom: 40px; right: 40px; z-index: 10;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.5);
          padding: 8px 20px; border-radius: 100px;
          font-size: 12px; font-weight: 600; letter-spacing: 1px;
          cursor: pointer; transition: all 0.2s;
          backdrop-filter: blur(10px);
        }
        .intro-skip-btn:hover {
          color: white;
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.3);
        }

        /* ═══════════════ ANIMATIONS ═══════════════ */
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 60px rgba(139,92,246,0.9), 0 0 120px rgba(236,72,153,0.5), 0 0 200px rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 80px rgba(139,92,246,1), 0 0 160px rgba(236,72,153,0.7), 0 0 300px rgba(139,92,246,0.5); }
        }
        @keyframes introBrandFade { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 30px rgba(139,92,246,0.5)} 50%{box-shadow:0 0 80px rgba(139,92,246,0.9),0 0 160px rgba(236,72,153,0.4)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes marqueeLeft { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes orbPulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes heroEntrance { from{opacity:0;transform:translateY(50px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes spinRing { to { transform: rotate(360deg); } }
        @keyframes scanDown { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
        @keyframes borderGlow {
          0%,100%{ border-color: rgba(139,92,246,0.3); box-shadow: 0 0 20px rgba(139,92,246,0.15); }
          50%{ border-color: rgba(236,72,153,0.5); box-shadow: 0 0 40px rgba(236,72,153,0.2); }
        }
        @keyframes textFlicker {
          0%,100%{ opacity:1 } 92%{ opacity:1 } 93%{ opacity:0.3 } 94%{ opacity:1 } 95%{ opacity:0.5 } 96%{ opacity:1 }
        }

        /* ═══════════════ SCAN LINES ═══════════════ */
        .scanlines {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          mix-blend-mode: multiply;
        }

        /* ═══════════════ NAVBAR ═══════════════ */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 52px;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(30px) saturate(200%);
          border-bottom: 1px solid rgba(139,92,246,0.12);
          animation: slideDown 0.6s ease both;
        }
        .navbar::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(236,72,153,0.4), transparent);
        }
        .nav-logo { display:flex; align-items:center; gap:12px; text-decoration:none; cursor:pointer; }
        .nav-logo-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          display: flex; align-items:center; justify-content:center;
          font-weight: 900; font-size: 18px; color: white;
          box-shadow: 0 4px 24px rgba(139,92,246,0.6), 0 0 40px rgba(139,92,246,0.3);
          animation: glow 4s ease-in-out infinite;
        }
        .nav-logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 21px; font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff, #c4b5fd);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-pill {
          font-size: 9px; font-weight: 800;
          background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2));
          color: #c4b5fd;
          border: 1px solid rgba(139,92,246,0.5);
          padding: 3px 10px; border-radius: 20px;
          letter-spacing: 1.5px; text-transform: uppercase;
          box-shadow: 0 0 12px rgba(139,92,246,0.3);
        }
        .nav-links { display:flex; gap:40px; }
        .nav-links a {
          color: rgba(255,255,255,0.45);
          text-decoration: none; font-size: 14px; font-weight: 500;
          transition: color 0.2s;
          position: relative;
        }
        .nav-links a::after {
          content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
          height: 1px; background: linear-gradient(90deg, #8b5cf6, #ec4899);
          transform: scaleX(0); transition: transform 0.25s;
        }
        .nav-links a:hover { color: white; }
        .nav-links a:hover::after { transform: scaleX(1); }

        .btn-nav-cta {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white; border: none;
          padding: 11px 26px; border-radius: 11px;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 24px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
          letter-spacing: 0.3px;
          position: relative; overflow: hidden;
        }
        .btn-nav-cta::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .btn-nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(139,92,246,0.8), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .btn-nav-cta:hover::before { opacity: 1; }

        /* ═══════════════ HERO ═══════════════ */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center;
          padding: 140px 24px 120px;
          position: relative; overflow: hidden;
          background: #000;
        }

        /* Hero video background */
        .hero-video-bg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.25;
          filter: saturate(1.5) brightness(0.7);
        }

        .hero-video-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 80%, #000 100%);
        }

        .hero-orb-1 {
          position: absolute; top: -20%; left: 50%; transform: translateX(-50%);
          width: 1000px; height: 700px;
          background: radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, transparent 65%);
          animation: orbPulse 6s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-orb-2 {
          position: absolute; bottom: -10%; left: -15%;
          width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(236,72,153,0.1) 0%, transparent 65%);
          animation: orbPulse 8s ease-in-out infinite 2s;
          pointer-events: none;
        }
        .hero-orb-3 {
          position: absolute; bottom: 10%; right: -10%;
          width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 65%);
          animation: orbPulse 10s ease-in-out infinite 4s;
          pointer-events: none;
        }

        /* Grid overlay */
        .hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
        }

        .hero-content {
          position: relative; z-index: 2; max-width: 1100px;
          animation: heroEntrance 1s cubic-bezier(0.34,1.1,0.64,1) 0.2s both;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.35);
          padding: 8px 20px; border-radius: 100px;
          font-size: 13px; color: #c4b5fd;
          margin-bottom: 36px; font-weight: 600;
          box-shadow: 0 0 20px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
          animation: borderGlow 4s ease-in-out infinite;
        }
        .eyebrow-dot {
          width: 7px; height: 7px; background: #8b5cf6; border-radius: 50%;
          animation: blink 1.4s ease-in-out infinite; flex-shrink: 0;
          box-shadow: 0 0 8px rgba(139,92,246,1);
        }

        .hero-h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(58px, 10vw, 110px);
          font-weight: 800;
          letter-spacing: -5px;
          line-height: 0.92;
          margin-bottom: 30px;
        }
        .hero-h1 .line1 { display:block; color: #ffffff; }
        .hero-h1 .line2 {
          display: block;
          background: linear-gradient(135deg, #a78bfa 0%, #ec4899 40%, #f59e0b 80%, #ef4444 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: gradientShift 5s ease infinite;
          filter: drop-shadow(0 0 40px rgba(139,92,246,0.4));
        }

        .hero-sub {
          font-size: 20px; color: rgba(255,255,255,0.45);
          line-height: 1.8; max-width: 640px; margin: 0 auto 56px;
          font-weight: 400;
        }
        .hero-ctas {
          display: flex; gap: 18px; justify-content: center; flex-wrap: wrap;
          margin-bottom: 80px;
        }
        .btn-hero-primary {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white; border: none;
          padding: 20px 52px; border-radius: 16px;
          font-size: 17px; font-weight: 800;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 12px;
          transition: all 0.25s ease;
          box-shadow: 0 8px 48px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(139,92,246,0.5);
          letter-spacing: 0.3px;
          position: relative; overflow: hidden;
        }
        .btn-hero-primary::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
          opacity:0; transition:opacity 0.25s;
        }
        .btn-hero-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 64px rgba(139,92,246,0.8), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 1px rgba(139,92,246,0.7);
        }
        .btn-hero-primary:hover::before { opacity:1; }
        .btn-hero-secondary {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 20px 52px; border-radius: 16px;
          font-size: 17px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 12px;
          transition: all 0.25s ease;
          backdrop-filter: blur(12px);
        }
        .btn-hero-secondary:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(139,92,246,0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }

        .hero-trust {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; flex-wrap: wrap;
        }
        .trust-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: rgba(255,255,255,0.3);
          font-weight: 500;
        }
        .trust-dot { width:4px; height:4px; background: #8b5cf6; border-radius:50%; box-shadow: 0 0 6px rgba(139,92,246,0.8); }
        .trust-sep { color:rgba(255,255,255,0.1); margin:0 4px; }

        /* ═══════════════ MARQUEE ═══════════════ */
        .marquee-section {
          padding: 36px 0;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          overflow: hidden; position: relative;
          background: rgba(0,0,0,0.6);
        }
        .marquee-section::before, .marquee-section::after {
          content:''; position:absolute; top:0; bottom:0; width:200px; z-index:2;
        }
        .marquee-section::before { left:0; background:linear-gradient(90deg, #000, transparent); }
        .marquee-section::after { right:0; background:linear-gradient(-90deg, #000, transparent); }
        .marquee-track {
          display: flex; gap: 0;
          animation: marqueeLeft 25s linear infinite;
          width: max-content;
        }
        .marquee-item {
          display: flex; align-items: center; gap: 12px;
          padding: 0 44px;
          font-size: 13px; color: rgba(255,255,255,0.22);
          font-weight: 600; letter-spacing: 1px;
          white-space: nowrap; text-transform: uppercase;
        }
        .marquee-icon { font-size:16px; }
        .marquee-divider { width:4px; height:4px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius:50%; box-shadow: 0 0 6px rgba(139,92,246,0.6); }

        /* ═══════════════ STATS ═══════════════ */
        .stats-section {
          display: flex; justify-content: center;
          flex-wrap: wrap;
          max-width: 1000px; margin: 0 auto;
          padding: 80px 24px;
          gap: 0;
          background: transparent;
        }
        .stat-card {
          flex: 1; min-width: 200px;
          text-align: center;
          padding: 48px 32px;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: relative;
          transition: all 0.3s;
        }
        .stat-card::after {
          content:'';
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 0; height: 2px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          transition: width 0.4s;
          border-radius: 2px;
        }
        .stat-card:hover::after { width: 60%; }
        .stat-card:last-child { border-right:none; }
        .stat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 52px; font-weight: 800;
          letter-spacing: -3px;
          background: linear-gradient(135deg, #a78bfa, #ec4899, #f59e0b);
          background-size: 200% 200%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          display: block; line-height: 1;
          animation: gradientShift 6s ease infinite;
          filter: drop-shadow(0 0 20px rgba(139,92,246,0.3));
        }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }

        /* ═══════════════ EDITOR MOCKUP ═══════════════ */
        .preview-section { padding: 0 24px 140px; text-align:center; position:relative; background: #000; }
        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 800; letter-spacing: 5px;
          text-transform: uppercase; color: var(--violet-light);
          margin-bottom: 20px;
        }
        .section-eyebrow::before, .section-eyebrow::after {
          content:''; width:36px; height:1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.7));
        }
        .section-eyebrow::after { background: linear-gradient(-90deg, transparent, rgba(139,92,246,0.7)); }
        .section-h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(36px, 5.5vw, 68px);
          font-weight: 800; letter-spacing: -2.5px;
          margin-bottom: 18px; line-height: 1.05;
        }
        .section-p { font-size:18px; color:rgba(255,255,255,0.4); max-width:560px; margin:0 auto 64px; line-height:1.8; }

        .editor-frame {
          max-width: 1200px; margin: 0 auto;
          background: #080608;
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 24px; overflow: hidden;
          box-shadow:
            0 80px 200px rgba(0,0,0,0.98),
            0 0 0 1px rgba(139,92,246,0.08),
            0 0 160px rgba(139,92,246,0.08),
            0 0 300px rgba(139,92,246,0.04),
            inset 0 1px 0 rgba(139,92,246,0.12);
          animation: float 8s ease-in-out infinite;
          position: relative;
        }
        .editor-frame::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(236,72,153,0.5), rgba(6,182,212,0.4), transparent);
        }

        .frame-titlebar {
          height: 50px;
          background: linear-gradient(180deg, #0d0a1a 0%, #080610 100%);
          border-bottom: 1px solid rgba(139,92,246,0.1);
          display: flex; align-items:center; padding: 0 18px; gap: 14px;
        }
        .frame-dots { display:flex; gap:8px; }
        .frame-dot { width:13px; height:13px; border-radius:50%; }
        .frame-dot-r { background: #ff5f57; box-shadow: 0 0 6px rgba(255,95,87,0.5); }
        .frame-dot-y { background: #febc2e; box-shadow: 0 0 6px rgba(254,188,46,0.5); }
        .frame-dot-g { background: #28c840; box-shadow: 0 0 6px rgba(40,200,64,0.5); }
        .frame-breadcrumb {
          flex:1; display:flex; align-items:center; justify-content:center;
          gap:6px; font-size:11px; color:rgba(255,255,255,0.25);
        }
        .frame-body { display:flex; height:620px; }

        .frame-left-tools {
          width: 58px;
          background: #040208;
          border-right: 1px solid rgba(139,92,246,0.08);
          display: flex; flex-direction:column; align-items:center;
          padding: 16px 0; gap: 7px;
        }
        .frame-tool {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items:center; justify-content:center;
          font-size: 15px; cursor:pointer;
          background: rgba(255,255,255,0.02);
          border: 1px solid transparent;
          transition: all 0.15s;
          color: rgba(255,255,255,0.3);
        }
        .frame-tool:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
        .frame-tool.active {
          background: rgba(139,92,246,0.22);
          border-color: rgba(139,92,246,0.4);
          box-shadow: 0 0 16px rgba(139,92,246,0.3);
          color: #c4b5fd;
        }

        .frame-canvas {
          flex: 1;
          background: #040208;
          display: flex; align-items:center; justify-content:center;
          position: relative; overflow:hidden;
        }
        .frame-canvas-art {
          width: 70%; aspect-ratio: 16/10;
          border-radius: 12px; overflow:hidden;
          box-shadow: 0 0 0 1px rgba(139,92,246,0.25), 0 32px 100px rgba(0,0,0,0.8), 0 0 60px rgba(139,92,246,0.1);
          position: relative;
        }
        .canvas-art-bg {
          width:100%; height:100%;
          background: linear-gradient(135deg, #120030 0%, #0d1550 30%, #001528 65%, #200010 100%);
          position: relative;
        }
        .canvas-art-bg::before {
          content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 65% 85% at 25% 55%, rgba(139,92,246,0.6) 0%, transparent 55%),
            radial-gradient(ellipse 50% 70% at 78% 30%, rgba(6,182,212,0.45) 0%, transparent 55%),
            radial-gradient(ellipse 60% 75% at 58% 82%, rgba(236,72,153,0.5) 0%, transparent 55%);
        }
        .canvas-art-label {
          position: absolute; inset:0;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          z-index:1; gap:8px;
        }
        .canvas-art-title {
          font-family:'Space Grotesk',sans-serif;
          font-size:26px; font-weight:800;
          background:linear-gradient(135deg,#a78bfa,#ec4899,#67e8f9);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          letter-spacing:-1.5px;
          filter: drop-shadow(0 0 20px rgba(139,92,246,0.6));
        }
        .canvas-art-sub { font-size:11px; color:rgba(255,255,255,0.3); letter-spacing:4px; text-transform:uppercase; }

        .canvas-chip {
          position: absolute;
          background: rgba(4,2,12,0.92);
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 9px; padding: 7px 12px;
          font-size: 11px; color: rgba(255,255,255,0.7);
          backdrop-filter: blur(16px);
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 20px rgba(139,92,246,0.1);
        }
        .canvas-chip-val { color: #a78bfa; font-weight: 800; margin-left: 6px; }

        .frame-right-panel {
          width: 280px;
          background: #060410;
          border-left: 1px solid rgba(139,92,246,0.08);
          overflow: hidden;
        }
        .rp-tabs {
          display:flex; border-bottom: 1px solid rgba(139,92,246,0.1);
          padding: 0 8px; gap: 2px; padding-top: 10px;
        }
        .rp-tab {
          flex:1; padding:8px 6px; text-align:center;
          font-size:10px; font-weight:700;
          color:rgba(255,255,255,0.22); cursor:pointer;
          border-radius:6px 6px 0 0;
          border-bottom: 2px solid transparent;
          transition: all 0.15s; letter-spacing: 0.5px;
        }
        .rp-tab.active { color:#a78bfa; border-bottom-color:#8b5cf6; text-shadow: 0 0 10px rgba(139,92,246,0.5); }
        .rp-body { padding: 14px; overflow:hidden; }
        .rp-section-label { font-size:9px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.18); margin: 12px 0 10px; }
        .rp-slider-row { margin-bottom:12px; }
        .rp-slider-header { display:flex; justify-content:space-between; font-size:10px; margin-bottom:6px; }
        .rp-slider-name { color:rgba(255,255,255,0.4); }
        .rp-slider-val { color:#a78bfa; font-weight:800; font-family:monospace; }
        .rp-track { height:3px; background:rgba(255,255,255,0.05); border-radius:2px; position:relative; }
        .rp-fill { height:100%; border-radius:2px; position:relative; }
        .rp-thumb { width:12px; height:12px; border-radius:50%; background:#fff; position:absolute; top:50%; transform:translate(-50%,-50%); box-shadow:0 0 0 2px rgba(139,92,246,0.7),0 2px 6px rgba(0,0,0,0.8); }
        .rp-histogram { height:52px; background:rgba(255,255,255,0.02); border-radius:7px; overflow:hidden; display:flex; align-items:flex-end; gap:1px; padding:5px; margin:12px 0; }
        .rp-hist-bar { flex:1; border-radius:1px 1px 0 0; }

        /* ═══════════════ FEATURES ═══════════════ */
        .features-section { padding: 130px 24px; background: #000; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 22px; max-width: 1160px; margin: 0 auto;
        }
        .feature-card {
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px; padding: 40px;
          transition: all 0.35s ease;
          position: relative; overflow: hidden;
          cursor: default;
        }
        .feature-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(236,72,153,0.4), transparent);
          opacity:0; transition:opacity 0.35s;
        }
        .feature-card::after {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse 120% 80% at 50% -10%, rgba(139,92,246,0.08) 0%, transparent 60%);
          opacity:0; transition:opacity 0.35s;
        }
        .feature-card:hover {
          border-color: rgba(139,92,246,0.35);
          transform: translateY(-8px);
          box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.1);
          background: rgba(139,92,246,0.04);
        }
        .feature-card:hover::before, .feature-card:hover::after { opacity:1; }
        .feature-icon-wrap {
          width: 60px; height: 60px; border-radius: 18px;
          display: flex; align-items:center; justify-content:center;
          font-size: 28px; margin-bottom: 26px;
          position: relative; z-index:1;
          border: 1px solid rgba(139,92,246,0.2);
        }
        .feature-title { font-size:22px; font-weight:800; margin-bottom:13px; letter-spacing:-0.5px; position:relative; z-index:1; }
        .feature-desc { font-size:14px; color:rgba(255,255,255,0.4); line-height:1.8; position:relative; z-index:1; }
        .feature-tags { display:flex; flex-wrap:wrap; gap:7px; margin-top:22px; position:relative; z-index:1; }
        .feat-tag {
          font-size:10px; font-weight:700; padding:4px 12px; border-radius:7px;
          background:rgba(139,92,246,0.12); color:#c4b5fd;
          border: 1px solid rgba(139,92,246,0.25); letter-spacing: 0.5px;
        }
        .feat-tag-new { background:rgba(245,158,11,0.12); color:#fbbf24; border-color:rgba(245,158,11,0.35); }

        /* ═══════════════ AI SECTION ═══════════════ */
        .ai-section {
          padding: 130px 24px;
          background: linear-gradient(180deg, #000, rgba(139,92,246,0.04) 50%, #000);
          position: relative;
        }
        .ai-section::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background: repeating-linear-gradient(
            90deg, rgba(139,92,246,0.015) 0px, rgba(139,92,246,0.015) 1px,
            transparent 1px, transparent 80px
          );
        }
        .ai-inner { max-width: 1100px; margin: 0 auto; }
        .ai-grid { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
        .ai-features { display:flex; flex-direction:column; gap:16px; }
        .ai-feat {
          display:flex; gap:20px; padding:24px;
          border-radius:20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s;
          cursor:default;
        }
        .ai-feat:hover {
          border-color: rgba(139,92,246,0.4);
          background: rgba(139,92,246,0.06);
          transform: translateX(8px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), -4px 0 24px rgba(139,92,246,0.1);
        }
        .ai-feat-icon {
          width:52px; height:52px; border-radius:16px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:24px;
          border: 1px solid rgba(139,92,246,0.2);
        }
        .ai-feat-title { font-size:15px; font-weight:800; margin-bottom:6px; letter-spacing:-0.2px; }
        .ai-feat-desc { font-size:13px; color:rgba(255,255,255,0.38); line-height:1.65; }

        .ai-visual {
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 30px; padding:44px;
          text-align:center; position:relative; overflow:hidden;
          box-shadow: 0 0 60px rgba(139,92,246,0.08), inset 0 1px 0 rgba(139,92,246,0.15);
          animation: borderGlow 5s ease-in-out infinite;
        }
        .ai-visual::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.12), transparent);
        }
        .ai-orb-container { position:relative; z-index:1; margin:0 auto 30px; width:150px; height:150px; }
        .ai-orb-ring {
          position:absolute; inset:0; border-radius:50%;
          border: 2px solid transparent;
          background: linear-gradient(#060410,#060410) padding-box,
                      conic-gradient(from 0deg, #8b5cf6, #ec4899, #06b6d4, #f59e0b, #ef4444, #8b5cf6) border-box;
          animation: spinRing 5s linear infinite;
        }
        .ai-orb-ring-2 {
          position:absolute; inset:18px; border-radius:50%;
          border: 1px solid rgba(236,72,153,0.35);
          animation: spinRing 9s linear infinite reverse;
        }
        .ai-orb-core {
          position:absolute; inset:26px; border-radius:50%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4);
          display:flex; align-items:center; justify-content:center;
          font-size:38px;
          box-shadow: 0 0 50px rgba(139,92,246,0.8), 0 0 100px rgba(236,72,153,0.4);
          animation: orbPulse 4s ease-in-out infinite;
        }
        .ai-visual-title { font-size:26px; font-weight:800; letter-spacing:-0.7px; position:relative; z-index:1; margin-bottom:10px; }
        .ai-visual-sub { font-size:14px; color:rgba(255,255,255,0.33); position:relative; z-index:1; line-height:1.65; }
        .ai-chips { display:flex; flex-wrap:wrap; gap:9px; justify-content:center; margin-top:24px; position:relative; z-index:1; }
        .ai-chip {
          font-size:11px; padding:6px 16px; border-radius:100px; font-weight:700;
          background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.3); color:#c4b5fd;
          letter-spacing: 0.5px;
          transition: all 0.2s;
        }
        .ai-chip:hover { background:rgba(139,92,246,0.25); box-shadow: 0 0 12px rgba(139,92,246,0.3); }

        /* ═══════════════ WORKFLOW ═══════════════ */
        .workflow-section { padding:130px 24px; position:relative; background: #000; }
        .steps-row {
          display:flex; gap:0; max-width:1080px; margin:0 auto; position:relative;
        }
        .steps-row::before {
          content:''; position:absolute; top:40px; left:12%; right:12%; height:1px;
          background:linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(236,72,153,0.4), rgba(6,182,212,0.35), transparent);
          box-shadow: 0 0 10px rgba(139,92,246,0.2);
        }
        .step-item { flex:1; text-align:center; padding:0 24px; }
        .step-icon-wrap {
          width:84px; height:84px; border-radius:26px; margin:0 auto 24px;
          background:linear-gradient(135deg,rgba(139,92,246,0.18),rgba(236,72,153,0.1));
          border:1px solid rgba(139,92,246,0.35);
          display:flex; align-items:center; justify-content:center; font-size:32px;
          position:relative; z-index:1;
          transition: all 0.35s;
          box-shadow: 0 4px 24px rgba(139,92,246,0.1);
        }
        .step-item:hover .step-icon-wrap {
          background:linear-gradient(135deg,rgba(139,92,246,0.35),rgba(236,72,153,0.18));
          box-shadow:0 12px 48px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.2);
          transform:translateY(-6px);
          border-color: rgba(139,92,246,0.6);
        }
        .step-num {
          font-family:'Space Grotesk',sans-serif;
          font-size:11px; font-weight:800; letter-spacing:2px;
          color:rgba(139,92,246,0.5); text-transform:uppercase; margin-bottom:8px;
        }
        .step-title { font-size:17px; font-weight:800; margin-bottom:10px; letter-spacing:-0.3px; }
        .step-desc { font-size:13px; color:rgba(255,255,255,0.35); line-height:1.7; }

        /* ═══════════════ CTA ═══════════════ */
        .cta-section {
          padding:160px 24px; text-align:center; position:relative; overflow:hidden;
          background: #000;
        }
        .cta-orb {
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:900px; height:600px;
          background: radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 40%, transparent 65%);
          pointer-events:none;
          animation:orbPulse 8s ease-in-out infinite;
          filter: blur(40px);
        }
        .cta-grid-lines {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
        }
        .cta-content { position:relative; z-index:1; }
        .cta-h2 {
          font-family:'Space Grotesk',sans-serif;
          font-size:clamp(44px,8vw,88px); font-weight:800; letter-spacing:-4px;
          line-height:0.95; margin-bottom:24px;
        }
        .cta-sub { font-size:20px; color:rgba(255,255,255,0.4); margin:0 auto 56px; max-width:560px; line-height:1.7; }
        .cta-btns { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }

        /* ═══════════════ FOOTER ═══════════════ */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 52px;
          display:flex; justify-content:space-between; align-items:center;
          flex-wrap:wrap; gap:20px;
          color:rgba(255,255,255,0.2); font-size:13px;
          position: relative; background: #000;
        }
        .footer::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(139,92,246,0.5),rgba(236,72,153,0.3),rgba(6,182,212,0.25),transparent);
        }
        .footer-brand { display:flex; align-items:center; gap:10px; }
        .footer-brand-icon {
          width:32px; height:32px; border-radius:9px;
          background:linear-gradient(135deg,#8b5cf6,#ec4899);
          display:flex; align-items:center; justify-content:center;
          font-weight:900; font-size:14px; color:white;
          box-shadow: 0 4px 16px rgba(139,92,246,0.5);
        }
        .footer-links { display:flex; gap:28px; }
        .footer-links a { color:rgba(255,255,255,0.2); text-decoration:none; transition:color 0.2s; }
        .footer-links a:hover { color:rgba(255,255,255,0.7); }

        @media(max-width:768px) {
          .navbar { padding:14px 22px; }
          .nav-links { display:none; }
          .ai-grid { grid-template-columns:1fr; gap:48px; }
          .steps-row { flex-direction:column; gap:40px; }
          .steps-row::before { display:none; }
          .frame-right-panel { display:none; }
          .hero-h1 { letter-spacing:-2px; }
          .footer { flex-direction:column; text-align:center; padding:36px 24px; }
          .stat-card { border-right:none; border-bottom:1px solid rgba(255,255,255,0.05); padding:32px; }
          .intro-name { font-size:42px; }
        }
      `}</style>

      {/* Subtle scanlines effect */}
      <div className="scanlines" />

      {/* ═════════════════════════════ INTRO SEQUENCE ═════════════════════════════ */}
      <div className="landing-intro" ref={introRef}>
        {/* The video sent by the user */}
        <video
          ref={videoRef}
          className="intro-video"
          src={`${import.meta.env.BASE_URL}intro.mp4`}
          muted
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
        />

        {/* Skip button */}
        <button
          className="intro-skip-btn"
          onClick={() => {
            if (videoRef.current) videoRef.current.dispatchEvent(new Event("ended"));
          }}
        >
          SKIP →
        </button>
      </div>

      {/* ═════════════════════════════ MAIN SITE ═════════════════════════════ */}
      <div ref={siteRef} style={{ opacity: 0, transition: "opacity 1s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-logo" onClick={launchEditor}>
            <div className="nav-logo-icon">✦</div>
            <span className="nav-logo-text">ProEditor</span>
            <span className="nav-pill">PRO v4</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#ai">AI Tools</a>
            <a href="#workflow">Workflow</a>
            <a href="#preview">Preview</a>
          </div>
          <button onClick={launchEditor} className="btn-nav-cta">Launch Editor →</button>
        </nav>

        {/* HERO */}
        <section className="hero">
          {/* Hero uses the same video as ambient BG */}
          <video
            className="hero-video-bg"
            src={`${import.meta.env.BASE_URL}intro.mp4`}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="hero-video-overlay" />
          <div className="hero-orb-1" />
          <div className="hero-orb-2" />
          <div className="hero-orb-3" />
          <div className="hero-grid" />

          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              Content-Aware Fill · AI Upscale · 8K · Neural Engine
            </div>

            <h1 className="hero-h1">
              <span className="line1">Create Without</span>
              <span className="line2">Limits.</span>
            </h1>

            <p className="hero-sub">
              The world's most powerful browser-based photo &amp; video editor.
              Real pixel-level AI tools, professional color science, and
              cinematic-grade effects — no install required.
            </p>

            <div className="hero-ctas">
              <button onClick={launchEditor} className="btn-hero-primary">
                <span>⚡</span>
                Start Editing Free
              </button>
              <a href="#features" className="btn-hero-secondary">
                <span>✦</span>
                Explore Features
              </a>
            </div>

            <div className="hero-trust">
              <span className="trust-item"><span className="trust-dot"/>&nbsp;No download required</span>
              <span className="trust-sep">·</span>
              <span className="trust-item"><span className="trust-dot"/>&nbsp;100% browser-based</span>
              <span className="trust-sep">·</span>
              <span className="trust-item"><span className="trust-dot"/>&nbsp;AI-powered tools</span>
              <span className="trust-sep">·</span>
              <span className="trust-item"><span className="trust-dot"/>&nbsp;8K resolution</span>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-section">
          <div className="marquee-track">
            {[
              ["⚡","AI Neural Engine"],["🎨","Color Grading"],["🔮","Frequency Separation"],
              ["🎬","Video Editor"],["🤖","Object Removal"],["📐","Perspective Correction"],
              ["🌈","Color Harmony"],["🎭","Double Exposure"],["📸","RAW Processing"],
              ["✦","Glitch Art"],["🔲","Layer Masking"],["🏔","HDR Tone Mapping"],
              ["⚡","AI Neural Engine"],["🎨","Color Grading"],["🔮","Frequency Separation"],
              ["🎬","Video Editor"],["🤖","Object Removal"],["📐","Perspective Correction"],
            ].map(([icon, label], i) => (
              <div className="marquee-item" key={i}>
                <span className="marquee-icon">{icon}</span>
                <span>{label}</span>
                {i < 17 && <span className="marquee-divider" />}
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "#000" }}>
          <div className="stats-section">
            {[
              { num: "50+", label: "Editing Panels" },
              { num: "8K", label: "Max Resolution" },
              { num: "100+", label: "AI Features" },
              { num: "0", label: "Install Required" },
            ].map(({ num, label }) => (
              <div className="stat-card" key={label}>
                <span className="stat-num">{num}</span>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* EDITOR PREVIEW */}
        <section className="preview-section" id="preview" style={{ paddingTop: "120px" }}>
          <div className="section-eyebrow">The Interface</div>
          <h2 className="section-h2">Professional. Powerful. <span style={{ background:"linear-gradient(135deg,#a78bfa,#ec4899,#f59e0b)", backgroundSize:"200% 200%", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"gradientShift 5s ease infinite" }}>Precise.</span></h2>
          <p className="section-p">Every pixel, every slider, every tool — designed for professionals who demand perfection.</p>

          <div className="editor-frame">
            <div className="frame-titlebar">
              <div className="frame-dots">
                <div className="frame-dot frame-dot-r" />
                <div className="frame-dot frame-dot-y" />
                <div className="frame-dot frame-dot-g" />
              </div>
              <div className="frame-breadcrumb">
                <span>ProEditor</span>
                <span style={{color:"rgba(255,255,255,0.1)"}}>›</span>
                <span style={{color:"rgba(139,92,246,0.7)"}}>mountain-landscape-8k.raw</span>
              </div>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <div style={{height:"20px",width:"1px",background:"rgba(255,255,255,0.07)"}} />
                <span style={{fontSize:"10px",color:"rgba(139,92,246,0.7)",fontWeight:"800",letterSpacing:"1px",textShadow:"0 0 10px rgba(139,92,246,0.5)"}}>✦ AI ACTIVE</span>
              </div>
            </div>

            <div className="frame-body">
              <div className="frame-left-tools">
                {["↖","✂","🖌","🪄","⟳","T","⬛","◎"].map((icon, i) => (
                  <div key={i} className={`frame-tool ${i === 2 ? "active" : ""}`}>{icon}</div>
                ))}
                <div style={{flex:1}} />
                {["🎭","✨","📐"].map((icon, i) => (
                  <div key={i} className="frame-tool">{icon}</div>
                ))}
              </div>

              <div className="frame-canvas">
                <div className="frame-canvas-art">
                  <div className="canvas-art-bg">
                    <div className="canvas-art-label">
                      <div className="canvas-art-title">Mountain Landscape</div>
                      <div className="canvas-art-sub">8192 × 5461 · RAW · 32-bit</div>
                    </div>
                  </div>
                </div>

                <div className="canvas-chip" style={{top:"20px",left:"80px"}}>
                  Exposure<span className="canvas-chip-val">+0.8</span>
                </div>
                <div className="canvas-chip" style={{top:"20px",right:"310px"}}>
                  AI Denoise<span className="canvas-chip-val" style={{color:"#34d399"}}>Active</span>
                </div>
                <div className="canvas-chip" style={{bottom:"24px",left:"90px"}}>
                  Zoom<span className="canvas-chip-val">100%</span>
                </div>
              </div>

              <div className="frame-right-panel">
                <div className="rp-tabs">
                  {["Adjust","Color","Layers","AI","Effects"].map((tab, i) => (
                    <div key={tab} className={`rp-tab ${i === 0 ? "active" : ""}`}>{tab}</div>
                  ))}
                </div>
                <div className="rp-body">
                  <div className="rp-section-label">Tone</div>
                  {[
                    { name:"Exposure", val:"+0.8", pct:65, color:"#8b5cf6" },
                    { name:"Contrast", val:"+24", pct:72, color:"#ec4899" },
                    { name:"Highlights", val:"-18", pct:38, color:"#f59e0b" },
                    { name:"Shadows", val:"+35", pct:60, color:"#06b6d4" },
                  ].map(({ name, val, pct, color }) => (
                    <div className="rp-slider-row" key={name}>
                      <div className="rp-slider-header">
                        <span className="rp-slider-name">{name}</span>
                        <span className="rp-slider-val">{val}</span>
                      </div>
                      <div className="rp-track">
                        <div className="rp-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}44,${color})` }} />
                        <div className="rp-thumb" style={{ left:`${pct}%`, boxShadow:`0 0 0 2px ${color}99,0 2px 6px rgba(0,0,0,0.8)` }} />
                      </div>
                    </div>
                  ))}
                  <div className="rp-section-label">Histogram</div>
                  <div className="rp-histogram">
                    {[8,14,20,32,48,60,72,80,72,64,52,44,36,28,20,16,12,10,8,6].map((h, i) => (
                      <div key={i} className="rp-hist-bar" style={{ height:`${h*1.2}%`, background:`rgba(${[139,92,246].join(",")},${0.3+i/28})` }} />
                    ))}
                  </div>
                  <div className="rp-section-label">Color Grading</div>
                  {[
                    { name:"Temp", val:"5500K", pct:55, color:"#f59e0b" },
                    { name:"Tint", val:"+12", pct:52, color:"#10b981" },
                    { name:"Vibrance", val:"+40", pct:70, color:"#a855f7" },
                  ].map(({ name, val, pct, color }) => (
                    <div className="rp-slider-row" key={name}>
                      <div className="rp-slider-header">
                        <span className="rp-slider-name">{name}</span>
                        <span className="rp-slider-val">{val}</span>
                      </div>
                      <div className="rp-track">
                        <div className="rp-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}44,${color})` }} />
                        <div className="rp-thumb" style={{ left:`${pct}%`, boxShadow:`0 0 0 2px ${color}99,0 2px 6px rgba(0,0,0,0.8)` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section" id="features">
          <div style={{textAlign:"center"}}>
            <div className="section-eyebrow">Capabilities</div>
            <h2 className="section-h2">Everything You Need to <span style={{background:"linear-gradient(135deg,#a78bfa,#ec4899,#f59e0b)",backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradientShift 5s ease infinite"}}>Create.</span></h2>
            <p className="section-p">Professional-grade tools once locked behind expensive desktop software — now fully in your browser.</p>
          </div>

          <div className="features-grid">
            {[
              { icon:"🎨", bg:"rgba(139,92,246,0.15)", title:"Advanced Color Science", desc:"Full ACES color pipeline with LUT support, color grading wheels, and spectral curve editor for cinema-grade results.", tags:["ACES","LUT","HDR"] },
              { icon:"🤖", bg:"rgba(236,72,153,0.12)", title:"Neural AI Engine", desc:"AI-powered object removal, smart upscaling to 8K, portrait retouching, and content-aware fill powered by deep learning.", tags:["AI","Neural","8K"], new:true },
              { icon:"🎬", bg:"rgba(6,182,212,0.12)", title:"Video Editor", desc:"Full timeline-based video editor with color grading, effects, transitions, audio waveform visualization, and export to multiple formats.", tags:["Timeline","Audio","Export"] },
              { icon:"🔮", bg:"rgba(245,158,11,0.12)", title:"Frequency Separation", desc:"Professional retouching with frequency separation — separate texture from tones for flawless skin and surface editing.", tags:["Pro","Retouch"] },
              { icon:"🎭", bg:"rgba(16,185,129,0.12)", title:"Advanced Masking", desc:"AI-assisted masking with edge refinement, hair masking, subject detection, and selective adjustments on any area.", tags:["Masks","Edge","AI"] },
              { icon:"🌀", bg:"rgba(139,92,246,0.12)", title:"Glitch & Generative Art", desc:"Built-in glitch art generator, double exposure, pixel sorting, wave distortion, and procedural noise tools for creative destruction.", tags:["Creative","Glitch","Art"], new:true },
            ].map(({ icon, bg, title, desc, tags, new: isNew }) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon-wrap" style={{ background: bg }}>
                  {icon}
                </div>
                <div className="feature-title">{title}</div>
                <p className="feature-desc">{desc}</p>
                <div className="feature-tags">
                  {tags.map(t => <span className="feat-tag" key={t}>{t}</span>)}
                  {isNew && <span className="feat-tag feat-tag-new">New</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI SECTION */}
        <section className="ai-section" id="ai">
          <div className="ai-inner">
            <div style={{textAlign:"center",marginBottom:"80px"}}>
              <div className="section-eyebrow">Artificial Intelligence</div>
              <h2 className="section-h2">The Future of <span style={{background:"linear-gradient(135deg,#a78bfa,#06b6d4,#ec4899)",backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradientShift 5s ease infinite"}}>Editing is Here.</span></h2>
              <p className="section-p">Every AI tool runs entirely in your browser using WebGL acceleration. No data ever leaves your device.</p>
            </div>

            <div className="ai-grid">
              <div className="ai-features">
                {[
                  { icon:"🧠", bg:"rgba(139,92,246,0.15)", title:"Smart Object Removal", desc:"Point-and-click to remove anything. AI reconstructs the background with photorealistic accuracy." },
                  { icon:"🔍", bg:"rgba(6,182,212,0.12)", title:"AI Super Resolution", desc:"Upscale any image up to 8x while preserving details, textures, and sharpness with neural processing." },
                  { icon:"👤", bg:"rgba(236,72,153,0.12)", title:"Portrait Intelligence", desc:"AI detects facial features, smooths skin, brightens eyes, and enhances portraits automatically." },
                  { icon:"🎨", bg:"rgba(245,158,11,0.1)", title:"Style Transfer", desc:"Apply the aesthetic of any artwork to your photo using convolutional neural style transfer in real-time." },
                ].map(({ icon, bg, title, desc }) => (
                  <div className="ai-feat" key={title}>
                    <div className="ai-feat-icon" style={{ background: bg }}>
                      {icon}
                    </div>
                    <div>
                      <div className="ai-feat-title">{title}</div>
                      <p className="ai-feat-desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ai-visual">
                <div className="ai-orb-container">
                  <div className="ai-orb-ring" />
                  <div className="ai-orb-ring-2" />
                  <div className="ai-orb-core">🧠</div>
                </div>
                <div className="ai-visual-title">Neural Engine</div>
                <p className="ai-visual-sub">Runs 100% locally in your browser.<br />Your images never leave your device.</p>
                <div className="ai-chips">
                  {["WebGL 2.0","WASM","WebWorkers","Canvas API","Tensor Ops"].map(c => (
                    <span className="ai-chip" key={c}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="workflow-section" id="workflow">
          <div style={{textAlign:"center",marginBottom:"80px"}}>
            <div className="section-eyebrow">How It Works</div>
            <h2 className="section-h2">From Upload to <span style={{background:"linear-gradient(135deg,#a78bfa,#f59e0b)",backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradientShift 5s ease infinite"}}>Masterpiece.</span></h2>
            <p className="section-p">A seamless workflow designed for speed, precision, and creative freedom.</p>
          </div>

          <div className="steps-row">
            {[
              { num:"01", icon:"📂", title:"Open Any File", desc:"Drag & drop images, videos, or RAW files. Supports JPG, PNG, WebP, HEIC, NEF, CR2, ARW, and more." },
              { num:"02", icon:"🎛️", title:"Edit with Precision", desc:"50+ panels, AI tools, color grading, layers, masking — every professional tool at your fingertips." },
              { num:"03", icon:"🤖", title:"Enhance with AI", desc:"One click to remove objects, enhance portraits, upscale resolution, or apply neural style transfer." },
              { num:"04", icon:"📤", title:"Export Flawlessly", desc:"Export to PNG, JPEG, WebP, or print-ready PDF. Batch export with custom presets and watermarking." },
            ].map(({ num, icon, title, desc }) => (
              <div className="step-item" key={title}>
                <div className="step-num">{num}</div>
                <div className="step-icon-wrap">{icon}</div>
                <div className="step-title">{title}</div>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-orb" />
          <div className="cta-grid-lines" />
          <div className="cta-content">
            <h2 className="cta-h2">
              Ready to Edit Like<br />
              <span style={{background:"linear-gradient(135deg,#a78bfa,#ec4899,#f59e0b,#ef4444)",backgroundSize:"300% 300%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradientShift 4s ease infinite",filter:"drop-shadow(0 0 40px rgba(139,92,246,0.4))"}}>
                a Legend?
              </span>
            </h2>
            <p className="cta-sub">
              No account. No download. No credit card. Just open and start creating — professional results in minutes.
            </p>
            <div className="cta-btns">
              <button onClick={launchEditor} className="btn-hero-primary" style={{fontSize:"19px",padding:"22px 60px"}}>
                <span>⚡</span> Launch ProEditor Free
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-brand">
            <div className="footer-brand-icon">✦</div>
            <span>ProEditor v4.0 · Browser-Native AI Photo &amp; Video Editor</span>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#ai">AI Tools</a>
            <a href="#workflow">Workflow</a>
          </div>
          <span>© 2026 ProEditor. All rights reserved.</span>
        </footer>

      </div>
    </div>
  );
}
