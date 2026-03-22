import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);

  function launchEditor() {
    navigate("/editor");
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, animFrame = 0;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }[] = [];
    const colors = ["#8b5cf6", "#ec4899", "#06b6d4", "#a78bfa", "#f97316"];

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let rings: { r: number; alpha: number }[] = [{ r: 0, alpha: 0.6 }, { r: 0, alpha: 0.4 }];
    let ringTimer = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      grad.addColorStop(0, "#0a0020");
      grad.addColorStop(0.5, "#050010");
      grad.addColorStop(1, "#000000");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const n1 = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.3);
      n1.addColorStop(0, "rgba(139,92,246,0.12)");
      n1.addColorStop(1, "transparent");
      ctx.fillStyle = n1; ctx.fillRect(0, 0, W, H);

      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
          p.x = Math.random() * W; p.y = Math.random() * H;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ringTimer++;
      if (ringTimer % 60 === 0) rings.unshift({ r: 0, alpha: 0.5 });
      rings = rings.filter((ring) => ring.alpha > 0);
      rings.forEach((ring) => {
        ring.r += 2; ring.alpha -= 0.003;
        ctx.save();
        ctx.globalAlpha = Math.max(0, ring.alpha);
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      animFrame = requestAnimationFrame(draw);
    }
    draw();

    const timer = setTimeout(() => {
      if (introRef.current) introRef.current.style.opacity = "0";
      if (introRef.current) introRef.current.style.pointerEvents = "none";
      if (siteRef.current) siteRef.current.style.opacity = "1";
      setTimeout(() => {
        if (introRef.current) introRef.current.style.display = "none";
      }, 800);
    }, 3000);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ background: "#05050f", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        :root { --violet:#8b5cf6; --violet-dark:#6d28d9; --violet-light:#a78bfa; --pink:#ec4899; --cyan:#06b6d4; }
        html { scroll-behavior: smooth; }
        .landing-intro { position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity 0.8s ease;overflow:hidden; }
        .landing-intro canvas { position:absolute;inset:0;width:100%;height:100%; }
        .intro-logo { position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:20px;animation:introReveal 1s ease 0.5s both; }
        .intro-logo-icon { width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:white;box-shadow:0 0 60px rgba(139,92,246,0.6),0 0 120px rgba(236,72,153,0.3);animation:logoPulse 2s ease-in-out infinite; }
        .intro-title { font-size:48px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,#fff 0%,#a78bfa 50%,#ec4899 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center; }
        .intro-subtitle { font-size:16px;color:rgba(255,255,255,0.5);letter-spacing:4px;text-transform:uppercase;text-align:center; }
        .intro-progress { width:200px;height:2px;background:rgba(255,255,255,0.1);border-radius:1px;overflow:hidden;margin-top:40px; }
        .intro-progress-bar { height:100%;width:0%;background:linear-gradient(90deg,#8b5cf6,#ec4899);border-radius:1px;animation:progressFill 2.5s ease forwards 0.5s; }
        @keyframes introReveal { from{opacity:0;transform:translateY(30px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes logoPulse { 0%,100%{box-shadow:0 0 60px rgba(139,92,246,0.6),0 0 120px rgba(236,72,153,0.3)} 50%{box-shadow:0 0 80px rgba(139,92,246,0.9),0 0 160px rgba(236,72,153,0.5)} }
        @keyframes progressFill { to{width:100%} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroTitle { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbSpin { to{transform:rotate(360deg)} }
        nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 48px;background:rgba(5,5,15,0.8);backdrop-filter:blur(20px);border-bottom:1px solid rgba(139,92,246,0.1); }
        .nav-logo { display:flex;align-items:center;gap:12px; }
        .nav-logo-icon { width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px; }
        .nav-logo-text { font-size:18px;font-weight:700; }
        .nav-badge { font-size:9px;font-weight:700;background:rgba(139,92,246,0.2);color:var(--violet-light);border:1px solid rgba(139,92,246,0.3);padding:2px 6px;border-radius:4px;letter-spacing:1px; }
        .nav-links { display:flex;gap:32px; }
        .nav-links a { color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;transition:color 0.2s; }
        .nav-links a:hover { color:white; }
        .btn-launch { background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:white;border:none;padding:10px 24px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;text-decoration:none;box-shadow:0 4px 20px rgba(139,92,246,0.4); }
        .btn-launch:hover { transform:translateY(-1px);box-shadow:0 6px 30px rgba(139,92,246,0.6); }
        .hero { min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden; }
        .hero-bg { position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(139,92,246,0.15) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(236,72,153,0.08) 0%,transparent 50%),radial-gradient(ellipse 40% 30% at 20% 60%,rgba(6,182,212,0.06) 0%,transparent 50%); }
        .hero-grid { position:absolute;inset:0;z-index:0;background-image:linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%); }
        .hero-content { position:relative;z-index:1;max-width:900px; }
        .hero-badge { display:inline-flex;align-items:center;gap:8px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);padding:6px 16px;border-radius:100px;font-size:13px;color:var(--violet-light);margin-bottom:32px;animation:slideDown 0.6s ease both; }
        .hero-badge-dot { width:6px;height:6px;background:var(--violet);border-radius:50%;animation:blink 1.5s ease-in-out infinite; }
        .hero-title { font-size:clamp(48px,8vw,88px);font-weight:900;letter-spacing:-3px;line-height:1.0;margin-bottom:24px;animation:heroTitle 0.8s ease 0.1s both; }
        .gradient-text { background:linear-gradient(135deg,#a78bfa 0%,#ec4899 50%,#f97316 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .hero-desc { font-size:20px;color:rgba(255,255,255,0.55);line-height:1.7;max-width:620px;margin:0 auto 48px;animation:heroTitle 0.8s ease 0.2s both; }
        .hero-actions { display:flex;gap:16px;justify-content:center;flex-wrap:wrap;animation:heroTitle 0.8s ease 0.3s both; }
        .btn-primary { background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:white;border:none;padding:16px 36px;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s ease;text-decoration:none;box-shadow:0 8px 32px rgba(139,92,246,0.4);display:inline-flex;align-items:center;gap:10px; }
        .btn-primary:hover { transform:translateY(-2px);box-shadow:0 12px 48px rgba(139,92,246,0.6); }
        .btn-secondary { background:rgba(255,255,255,0.05);color:white;border:1px solid rgba(255,255,255,0.15);padding:16px 36px;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s ease;text-decoration:none;display:inline-flex;align-items:center;gap:10px;backdrop-filter:blur(10px); }
        .btn-secondary:hover { background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.25); }
        .stats { display:flex;gap:48px;justify-content:center;flex-wrap:wrap;padding:48px 24px;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05); }
        .stat { text-align:center; }
        .stat-number { font-size:36px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .stat-label { font-size:13px;color:rgba(255,255,255,0.4);margin-top:4px; }
        .preview-section { padding:100px 24px;text-align:center;position:relative; }
        .section-label { font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--violet-light);margin-bottom:16px; }
        .section-title { font-size:clamp(32px,5vw,56px);font-weight:800;letter-spacing:-1px;margin-bottom:16px;line-height:1.1; }
        .section-desc { font-size:18px;color:rgba(255,255,255,0.5);max-width:560px;margin:0 auto 60px; }
        .editor-mockup { max-width:1100px;margin:0 auto;background:#0d0d1f;border:1px solid rgba(139,92,246,0.2);border-radius:20px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.8),0 0 0 1px rgba(139,92,246,0.1),0 0 80px rgba(139,92,246,0.1); }
        .mockup-topbar { height:44px;background:#070710;border-bottom:1px solid rgba(139,92,246,0.1);display:flex;align-items:center;padding:0 16px;gap:12px; }
        .mockup-dots { display:flex;gap:6px; }
        .mockup-dot { width:12px;height:12px;border-radius:50%; }
        .mockup-body { display:flex;height:500px; }
        .mockup-sidebar { width:52px;background:#05050f;border-right:1px solid rgba(139,92,246,0.08);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:4px; }
        .mockup-tool { width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;transition:background 0.15s; }
        .mockup-tool:hover,.mockup-tool.active { background:rgba(139,92,246,0.2); }
        .mockup-canvas { flex:1;background:#0a0a18;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden; }
        .canvas-demo { width:70%;aspect-ratio:16/10;border-radius:8px;overflow:hidden;position:relative;box-shadow:0 0 0 1px rgba(139,92,246,0.2); }
        .canvas-demo-img { width:100%;height:100%;background:linear-gradient(135deg,#1a0533 0%,#0d1a33 30%,#001a1a 60%,#1a000d 100%);position:relative;display:flex;align-items:center;justify-content:center; }
        .canvas-demo-img::after { content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 30% 50%,rgba(139,92,246,0.3) 0%,transparent 60%),radial-gradient(ellipse 40% 60% at 70% 40%,rgba(6,182,212,0.2) 0%,transparent 50%),radial-gradient(ellipse 50% 70% at 50% 80%,rgba(236,72,153,0.2) 0%,transparent 50%); }
        .canvas-demo-text { position:relative;z-index:1;text-align:center;font-size:28px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .mockup-panel { width:260px;background:#0d0d1f;border-left:1px solid rgba(139,92,246,0.08);padding:16px;overflow:hidden; }
        .panel-title { font-size:11px;font-weight:600;color:rgba(255,255,255,0.8);margin-bottom:12px; }
        .panel-section-title { font-size:9px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);margin:12px 0 8px; }
        .slider-row { display:flex;flex-direction:column;gap:4px;margin-bottom:8px; }
        .slider-labels { display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,0.4); }
        .slider-track { height:3px;background:rgba(255,255,255,0.08);border-radius:2px;position:relative; }
        .slider-fill { height:100%;border-radius:2px; }
        .slider-thumb { width:12px;height:12px;border-radius:50%;background:white;position:absolute;top:50%;transform:translateY(-50%);box-shadow:0 0 0 2px rgba(139,92,246,0.4); }
        .features { padding:100px 24px; }
        .features-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;max-width:1100px;margin:0 auto; }
        .feature-card { background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:32px;transition:all 0.3s ease;position:relative;overflow:hidden; }
        .feature-card:hover { border-color:rgba(139,92,246,0.3);transform:translateY(-4px); }
        .feature-icon { font-size:36px;margin-bottom:20px;display:block; }
        .feature-title { font-size:20px;font-weight:700;margin-bottom:10px; }
        .feature-desc { font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7; }
        .feature-tags { display:flex;flex-wrap:wrap;gap:6px;margin-top:16px; }
        .feature-tag { font-size:10px;font-weight:600;padding:3px 8px;border-radius:6px;background:rgba(139,92,246,0.1);color:var(--violet-light);border:1px solid rgba(139,92,246,0.2); }
        .ai-section { padding:100px 24px;position:relative;overflow:hidden;background:linear-gradient(180deg,transparent 0%,rgba(139,92,246,0.03) 50%,transparent 100%); }
        .ai-grid { display:grid;grid-template-columns:1fr 1fr;gap:60px;max-width:1000px;margin:0 auto;align-items:center; }
        .ai-list { display:flex;flex-direction:column;gap:16px; }
        .ai-item { display:flex;gap:16px;padding:20px;border-radius:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);transition:all 0.2s ease; }
        .ai-item:hover { border-color:rgba(139,92,246,0.3);background:rgba(139,92,246,0.05); }
        .ai-item-icon { width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(236,72,153,0.1));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid rgba(139,92,246,0.2); }
        .ai-item-title { font-size:15px;font-weight:700;margin-bottom:4px; }
        .ai-item-desc { font-size:13px;color:rgba(255,255,255,0.45);line-height:1.5; }
        .ai-visual { background:rgba(255,255,255,0.02);border:1px solid rgba(139,92,246,0.15);border-radius:24px;padding:32px;text-align:center;position:relative;overflow:hidden; }
        .ai-orb { width:120px;height:120px;border-radius:50%;margin:0 auto 24px;background:conic-gradient(from 0deg,#8b5cf6,#ec4899,#06b6d4,#8b5cf6);display:flex;align-items:center;justify-content:center;animation:orbSpin 8s linear infinite;box-shadow:0 0 60px rgba(139,92,246,0.5);position:relative;z-index:1; }
        .ai-orb-inner { width:90px;height:90px;border-radius:50%;background:#0d0d1f;display:flex;align-items:center;justify-content:center;font-size:36px; }
        .ai-visual-title { font-size:20px;font-weight:800;margin-bottom:8px;position:relative;z-index:1; }
        .ai-visual-desc { font-size:13px;color:rgba(255,255,255,0.4);position:relative;z-index:1; }
        .ai-chips { display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:20px;position:relative;z-index:1; }
        .ai-chip { font-size:11px;padding:5px 12px;border-radius:100px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);color:var(--violet-light);font-weight:600; }
        .cta-section { padding:120px 24px;text-align:center;position:relative;overflow:hidden; }
        .cta-bg { position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(139,92,246,0.12) 0%,transparent 70%); }
        .cta-content { position:relative;z-index:1; }
        .cta-title { font-size:clamp(36px,6vw,64px);font-weight:900;letter-spacing:-2px;margin-bottom:20px; }
        .cta-desc { font-size:18px;color:rgba(255,255,255,0.5);margin-bottom:48px; }
        .cta-actions { display:flex;gap:16px;justify-content:center;flex-wrap:wrap; }
        footer { border-top:1px solid rgba(255,255,255,0.05);padding:48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;color:rgba(255,255,255,0.3);font-size:14px; }
        .footer-logo { display:flex;align-items:center;gap:10px; }
        .footer-logo-icon { width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:white; }
        @media(max-width:768px) { nav{padding:12px 20px;} .nav-links{display:none;} .ai-grid{grid-template-columns:1fr;} footer{flex-direction:column;text-align:center;} .hero-title{letter-spacing:-1px;} .mockup-panel{display:none;} }
      `}</style>

      {/* INTRO */}
      <div
        className="landing-intro"
        ref={introRef}
        style={{ transition: "opacity 0.8s ease" }}
      >
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        <div className="intro-logo">
          <div className="intro-logo-icon">P</div>
          <div className="intro-title">ProEditor</div>
          <div className="intro-subtitle">Professional Photo &amp; Video Editing</div>
          <div className="intro-progress"><div className="intro-progress-bar" /></div>
        </div>
      </div>

      {/* MAIN SITE */}
      <div ref={siteRef} style={{ opacity: 0, transition: "opacity 0.8s ease" }}>

        {/* NAV */}
        <nav>
          <div className="nav-logo">
            <div className="nav-logo-icon">P</div>
            <span className="nav-logo-text">ProEditor</span>
            <span className="nav-badge">PRO</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#ai">AI Tools</a>
            <a href="#editor">Editor</a>
          </div>
          <button onClick={launchEditor} className="btn-launch">Launch Editor →</button>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Now with 8K Resolution &amp; AI Tools
            </div>
            <h1 className="hero-title">
              Edit Like a<br />
              <span className="gradient-text">Professional.</span>
            </h1>
            <p className="hero-desc">
              The most powerful browser-based photo and video editor. AI-powered tools,
              color grading, 8K support, and everything you need to create stunning visuals.
            </p>
            <div className="hero-actions">
              <button onClick={launchEditor} className="btn-primary">
                <span>🚀</span> Start Editing Free
              </button>
              <a href="#features" className="btn-secondary">
                <span>▶</span> See Features
              </a>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats">
          <div className="stat"><div className="stat-number">8K</div><div className="stat-label">Max Resolution</div></div>
          <div className="stat"><div className="stat-number">50+</div><div className="stat-label">Pro Tools</div></div>
          <div className="stat"><div className="stat-number">48+</div><div className="stat-label">Filters & LUTs</div></div>
          <div className="stat"><div className="stat-number">AI</div><div className="stat-label">Powered Editing</div></div>
          <div className="stat"><div className="stat-number">∞</div><div className="stat-label">Layers</div></div>
        </div>

        {/* EDITOR PREVIEW */}
        <section className="preview-section" id="editor">
          <div className="section-label">Live Preview</div>
          <h2 className="section-title">A <span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Studio-Grade</span> Editor</h2>
          <p className="section-desc">Everything you need in one place — built for photographers, filmmakers, and creators.</p>

          <div className="editor-mockup">
            <div className="mockup-topbar">
              <div className="mockup-dots">
                <div className="mockup-dot" style={{ background: "#ff5f57" }} />
                <div className="mockup-dot" style={{ background: "#febc2e" }} />
                <div className="mockup-dot" style={{ background: "#28c840" }} />
              </div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>ProEditor — Professional Photo &amp; Video Editor</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                {["↖", "✂", "🖌", "T", "■", "⚡", "🤖"].map((icon, i) => (
                  <div key={i} className={`mockup-tool${i === 0 ? " active" : ""}`}>{icon}</div>
                ))}
              </div>
              <div className="mockup-canvas">
                <div className="canvas-demo">
                  <div className="canvas-demo-img">
                    <div className="canvas-demo-text">8K Canvas Ready</div>
                  </div>
                </div>
              </div>
              <div className="mockup-panel">
                <div className="panel-title">Adjustments</div>
                <div className="panel-section-title">LIGHT</div>
                {[["Exposure", "+0.3", "55%", "linear-gradient(90deg,#8b5cf6,#a78bfa)"], ["Contrast", "+15", "65%", "linear-gradient(90deg,#8b5cf6,#a78bfa)"], ["Highlights", "-20", "40%", "linear-gradient(90deg,#8b5cf6,#ec4899)"], ["Shadows", "+10", "60%", "linear-gradient(90deg,#6d28d9,#8b5cf6)"]].map(([label, val, w, bg]) => (
                  <div key={label} className="slider-row">
                    <div className="slider-labels"><span>{label}</span><span>{val}</span></div>
                    <div className="slider-track"><div className="slider-fill" style={{ width: w, background: bg }} /><div className="slider-thumb" style={{ left: w }} /></div>
                  </div>
                ))}
                <div className="panel-section-title">COLOR</div>
                {[["Saturation", "+25", "75%", "linear-gradient(90deg,#ec4899,#f97316)"], ["Temperature", "+8", "58%", "linear-gradient(90deg,#06b6d4,#f59e0b)"]].map(([label, val, w, bg]) => (
                  <div key={label} className="slider-row">
                    <div className="slider-labels"><span>{label}</span><span>{val}</span></div>
                    <div className="slider-track"><div className="slider-fill" style={{ width: w, background: bg }} /><div className="slider-thumb" style={{ left: w }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <button onClick={launchEditor} className="btn-primary" style={{ margin: "0 auto" }}>
              Open the Editor →
            </button>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features" id="features">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-label">Capabilities</div>
            <h2 className="section-title">Every Tool You Need</h2>
            <p className="section-desc">From basic adjustments to advanced professional features — all in your browser.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: "📸", title: "Professional Photo Editing", desc: "Crop, resize, rotate, flip. Full adjustment panel with exposure, brightness, contrast, highlights, shadows, and more.", tags: ["RAW Support", "8K Export", "Lossless"] },
              { icon: "🎬", title: "Advanced Video Editing", desc: "Multi-track timeline, trim/cut/split/merge clips, speed control, transitions, keyframe animations, and audio mixing.", tags: ["Multi-Track", "Keyframes", "4K/8K"] },
              { icon: "🎨", title: "Color Grading", desc: "Tone curves, HSL color mixing, cinematic LUTs, color wheels for shadows/midtones/highlights, and RAW color processing.", tags: ["Tone Curves", "HSL", "LUTs"] },
              { icon: "✨", title: "Filters & Presets", desc: "48+ professional filters including cinematic, vintage, noir, warm, cool, and more. Create and save custom presets.", tags: ["48+ Filters", "Presets", "Instagram-Style"] },
              { icon: "⬛", title: "Layers & Blending", desc: "Full layer system with 12 blend modes, opacity control, visibility toggle, and layer ordering — just like Photoshop.", tags: ["12 Blend Modes", "Opacity", "Non-Destructive"] },
              { icon: "🖋", title: "Text & Typography", desc: "Rich text editor with 15+ fonts, size, color, alignment, letter spacing, shadows, outlines, and blend modes.", tags: ["15+ Fonts", "Shadows", "Outlines"] },
            ].map(({ icon, title, desc, tags }) => (
              <div key={title} className="feature-card">
                <span className="feature-icon">{icon}</span>
                <div className="feature-title">{title}</div>
                <div className="feature-desc">{desc}</div>
                <div className="feature-tags">{tags.map((t) => <span key={t} className="feature-tag">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* AI SECTION */}
        <section className="ai-section" id="ai">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-label">Artificial Intelligence</div>
            <h2 className="section-title">AI-Powered <span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Magic</span></h2>
            <p className="section-desc">Machine learning tools that do the heavy lifting for you.</p>
          </div>
          <div className="ai-grid">
            <div className="ai-list">
              {[
                { icon: "✂️", title: "AI Background Remover", desc: "Remove backgrounds from photos and videos with one click — works for people, objects, and complex scenes." },
                { icon: "⚡", title: "Auto Enhance", desc: "One tap gives your photo a professional look — AI adjusts color, sharpness, and lighting automatically." },
                { icon: "👤", title: "Face Retouch & Beauty", desc: "Smooth skin, remove blemishes, enhance eyes and lips with AI-powered face detection." },
                { icon: "🪄", title: "Object Removal & Replace", desc: "Paint over any object to erase it. AI intelligently fills in the background like magic." },
                { icon: "🔍", title: "AI Upscale to 8K", desc: "Super-resolution AI upscales any photo to 8K while preserving and enhancing detail." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="ai-item">
                  <div className="ai-item-icon">{icon}</div>
                  <div><div className="ai-item-title">{title}</div><div className="ai-item-desc">{desc}</div></div>
                </div>
              ))}
            </div>
            <div className="ai-visual">
              <div className="ai-orb"><div className="ai-orb-inner">🤖</div></div>
              <div className="ai-visual-title">AI Engine</div>
              <div className="ai-visual-desc">Powered by advanced machine learning models running entirely in your browser — no data leaves your device.</div>
              <div className="ai-chips">
                {["Background Removal", "Face Detection", "Super Resolution", "Object Segmentation", "Auto Color", "Noise Reduction"].map((c) => (
                  <span key={c} className="ai-chip">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-bg" />
          <div className="cta-content">
            <h2 className="cta-title">Ready to create<br /><span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>something amazing?</span></h2>
            <p className="cta-desc">Join creators who use ProEditor to make professional-grade photos and videos.</p>
            <div className="cta-actions">
              <button onClick={launchEditor} className="btn-primary">🚀 Launch ProEditor — It's Free</button>
              <a href="#features" className="btn-secondary">📖 Learn More</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">
            <div className="footer-logo-icon">P</div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>ProEditor</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>— Professional Photo &amp; Video Editor</span>
          </div>
          <div>© 2026 ProEditor · Built with ❤️ · 8K Ready</div>
        </footer>
      </div>
    </div>
  );
}
