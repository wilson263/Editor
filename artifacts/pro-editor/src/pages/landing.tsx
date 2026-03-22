import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);
  const [introPhase, setIntroPhase] = useState<"loading" | "logo" | "done">("loading");

  function launchEditor() {
    navigate("/editor");
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, animFrame = 0;
    let t = 0;

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; color: string; life: number; maxLife: number;
    };

    const particles: Particle[] = [];
    const colors = ["#8b5cf6", "#a855f7", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#3b82f6"];

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 3 + 0.5,
        alpha: Math.random() * 0.7 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 300,
      });
    }

    let rings: { r: number; alpha: number; color: string }[] = [];
    let ringTimer = 0;
    const ringColors = ["#8b5cf6", "#ec4899", "#06b6d4"];

    function drawHexGrid(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
      const size = 40;
      const h = size * Math.sqrt(3);
      ctx.save();
      ctx.strokeStyle = "rgba(139,92,246,0.07)";
      ctx.lineWidth = 0.5;
      for (let row = -2; row < H / h + 2; row++) {
        for (let col = -2; col < W / (size * 1.5) + 2; col++) {
          const cx = col * size * 1.5;
          const cy = row * h + (col % 2 === 0 ? 0 : h / 2) + Math.sin(t * 0.001 + col * 0.3) * 4;
          const pulse = Math.sin(t * 0.002 + row * 0.5 + col * 0.3) * 0.5 + 0.5;
          ctx.globalAlpha = 0.03 + pulse * 0.05;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = cx + size * Math.cos(angle);
            const py = cy + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);

      // Deep cosmic background
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
      bg.addColorStop(0, "#06001a");
      bg.addColorStop(0.4, "#020008");
      bg.addColorStop(1, "#000000");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Moving nebula clouds
      const angle1 = t * 0.0005;
      const nx1 = W * 0.3 + Math.cos(angle1) * W * 0.15;
      const ny1 = H * 0.4 + Math.sin(angle1) * H * 0.1;
      const n1 = ctx.createRadialGradient(nx1, ny1, 0, nx1, ny1, W * 0.45);
      n1.addColorStop(0, "rgba(139,92,246,0.22)");
      n1.addColorStop(0.5, "rgba(168,85,247,0.08)");
      n1.addColorStop(1, "transparent");
      ctx.fillStyle = n1; ctx.fillRect(0, 0, W, H);

      const nx2 = W * 0.7 + Math.cos(-angle1 * 0.7) * W * 0.1;
      const ny2 = H * 0.6 + Math.sin(-angle1 * 0.7) * H * 0.15;
      const n2 = ctx.createRadialGradient(nx2, ny2, 0, nx2, ny2, W * 0.3);
      n2.addColorStop(0, "rgba(236,72,153,0.15)");
      n2.addColorStop(0.6, "rgba(236,72,153,0.04)");
      n2.addColorStop(1, "transparent");
      ctx.fillStyle = n2; ctx.fillRect(0, 0, W, H);

      const nx3 = W * 0.15 + Math.sin(angle1 * 1.3) * W * 0.1;
      const ny3 = H * 0.25 + Math.cos(angle1 * 1.3) * H * 0.1;
      const n3 = ctx.createRadialGradient(nx3, ny3, 0, nx3, ny3, W * 0.25);
      n3.addColorStop(0, "rgba(6,182,212,0.1)");
      n3.addColorStop(1, "transparent");
      ctx.fillStyle = n3; ctx.fillRect(0, 0, W, H);

      // Hex grid
      drawHexGrid(ctx, W, H, t);

      // Particles
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
          p.x = Math.random() * W; p.y = Math.random() * H;
          p.life = 0;
          p.maxLife = 200 + Math.random() * 300;
        }
        const lifeRatio = p.life / p.maxLife;
        const alpha = p.alpha * Math.sin(lifeRatio * Math.PI);
        ctx.save();
        ctx.globalAlpha = alpha;
        // Glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grd.addColorStop(0, p.color);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Expanding rings from center
      ringTimer++;
      if (ringTimer % 50 === 0) {
        rings.push({ r: 0, alpha: 0.7, color: ringColors[Math.floor(Math.random() * ringColors.length)] });
      }
      rings = rings.filter((r) => r.alpha > 0.005);
      rings.forEach((ring) => {
        ring.r += 1.5; ring.alpha *= 0.985;
        ctx.save();
        ctx.globalAlpha = ring.alpha;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Central energy orb
      const orbPulse = Math.sin(t * 0.03) * 0.3 + 0.7;
      const orb = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 180 * orbPulse);
      orb.addColorStop(0, `rgba(139,92,246,${0.25 * orbPulse})`);
      orb.addColorStop(0.4, `rgba(236,72,153,${0.1 * orbPulse})`);
      orb.addColorStop(1, "transparent");
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, W, H);

      animFrame = requestAnimationFrame(draw);
    }
    draw();

    // Phase 1: loading bar
    const p1 = setTimeout(() => setIntroPhase("logo"), 500);

    // Phase 2: show logo, then fade out
    const p2 = setTimeout(() => {
      setIntroPhase("done");
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
    }, 3800);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(p1);
      clearTimeout(p2);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ background: "#030008", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --violet: #8b5cf6;
          --violet-dark: #6d28d9;
          --violet-light: #a78bfa;
          --pink: #ec4899;
          --cyan: #06b6d4;
          --orange: #f59e0b;
          --emerald: #10b981;
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
        .intro-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }

        .intro-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 0;
        }

        .intro-logo-ring {
          width: 140px; height: 140px;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          animation: introLogoRing 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s forwards;
        }
        .intro-ring-1 {
          position: absolute; inset: 0;
          border: 2px solid transparent;
          border-radius: 50%;
          background: linear-gradient(#000,#000) padding-box,
                      conic-gradient(from 0deg, #8b5cf6, #ec4899, #06b6d4, #8b5cf6) border-box;
          animation: spinRing 3s linear infinite;
        }
        .intro-ring-2 {
          position: absolute; inset: 12px;
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 50%;
          animation: spinRing 5s linear infinite reverse;
        }
        .intro-ring-3 {
          position: absolute; inset: 22px;
          border: 1px solid rgba(236,72,153,0.2);
          border-radius: 50%;
          animation: spinRing 8s linear infinite;
        }
        .intro-logo-inner {
          position: relative; z-index: 1;
          width: 80px; height: 80px;
          border-radius: 22px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 60px rgba(139,92,246,0.8), 0 0 120px rgba(236,72,153,0.4);
        }
        .intro-logo-symbol {
          font-size: 36px; font-weight: 900; color: white;
          text-shadow: 0 0 20px rgba(255,255,255,0.8);
        }

        .intro-text-block {
          display: flex; flex-direction: column; align-items: center;
          margin-top: 32px;
          opacity: 0;
          animation: introTextFade 0.7s ease 1s forwards;
        }
        .intro-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 58px; font-weight: 700;
          letter-spacing: -3px;
          background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #f9a8d4 80%, #67e8f9 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .intro-tagline {
          margin-top: 10px;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 6px;
          text-transform: uppercase;
        }

        .intro-loading-area {
          margin-top: 52px;
          display: flex; flex-direction: column; align-items: center;
          gap: 10px;
          opacity: 0;
          animation: introTextFade 0.5s ease 1.4s forwards;
        }
        .intro-progress-track {
          width: 240px; height: 2px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px; overflow: hidden;
          position: relative;
        }
        .intro-progress-fill {
          position: absolute; top: 0; left: 0;
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4);
          border-radius: 2px;
          animation: introFill 2s cubic-bezier(0.4,0,0.2,1) 1.5s forwards;
          width: 0%;
        }
        .intro-progress-fill::after {
          content: '';
          position: absolute; right: 0; top: -2px;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 8px rgba(139,92,246,1);
        }
        .intro-loading-text {
          font-size: 10px; color: rgba(255,255,255,0.25);
          letter-spacing: 3px; text-transform: uppercase;
          font-family: monospace;
        }

        /* scanning line effect */
        .intro-scan-line {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(to bottom,
            transparent 0%, transparent 48%,
            rgba(139,92,246,0.04) 49%, rgba(139,92,246,0.04) 51%,
            transparent 52%);
          background-size: 100% 4px;
          animation: scanDown 3s linear infinite;
        }

        @keyframes spinRing { to { transform: rotate(360deg); } }
        @keyframes introLogoRing { from { opacity:0; transform:scale(0.5) rotate(-45deg); } to { opacity:1; transform:scale(1) rotate(0deg); } }
        @keyframes introTextFade { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes introFill { from { width:0% } to { width:100% } }
        @keyframes scanDown { 0% { transform:translateY(-50%); } 100% { transform:translateY(50%); } }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 30px rgba(139,92,246,0.5)} 50%{box-shadow:0 0 80px rgba(139,92,246,0.9),0 0 160px rgba(236,72,153,0.4)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes marqueeLeft { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes orbPulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes heroEntrance { from{opacity:0;transform:translateY(50px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes rotateBorder { to{--angle:360deg} }

        /* ═══════════════ NAVBAR ═══════════════ */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px;
          background: rgba(3,0,8,0.7);
          backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(139,92,246,0.1);
          animation: slideDown 0.6s ease both;
        }
        .navbar::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(236,72,153,0.3), transparent);
        }
        .nav-logo { display:flex; align-items:center; gap:12px; text-decoration:none; cursor:pointer; }
        .nav-logo-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          display: flex; align-items:center; justify-content:center;
          font-weight: 900; font-size: 18px; color: white;
          box-shadow: 0 4px 20px rgba(139,92,246,0.5);
        }
        .nav-logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px; font-weight: 700;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff, #c4b5fd);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-pill {
          font-size: 9px; font-weight: 700;
          background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15));
          color: #c4b5fd;
          border: 1px solid rgba(139,92,246,0.4);
          padding: 3px 9px; border-radius: 20px;
          letter-spacing: 1.5px; text-transform: uppercase;
        }
        .nav-links { display:flex; gap:36px; }
        .nav-links a {
          color: rgba(255,255,255,0.5);
          text-decoration: none; font-size: 14px; font-weight: 500;
          transition: color 0.2s;
          position: relative;
        }
        .nav-links a::after {
          content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
          height: 1px; background: var(--violet);
          transform: scaleX(0); transition: transform 0.2s;
        }
        .nav-links a:hover { color: white; }
        .nav-links a:hover::after { transform: scaleX(1); }

        .btn-nav-cta {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white; border: none;
          padding: 10px 24px; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
          letter-spacing: 0.2px;
        }
        .btn-nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(139,92,246,0.7), inset 0 1px 0 rgba(255,255,255,0.2);
          background: linear-gradient(135deg, #9d70f9, #8b5cf6);
        }

        /* ═══════════════ HERO ═══════════════ */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center;
          padding: 130px 24px 100px;
          position: relative; overflow: hidden;
        }
        .hero-orb-1 {
          position: absolute; top: -20%; left: 50%; transform: translateX(-50%);
          width: 900px; height: 600px;
          background: radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 65%);
          animation: orbPulse 6s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-orb-2 {
          position: absolute; bottom: -10%; left: -15%;
          width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(236,72,153,0.12) 0%, transparent 65%);
          animation: orbPulse 8s ease-in-out infinite 2s;
          pointer-events: none;
        }
        .hero-orb-3 {
          position: absolute; bottom: 10%; right: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 65%);
          animation: orbPulse 10s ease-in-out infinite 4s;
          pointer-events: none;
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }
        .hero-content {
          position: relative; z-index: 2; max-width: 1000px;
          animation: heroEntrance 1s cubic-bezier(0.34,1.1,0.64,1) 0.2s both;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.3);
          padding: 7px 18px; border-radius: 100px;
          font-size: 13px; color: #c4b5fd;
          margin-bottom: 32px; font-weight: 500;
        }
        .eyebrow-dot { width:6px; height:6px; background:#8b5cf6; border-radius:50%; animation:blink 1.4s ease-in-out infinite; flex-shrink:0; }

        .hero-h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(52px, 9vw, 100px);
          font-weight: 700;
          letter-spacing: -4px;
          line-height: 0.95;
          margin-bottom: 28px;
        }
        .hero-h1 .line1 { display:block; color: #ffffff; }
        .hero-h1 .line2 {
          display: block;
          background: linear-gradient(135deg, #a78bfa 0%, #ec4899 45%, #f59e0b 90%);
          background-size: 200% 200%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease infinite;
        }

        .hero-sub {
          font-size: 19px; color: rgba(255,255,255,0.48);
          line-height: 1.75; max-width: 620px; margin: 0 auto 52px;
          font-weight: 400;
        }
        .hero-ctas {
          display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
          margin-bottom: 72px;
        }
        .btn-hero-primary {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white; border: none;
          padding: 18px 44px; border-radius: 14px;
          font-size: 16px; font-weight: 700;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
          transition: all 0.25s ease;
          box-shadow: 0 8px 40px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.15);
          letter-spacing: 0.2px;
          position: relative; overflow: hidden;
        }
        .btn-hero-primary::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity:0; transition:opacity 0.25s;
        }
        .btn-hero-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 56px rgba(139,92,246,0.75), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .btn-hero-primary:hover::before { opacity:1; }
        .btn-hero-secondary {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.14);
          padding: 18px 44px; border-radius: 14px;
          font-size: 16px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
          transition: all 0.25s ease;
          backdrop-filter: blur(10px);
        }
        .btn-hero-secondary:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        /* Trust strip */
        .hero-trust {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; flex-wrap: wrap;
        }
        .trust-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: rgba(255,255,255,0.3);
          font-weight: 500;
        }
        .trust-dot { width:3px; height:3px; background: rgba(139,92,246,0.6); border-radius:50%; }
        .trust-sep { color:rgba(255,255,255,0.1); margin:0 4px; }

        /* ═══════════════ MARQUEE ═══════════════ */
        .marquee-section {
          padding: 32px 0;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          overflow: hidden;
          position: relative;
        }
        .marquee-section::before, .marquee-section::after {
          content:''; position:absolute; top:0; bottom:0; width:200px; z-index:2;
        }
        .marquee-section::before { left:0; background:linear-gradient(90deg, #030008, transparent); }
        .marquee-section::after { right:0; background:linear-gradient(-90deg, #030008, transparent); }
        .marquee-track {
          display: flex; gap: 0;
          animation: marqueeLeft 30s linear infinite;
          width: max-content;
        }
        .marquee-item {
          display: flex; align-items: center; gap: 12px;
          padding: 0 40px;
          font-size: 13px; color: rgba(255,255,255,0.2);
          font-weight: 500; letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .marquee-icon { font-size:16px; }
        .marquee-divider { width:4px; height:4px; background:rgba(139,92,246,0.4); border-radius:50%; }

        /* ═══════════════ STATS ═══════════════ */
        .stats-section {
          display: flex; justify-content: center;
          flex-wrap: wrap;
          max-width: 960px; margin: 0 auto;
          padding: 80px 24px;
          gap: 0;
        }
        .stat-card {
          flex: 1; min-width: 180px;
          text-align: center;
          padding: 40px 32px;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: relative;
        }
        .stat-card:last-child { border-right:none; }
        .stat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 44px; font-weight: 700;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          display: block; line-height: 1;
        }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 8px; font-weight: 500; letter-spacing: 0.5px; }

        /* ═══════════════ EDITOR MOCKUP ═══════════════ */
        .preview-section { padding: 0 24px 120px; text-align:center; position:relative; }
        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 700; letter-spacing: 4px;
          text-transform: uppercase; color: var(--violet-light);
          margin-bottom: 16px;
        }
        .section-eyebrow::before, .section-eyebrow::after { content:''; width:28px; height:1px; background:rgba(139,92,246,0.5); }
        .section-h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(32px, 5vw, 60px);
          font-weight: 700; letter-spacing: -2px;
          margin-bottom: 16px; line-height: 1.05;
        }
        .section-p { font-size:17px; color:rgba(255,255,255,0.45); max-width:540px; margin:0 auto 56px; line-height:1.75; }

        .editor-frame {
          max-width: 1160px; margin: 0 auto;
          background: #0a0814;
          border: 1px solid rgba(139,92,246,0.18);
          border-radius: 22px; overflow: hidden;
          box-shadow:
            0 60px 160px rgba(0,0,0,0.95),
            0 0 0 1px rgba(139,92,246,0.07),
            0 0 200px rgba(139,92,246,0.07),
            inset 0 1px 0 rgba(139,92,246,0.1);
          animation: float 7s ease-in-out infinite;
        }
        .frame-titlebar {
          height: 46px;
          background: linear-gradient(180deg, #0d0a1a 0%, #080612 100%);
          border-bottom: 1px solid rgba(139,92,246,0.12);
          display: flex; align-items:center; padding: 0 16px; gap: 12px;
        }
        .frame-dots { display:flex; gap:7px; }
        .frame-dot { width:12px; height:12px; border-radius:50%; }
        .frame-dot-r { background: rgba(255,80,60,0.8); }
        .frame-dot-y { background: rgba(255,190,50,0.8); }
        .frame-dot-g { background: rgba(40,210,80,0.8); }
        .frame-breadcrumb {
          flex:1; display:flex; align-items:center; justify-content:center;
          gap:6px; font-size:11px; color:rgba(255,255,255,0.25);
        }
        .frame-body { display:flex; height:580px; }

        .frame-left-tools {
          width: 54px;
          background: #050310;
          border-right: 1px solid rgba(139,92,246,0.08);
          display: flex; flex-direction:column; align-items:center;
          padding: 14px 0; gap: 6px;
        }
        .frame-tool {
          width: 38px; height: 38px; border-radius: 9px;
          display: flex; align-items:center; justify-content:center;
          font-size: 15px; cursor:pointer;
          background: rgba(255,255,255,0.02);
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .frame-tool.active {
          background: rgba(139,92,246,0.2);
          border-color: rgba(139,92,246,0.35);
          box-shadow: 0 0 12px rgba(139,92,246,0.25);
        }

        .frame-canvas {
          flex: 1;
          background: #07050f;
          display: flex; align-items:center; justify-content:center;
          position: relative; overflow:hidden;
        }
        .frame-canvas-art {
          width: 70%; aspect-ratio: 16/10;
          border-radius: 10px; overflow:hidden;
          box-shadow: 0 0 0 1px rgba(139,92,246,0.2), 0 24px 80px rgba(0,0,0,0.7);
          position: relative;
        }
        .canvas-art-bg {
          width:100%; height:100%;
          background: linear-gradient(135deg, #1a0533 0%, #0d1a40 35%, #001a1f 65%, #1a0012 100%);
          position: relative;
        }
        .canvas-art-bg::before {
          content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 60% 80% at 30% 50%, rgba(139,92,246,0.5) 0%, transparent 55%),
            radial-gradient(ellipse 45% 65% at 75% 35%, rgba(6,182,212,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 55% 70% at 55% 80%, rgba(236,72,153,0.4) 0%, transparent 55%);
        }
        .canvas-art-label {
          position: absolute; inset:0;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          z-index:1;
        }
        .canvas-art-title {
          font-family:'Space Grotesk',sans-serif;
          font-size:22px; font-weight:700;
          background:linear-gradient(135deg,#a78bfa,#ec4899,#67e8f9);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          letter-spacing:-1px;
        }
        .canvas-art-sub { font-size:10px; color:rgba(255,255,255,0.25); margin-top:6px; letter-spacing:4px; text-transform:uppercase; }

        /* Floating adjustment chips */
        .canvas-chip {
          position: absolute;
          background: rgba(10,8,20,0.9);
          border: 1px solid rgba(139,92,246,0.25);
          border-radius: 8px; padding: 6px 10px;
          font-size: 10px; color: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
          white-space: nowrap;
        }
        .canvas-chip-val { color: #a78bfa; font-weight: 700; margin-left: 4px; }

        .frame-right-panel {
          width: 270px;
          background: #0a0814;
          border-left: 1px solid rgba(139,92,246,0.08);
          overflow: hidden;
        }
        .rp-tabs {
          display:flex; border-bottom: 1px solid rgba(139,92,246,0.1);
          padding: 0 8px; gap: 2px; padding-top: 8px;
        }
        .rp-tab {
          flex:1; padding:7px 6px; text-align:center;
          font-size:10px; font-weight:600;
          color:rgba(255,255,255,0.25); cursor:pointer;
          border-radius:6px 6px 0 0;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .rp-tab.active { color:#a78bfa; border-bottom-color:#8b5cf6; }
        .rp-body { padding: 12px; overflow:hidden; }
        .rp-section-label { font-size:8px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.2); margin: 10px 0 8px; }
        .rp-slider-row { margin-bottom:10px; }
        .rp-slider-header { display:flex; justify-content:space-between; font-size:10px; margin-bottom:5px; }
        .rp-slider-name { color:rgba(255,255,255,0.45); }
        .rp-slider-val { color:#a78bfa; font-weight:700; font-family:monospace; }
        .rp-track { height:3px; background:rgba(255,255,255,0.06); border-radius:2px; position:relative; }
        .rp-fill { height:100%; border-radius:2px; position:relative; }
        .rp-thumb { width:11px; height:11px; border-radius:50%; background:#fff; position:absolute; top:50%; transform:translate(-50%,-50%); box-shadow:0 0 0 2px rgba(139,92,246,0.6),0 2px 6px rgba(0,0,0,0.6); }
        .rp-histogram { height:48px; background:rgba(255,255,255,0.02); border-radius:6px; overflow:hidden; display:flex; align-items:flex-end; gap:1px; padding:4px; margin:10px 0; }
        .rp-hist-bar { flex:1; border-radius:1px 1px 0 0; }

        /* ═══════════════ FEATURES ═══════════════ */
        .features-section { padding: 120px 24px; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px; max-width: 1120px; margin: 0 auto;
        }
        .feature-card {
          background: rgba(255,255,255,0.018);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px; padding: 36px;
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
          cursor: default;
        }
        .feature-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent);
          opacity:0; transition:opacity 0.3s;
        }
        .feature-card::after {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse 100% 80% at 50% -10%, rgba(139,92,246,0.07) 0%, transparent 70%);
          opacity:0; transition:opacity 0.3s;
        }
        .feature-card:hover {
          border-color: rgba(139,92,246,0.3);
          transform: translateY(-6px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.08);
        }
        .feature-card:hover::before, .feature-card:hover::after { opacity:1; }
        .feature-icon-wrap {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items:center; justify-content:center;
          font-size: 26px; margin-bottom: 24px;
          position: relative; z-index:1;
        }
        .feature-title { font-size:20px; font-weight:700; margin-bottom:12px; letter-spacing:-0.3px; position:relative; z-index:1; }
        .feature-desc { font-size:14px; color:rgba(255,255,255,0.45); line-height:1.75; position:relative; z-index:1; }
        .feature-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:20px; position:relative; z-index:1; }
        .feat-tag {
          font-size:10px; font-weight:600; padding:3px 10px; border-radius:6px;
          background:rgba(139,92,246,0.1); color:#c4b5fd;
          border: 1px solid rgba(139,92,246,0.2);
        }
        .feat-tag-new { background:rgba(245,158,11,0.1); color:#fbbf24; border-color:rgba(245,158,11,0.3); }

        /* ═══════════════ AI SECTION ═══════════════ */
        .ai-section {
          padding: 120px 24px;
          background: linear-gradient(180deg, transparent, rgba(139,92,246,0.04) 50%, transparent);
          position: relative;
        }
        .ai-inner { max-width: 1080px; margin: 0 auto; }
        .ai-grid { display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; }
        .ai-features { display:flex; flex-direction:column; gap:14px; }
        .ai-feat {
          display:flex; gap:18px; padding:22px;
          border-radius:18px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.25s;
          cursor:default;
        }
        .ai-feat:hover {
          border-color: rgba(139,92,246,0.35);
          background: rgba(139,92,246,0.05);
          transform: translateX(5px);
        }
        .ai-feat-icon {
          width:48px; height:48px; border-radius:14px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:22px;
          border: 1px solid rgba(139,92,246,0.2);
        }
        .ai-feat-title { font-size:14px; font-weight:700; margin-bottom:5px; }
        .ai-feat-desc { font-size:12px; color:rgba(255,255,255,0.4); line-height:1.6; }

        .ai-visual {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(139,92,246,0.18);
          border-radius: 28px; padding:40px;
          text-align:center; position:relative; overflow:hidden;
        }
        .ai-visual::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.1), transparent);
        }
        .ai-orb-container { position:relative; z-index:1; margin:0 auto 28px; width:140px; height:140px; }
        .ai-orb-ring {
          position:absolute; inset:0; border-radius:50%;
          border: 2px solid transparent;
          background: linear-gradient(#0a0814,#0a0814) padding-box,
                      conic-gradient(from 0deg, #8b5cf6, #ec4899, #06b6d4, #f59e0b, #8b5cf6) border-box;
          animation: spinRing 6s linear infinite;
        }
        .ai-orb-ring-2 {
          position:absolute; inset:16px; border-radius:50%;
          border: 1px solid rgba(236,72,153,0.3);
          animation: spinRing 10s linear infinite reverse;
        }
        .ai-orb-core {
          position:absolute; inset:24px; border-radius:50%;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          display:flex; align-items:center; justify-content:center;
          font-size:36px;
          box-shadow: 0 0 40px rgba(139,92,246,0.7), 0 0 80px rgba(236,72,153,0.3);
          animation: orbPulse 4s ease-in-out infinite;
        }
        .ai-visual-title { font-size:24px; font-weight:700; letter-spacing:-0.5px; position:relative; z-index:1; margin-bottom:8px; }
        .ai-visual-sub { font-size:13px; color:rgba(255,255,255,0.35); position:relative; z-index:1; line-height:1.6; }
        .ai-chips { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:22px; position:relative; z-index:1; }
        .ai-chip {
          font-size:11px; padding:5px 14px; border-radius:100px; font-weight:600;
          background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.28); color:#c4b5fd;
        }

        /* ═══════════════ WORKFLOW ═══════════════ */
        .workflow-section { padding:120px 24px; position:relative; }
        .steps-row {
          display:flex; gap:0; max-width:1000px; margin:0 auto; position:relative;
        }
        .steps-row::before {
          content:''; position:absolute; top:40px; left:12%; right:12%; height:1px;
          background:linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(236,72,153,0.3), rgba(6,182,212,0.3), transparent);
        }
        .step-item { flex:1; text-align:center; padding:0 20px; }
        .step-icon-wrap {
          width:80px; height:80px; border-radius:24px; margin:0 auto 22px;
          background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.08));
          border:1px solid rgba(139,92,246,0.3);
          display:flex; align-items:center; justify-content:center; font-size:30px;
          position:relative; z-index:1;
          transition: all 0.3s;
        }
        .step-item:hover .step-icon-wrap {
          background:linear-gradient(135deg,rgba(139,92,246,0.3),rgba(236,72,153,0.15));
          box-shadow:0 8px 32px rgba(139,92,246,0.3);
          transform:translateY(-4px);
        }
        .step-title { font-size:16px; font-weight:700; margin-bottom:8px; }
        .step-desc { font-size:13px; color:rgba(255,255,255,0.38); line-height:1.65; }

        /* ═══════════════ CTA ═══════════════ */
        .cta-section {
          padding:140px 24px; text-align:center; position:relative; overflow:hidden;
        }
        .cta-orb {
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:700px; height:500px;
          background: radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, rgba(236,72,153,0.08) 50%, transparent 70%);
          pointer-events:none;
          animation:orbPulse 8s ease-in-out infinite;
        }
        .cta-content { position:relative; z-index:1; }
        .cta-h2 {
          font-family:'Space Grotesk',sans-serif;
          font-size:clamp(40px,7vw,76px); font-weight:700; letter-spacing:-3px;
          line-height:1; margin-bottom:20px;
        }
        .cta-sub { font-size:19px; color:rgba(255,255,255,0.45); margin-bottom:48px; max-width:520px; margin-left:auto; margin-right:auto; line-height:1.65; }
        .cta-btns { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }

        /* ═══════════════ FOOTER ═══════════════ */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 48px;
          display:flex; justify-content:space-between; align-items:center;
          flex-wrap:wrap; gap:20px;
          color:rgba(255,255,255,0.22); font-size:13px;
          position: relative;
        }
        .footer::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(139,92,246,0.3),rgba(236,72,153,0.2),transparent);
        }
        .footer-brand { display:flex; align-items:center; gap:10px; }
        .footer-brand-icon {
          width:30px; height:30px; border-radius:8px;
          background:linear-gradient(135deg,#8b5cf6,#ec4899);
          display:flex; align-items:center; justify-content:center;
          font-weight:900; font-size:13px; color:white;
        }
        .footer-links { display:flex; gap:24px; }
        .footer-links a { color:rgba(255,255,255,0.22); text-decoration:none; transition:color 0.2s; }
        .footer-links a:hover { color:rgba(255,255,255,0.65); }

        @media(max-width:768px) {
          .navbar { padding:12px 20px; }
          .nav-links { display:none; }
          .ai-grid { grid-template-columns:1fr; gap:40px; }
          .steps-row { flex-direction:column; gap:36px; }
          .steps-row::before { display:none; }
          .frame-right-panel { display:none; }
          .hero-h1 { letter-spacing:-2px; }
          .footer { flex-direction:column; text-align:center; padding:32px 24px; }
          .stat-card { border-right:none; border-bottom:1px solid rgba(255,255,255,0.05); padding:28px; }
        }
      `}</style>

      {/* ═════════════════════════════ INTRO SEQUENCE ═════════════════════════════ */}
      <div className="landing-intro" ref={introRef}>
        <canvas className="intro-canvas" ref={canvasRef} />
        <div className="intro-scan-line" />

        <div className="intro-content">
          {/* Logo ring */}
          <div className="intro-logo-ring">
            <div className="intro-ring-1" />
            <div className="intro-ring-2" />
            <div className="intro-ring-3" />
            <div className="intro-logo-inner">
              <span className="intro-logo-symbol">✦</span>
            </div>
          </div>

          {/* Brand text */}
          <div className="intro-text-block">
            <div className="intro-brand">ProEditor</div>
            <div className="intro-tagline">Professional · AI-Powered · Browser-Native</div>
          </div>

          {/* Loading bar */}
          <div className="intro-loading-area">
            <div className="intro-progress-track">
              <div className="intro-progress-fill" />
            </div>
            <div className="intro-loading-text">Initializing Neural Engine...</div>
          </div>
        </div>
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
          <div className="hero-orb-1" />
          <div className="hero-orb-2" />
          <div className="hero-orb-3" />
          <div className="hero-grid" />

          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              Now with Content-Aware Fill, AI Upscale & 8K Support
            </div>

            <h1 className="hero-h1">
              <span className="line1">Create Without</span>
              <span className="line2">Limits.</span>
            </h1>

            <p className="hero-sub">
              The world's most powerful browser-based photo &amp; video editor.
              Real pixel-level AI tools, professional color science, and
              cinematic-grade effects — no install, no subscription.
            </p>

            <div className="hero-ctas">
              <button onClick={launchEditor} className="btn-hero-primary">
                <span>🚀</span>
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
              ["🎨","Advanced Color Grading"],["⚡","AI Neural Engine"],["🔮","Frequency Separation"],
              ["🎬","Video Editor"],["🤖","Smart Object Removal"],["📐","Perspective Correction"],
              ["🌈","Color Harmony"],["🎭","Double Exposure"],["📸","RAW Processing"],
              ["✨","Glitch Art Generator"],["🔲","Layer Masking"],["🏔","HDR Tone Mapping"],
              ["🎨","Advanced Color Grading"],["⚡","AI Neural Engine"],["🔮","Frequency Separation"],
              ["🎬","Video Editor"],["🤖","Smart Object Removal"],["📐","Perspective Correction"],
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
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
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
        <section className="preview-section" id="preview" style={{ paddingTop: "100px" }}>
          <div className="section-eyebrow">The Interface</div>
          <h2 className="section-h2">Professional. Powerful. <span style={{ background:"linear-gradient(135deg,#a78bfa,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Precise.</span></h2>
          <p className="section-p">Every pixel, every slider, every tool — designed for professionals who demand perfection.</p>

          <div className="editor-frame">
            {/* Titlebar */}
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
                <span style={{fontSize:"10px",color:"rgba(139,92,246,0.6)",fontWeight:"600",letterSpacing:"0.5px"}}>✦ AI ACTIVE</span>
              </div>
            </div>

            {/* Body */}
            <div className="frame-body">
              {/* Left tools */}
              <div className="frame-left-tools">
                {["↖","✂","🖌","🪄","⟳","T","⬛","◎"].map((icon, i) => (
                  <div key={i} className={`frame-tool ${i === 2 ? "active" : ""}`}>{icon}</div>
                ))}
                <div style={{flex:1}} />
                {["🎭","✨","📐"].map((icon, i) => (
                  <div key={i} className="frame-tool">{icon}</div>
                ))}
              </div>

              {/* Canvas */}
              <div className="frame-canvas">
                <div className="frame-canvas-art">
                  <div className="canvas-art-bg">
                    <div className="canvas-art-label">
                      <div className="canvas-art-title">Mountain Landscape</div>
                      <div className="canvas-art-sub">8192 × 5461 · RAW · 32-bit</div>
                    </div>
                  </div>
                </div>

                {/* Floating info chips */}
                <div className="canvas-chip" style={{top:"18px",left:"80px"}}>
                  Exposure<span className="canvas-chip-val">+0.8</span>
                </div>
                <div className="canvas-chip" style={{top:"18px",right:"290px"}}>
                  AI Denoise<span className="canvas-chip-val" style={{color:"#34d399"}}>Active</span>
                </div>
                <div className="canvas-chip" style={{bottom:"22px",left:"90px"}}>
                  Zoom<span className="canvas-chip-val">100%</span>
                </div>
              </div>

              {/* Right panel */}
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
                        <div className="rp-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}55,${color})` }} />
                        <div className="rp-thumb" style={{ left:`${pct}%`, boxShadow:`0 0 0 2px ${color}88,0 2px 6px rgba(0,0,0,0.6)` }} />
                      </div>
                    </div>
                  ))}
                  <div className="rp-section-label">Histogram</div>
                  <div className="rp-histogram">
                    {[8,14,20,32,48,60,72,80,72,64,52,44,36,28,20,16,12,10,8,6].map((h, i) => (
                      <div key={i} className="rp-hist-bar" style={{ height:`${h*1.2}%`, background:`rgba(${[139,92,246].join(",")},${0.3+i/30})` }} />
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
                        <div className="rp-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}55,${color})` }} />
                        <div className="rp-thumb" style={{ left:`${pct}%`, boxShadow:`0 0 0 2px ${color}88,0 2px 6px rgba(0,0,0,0.6)` }} />
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
            <h2 className="section-h2">Everything You Need to <span style={{background:"linear-gradient(135deg,#a78bfa,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Create.</span></h2>
            <p className="section-p">Professional-grade tools that were once locked behind expensive desktop software — now in your browser.</p>
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
            <div style={{textAlign:"center",marginBottom:"72px"}}>
              <div className="section-eyebrow">Artificial Intelligence</div>
              <h2 className="section-h2">The Future of <span style={{background:"linear-gradient(135deg,#a78bfa,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Editing is Here.</span></h2>
              <p className="section-p">Every AI tool runs entirely in your browser using WebGL acceleration. No data leaves your device.</p>
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
          <div style={{textAlign:"center",marginBottom:"72px"}}>
            <div className="section-eyebrow">How It Works</div>
            <h2 className="section-h2">From Upload to <span style={{background:"linear-gradient(135deg,#a78bfa,#f59e0b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Masterpiece.</span></h2>
            <p className="section-p">A seamless workflow designed for speed, precision, and creative freedom.</p>
          </div>

          <div className="steps-row">
            {[
              { icon:"📂", title:"Open Any File", desc:"Drag & drop images, videos, or RAW files. Supports JPG, PNG, WebP, HEIC, NEF, CR2, ARW, and more." },
              { icon:"🎛️", title:"Edit with Precision", desc:"50+ panels, AI tools, color grading, layers, masking — every professional tool at your fingertips." },
              { icon:"🤖", title:"Enhance with AI", desc:"One click to remove objects, enhance portraits, upscale resolution, or apply neural style transfer." },
              { icon:"📤", title:"Export Flawlessly", desc:"Export to PNG, JPEG, WebP, or print-ready PDF. Batch export with custom presets and watermarking." },
            ].map(({ icon, title, desc }) => (
              <div className="step-item" key={title}>
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
          <div className="cta-content">
            <h2 className="cta-h2">
              Ready to Edit Like<br />
              <span style={{background:"linear-gradient(135deg,#a78bfa,#ec4899,#f59e0b)",backgroundSize:"200% 200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradientShift 4s ease infinite"}}>
                a Legend?
              </span>
            </h2>
            <p className="cta-sub">
              No account. No download. No credit card. Just open and start creating — professional results in minutes.
            </p>
            <div className="cta-btns">
              <button onClick={launchEditor} className="btn-hero-primary" style={{fontSize:"18px",padding:"20px 52px"}}>
                <span>🚀</span> Launch ProEditor Free
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-brand">
            <div className="footer-brand-icon">✦</div>
            <span style={{color:"rgba(255,255,255,0.4)"}}>ProEditor v4.0 · Browser-Native AI Photo &amp; Video Editor</span>
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
