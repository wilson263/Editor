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

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
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

      const n2 = ctx.createRadialGradient(W * 0.7, H * 0.6, 0, W * 0.7, H * 0.6, W * 0.25);
      n2.addColorStop(0, "rgba(236,72,153,0.08)");
      n2.addColorStop(1, "transparent");
      ctx.fillStyle = n2; ctx.fillRect(0, 0, W, H);

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
        :root { --violet:#8b5cf6; --violet-dark:#6d28d9; --violet-light:#a78bfa; --pink:#ec4899; --cyan:#06b6d4; --orange:#f97316; }
        html { scroll-behavior: smooth; }
        .landing-intro { position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity 0.8s ease;overflow:hidden; }
        .landing-intro canvas { position:absolute;inset:0;width:100%;height:100%; }
        .intro-logo { position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:20px;animation:introReveal 1s ease 0.5s both; }
        .intro-logo-icon { width:90px;height:90px;border-radius:24px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;color:white;box-shadow:0 0 60px rgba(139,92,246,0.6),0 0 120px rgba(236,72,153,0.3);animation:logoPulse 2s ease-in-out infinite; }
        .intro-title { font-size:52px;font-weight:900;letter-spacing:-2px;background:linear-gradient(135deg,#fff 0%,#a78bfa 50%,#ec4899 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center; }
        .intro-subtitle { font-size:15px;color:rgba(255,255,255,0.45);letter-spacing:5px;text-transform:uppercase;text-align:center; }
        .intro-progress { width:220px;height:2px;background:rgba(255,255,255,0.08);border-radius:1px;overflow:hidden;margin-top:48px; }
        .intro-progress-bar { height:100%;width:0%;background:linear-gradient(90deg,#8b5cf6,#ec4899);border-radius:1px;animation:progressFill 2.5s ease forwards 0.5s; }
        @keyframes introReveal { from{opacity:0;transform:translateY(30px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes logoPulse { 0%,100%{box-shadow:0 0 60px rgba(139,92,246,0.6),0 0 120px rgba(236,72,153,0.3)} 50%{box-shadow:0 0 90px rgba(139,92,246,0.9),0 0 180px rgba(236,72,153,0.5)} }
        @keyframes progressFill { to{width:100%} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroTitle { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbSpin { to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 48px;background:rgba(5,5,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(139,92,246,0.12); }
        .nav-logo { display:flex;align-items:center;gap:12px; }
        .nav-logo-icon { width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:white; }
        .nav-logo-text { font-size:18px;font-weight:800;letter-spacing:-0.5px; }
        .nav-badge { font-size:9px;font-weight:700;background:rgba(139,92,246,0.2);color:var(--violet-light);border:1px solid rgba(139,92,246,0.35);padding:2px 8px;border-radius:6px;letter-spacing:1px;text-transform:uppercase; }
        .nav-links { display:flex;gap:32px; }
        .nav-links a { color:rgba(255,255,255,0.55);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s; }
        .nav-links a:hover { color:white; }
        .btn-launch { background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:white;border:none;padding:10px 22px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;box-shadow:0 4px 20px rgba(139,92,246,0.35); }
        .btn-launch:hover { transform:translateY(-1px);box-shadow:0 6px 30px rgba(139,92,246,0.6); }
        .hero { min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden; }
        .hero-bg { position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(139,92,246,0.18) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(236,72,153,0.1) 0%,transparent 50%),radial-gradient(ellipse 40% 30% at 20% 60%,rgba(6,182,212,0.07) 0%,transparent 50%); }
        .hero-grid { position:absolute;inset:0;z-index:0;background-image:linear-gradient(rgba(139,92,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.05) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%); }
        .hero-content { position:relative;z-index:1;max-width:960px; }
        .hero-badge { display:inline-flex;align-items:center;gap:8px;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);padding:6px 18px;border-radius:100px;font-size:13px;color:var(--violet-light);margin-bottom:36px;animation:slideDown 0.6s ease both;font-weight:500; }
        .hero-badge-dot { width:6px;height:6px;background:var(--violet);border-radius:50%;animation:blink 1.5s ease-in-out infinite;flex-shrink:0; }
        .hero-title { font-size:clamp(52px,9vw,96px);font-weight:900;letter-spacing:-4px;line-height:1.0;margin-bottom:28px;animation:heroTitle 0.8s ease 0.1s both; }
        .gradient-text { background:linear-gradient(135deg,#a78bfa 0%,#ec4899 50%,#f97316 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .hero-desc { font-size:20px;color:rgba(255,255,255,0.52);line-height:1.75;max-width:640px;margin:0 auto 52px;animation:heroTitle 0.8s ease 0.2s both; }
        .hero-actions { display:flex;gap:16px;justify-content:center;flex-wrap:wrap;animation:heroTitle 0.8s ease 0.3s both; }
        .btn-primary { background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:white;border:none;padding:17px 38px;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s ease;text-decoration:none;box-shadow:0 8px 32px rgba(139,92,246,0.45);display:inline-flex;align-items:center;gap:10px; }
        .btn-primary:hover { transform:translateY(-2px);box-shadow:0 16px 48px rgba(139,92,246,0.65); }
        .btn-secondary { background:rgba(255,255,255,0.05);color:white;border:1px solid rgba(255,255,255,0.15);padding:17px 38px;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s ease;text-decoration:none;display:inline-flex;align-items:center;gap:10px;backdrop-filter:blur(10px); }
        .btn-secondary:hover { background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.25); }
        .hero-trust { display:flex;align-items:center;justify-content:center;gap:32px;margin-top:56px;animation:heroTitle 0.8s ease 0.4s both; }
        .hero-trust-item { display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,0.35);font-weight:500; }
        .hero-trust-dot { width:4px;height:4px;background:rgba(139,92,246,0.6);border-radius:50%;flex-shrink:0; }
        .stats { display:flex;gap:0;justify-content:center;flex-wrap:wrap;padding:0;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05); }
        .stat { text-align:center;padding:40px 48px;border-right:1px solid rgba(255,255,255,0.05);flex:1;min-width:160px; }
        .stat:last-child { border-right:none; }
        .stat-number { font-size:40px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-2px; }
        .stat-label { font-size:12px;color:rgba(255,255,255,0.38);margin-top:6px;font-weight:500;letter-spacing:0.5px; }
        .preview-section { padding:110px 24px;text-align:center;position:relative; }
        .section-label { font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--violet-light);margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px; }
        .section-label::before,.section-label::after { content:'';width:32px;height:1px;background:rgba(139,92,246,0.4); }
        .section-title { font-size:clamp(32px,5vw,60px);font-weight:900;letter-spacing:-2px;margin-bottom:16px;line-height:1.05; }
        .section-desc { font-size:18px;color:rgba(255,255,255,0.48);max-width:560px;margin:0 auto 64px;line-height:1.7; }
        .editor-mockup { max-width:1100px;margin:0 auto;background:#0d0d1f;border:1px solid rgba(139,92,246,0.2);border-radius:20px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.9),0 0 0 1px rgba(139,92,246,0.08),0 0 120px rgba(139,92,246,0.08);animation:float 6s ease-in-out infinite; }
        .mockup-topbar { height:44px;background:#070710;border-bottom:1px solid rgba(139,92,246,0.1);display:flex;align-items:center;padding:0 16px;gap:12px; }
        .mockup-dots { display:flex;gap:6px; }
        .mockup-dot { width:12px;height:12px;border-radius:50%; }
        .mockup-body { display:flex;height:520px; }
        .mockup-sidebar { width:52px;background:#05050f;border-right:1px solid rgba(139,92,246,0.08);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:4px; }
        .mockup-tool { width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;transition:background 0.15s; }
        .mockup-tool:hover,.mockup-tool.active { background:rgba(139,92,246,0.2); }
        .mockup-canvas { flex:1;background:#0a0a18;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden; }
        .canvas-demo { width:72%;aspect-ratio:16/10;border-radius:8px;overflow:hidden;position:relative;box-shadow:0 0 0 1px rgba(139,92,246,0.2),0 20px 60px rgba(0,0,0,0.5); }
        .canvas-demo-img { width:100%;height:100%;background:linear-gradient(135deg,#1a0533 0%,#0d1a33 30%,#001a1a 60%,#1a000d 100%);position:relative;display:flex;align-items:center;justify-content:center; }
        .canvas-demo-img::after { content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 30% 50%,rgba(139,92,246,0.35) 0%,transparent 60%),radial-gradient(ellipse 40% 60% at 70% 40%,rgba(6,182,212,0.22) 0%,transparent 50%),radial-gradient(ellipse 50% 70% at 50% 80%,rgba(236,72,153,0.25) 0%,transparent 50%); }
        .canvas-demo-text { position:relative;z-index:1;text-align:center; }
        .canvas-demo-title { font-size:26px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-1px; }
        .canvas-demo-sub { font-size:11px;color:rgba(255,255,255,0.3);margin-top:8px;letter-spacing:3px;text-transform:uppercase; }
        .canvas-ruler { position:absolute; }
        .canvas-ruler-h { top:0;left:0;right:0;height:18px;background:rgba(5,5,15,0.9);border-bottom:1px solid rgba(139,92,246,0.1); }
        .canvas-ruler-v { left:0;top:0;bottom:0;width:18px;background:rgba(5,5,15,0.9);border-right:1px solid rgba(139,92,246,0.1); }
        .mockup-panel { width:260px;background:#0d0d1f;border-left:1px solid rgba(139,92,246,0.08);padding:0;overflow:hidden; }
        .panel-header { padding:12px 14px;border-bottom:1px solid rgba(139,92,246,0.1);font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:space-between; }
        .panel-tabs { display:flex;border-bottom:1px solid rgba(139,92,246,0.08); }
        .panel-tab { flex:1;padding:8px;font-size:9px;text-align:center;color:rgba(255,255,255,0.3);cursor:pointer;border-bottom:2px solid transparent; }
        .panel-tab.active { color:#a78bfa;border-bottom-color:#8b5cf6; }
        .panel-body { padding:12px; }
        .panel-section-title { font-size:8px;text-transform:uppercase;letter-spacing:3px;color:rgba(255,255,255,0.25);margin:10px 0 8px; }
        .slider-row { display:flex;flex-direction:column;gap:4px;margin-bottom:10px; }
        .slider-labels { display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,0.4); }
        .slider-labels span:last-child { color:rgba(139,92,246,0.8);font-weight:600; }
        .slider-track { height:3px;background:rgba(255,255,255,0.07);border-radius:2px;position:relative;cursor:pointer; }
        .slider-fill { height:100%;border-radius:2px; }
        .slider-thumb { width:10px;height:10px;border-radius:50%;background:white;position:absolute;top:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 2px rgba(139,92,246,0.5),0 2px 4px rgba(0,0,0,0.5); }
        .features { padding:110px 24px; }
        .features-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;max-width:1100px;margin:0 auto; }
        .feature-card { background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:32px;transition:all 0.3s ease;position:relative;overflow:hidden;cursor:pointer; }
        .feature-card::before { content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(139,92,246,0.06) 0%,transparent 70%);opacity:0;transition:opacity 0.3s; }
        .feature-card:hover { border-color:rgba(139,92,246,0.35);transform:translateY(-5px);background:rgba(139,92,246,0.03); }
        .feature-card:hover::before { opacity:1; }
        .feature-icon { font-size:36px;margin-bottom:20px;display:block; }
        .feature-title { font-size:19px;font-weight:800;margin-bottom:10px;letter-spacing:-0.3px; }
        .feature-desc { font-size:14px;color:rgba(255,255,255,0.48);line-height:1.75; }
        .feature-tags { display:flex;flex-wrap:wrap;gap:6px;margin-top:20px; }
        .feature-tag { font-size:10px;font-weight:600;padding:3px 9px;border-radius:6px;background:rgba(139,92,246,0.1);color:var(--violet-light);border:1px solid rgba(139,92,246,0.2); }
        .new-tag { background:rgba(249,115,22,0.1);color:#fb923c;border-color:rgba(249,115,22,0.3) !important; }
        .ai-section { padding:110px 24px;position:relative;overflow:hidden;background:linear-gradient(180deg,transparent 0%,rgba(139,92,246,0.04) 50%,transparent 100%); }
        .ai-grid { display:grid;grid-template-columns:1fr 1fr;gap:64px;max-width:1040px;margin:0 auto;align-items:center; }
        .ai-list { display:flex;flex-direction:column;gap:12px; }
        .ai-item { display:flex;gap:16px;padding:20px;border-radius:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);transition:all 0.2s ease;cursor:pointer; }
        .ai-item:hover { border-color:rgba(139,92,246,0.3);background:rgba(139,92,246,0.05);transform:translateX(4px); }
        .ai-item-icon { width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(236,72,153,0.1));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid rgba(139,92,246,0.2); }
        .ai-item-title { font-size:14px;font-weight:700;margin-bottom:4px; }
        .ai-item-desc { font-size:12px;color:rgba(255,255,255,0.42);line-height:1.55; }
        .ai-visual { background:rgba(255,255,255,0.02);border:1px solid rgba(139,92,246,0.15);border-radius:24px;padding:36px;text-align:center;position:relative;overflow:hidden; }
        .ai-visual::before { content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 30%,rgba(139,92,246,0.08),transparent); }
        .ai-orb { width:120px;height:120px;border-radius:50%;margin:0 auto 24px;background:conic-gradient(from 0deg,#8b5cf6,#ec4899,#06b6d4,#f97316,#8b5cf6);display:flex;align-items:center;justify-content:center;animation:orbSpin 8s linear infinite;box-shadow:0 0 60px rgba(139,92,246,0.5),0 0 120px rgba(236,72,153,0.2);position:relative;z-index:1; }
        .ai-orb-inner { width:92px;height:92px;border-radius:50%;background:#0d0d1f;display:flex;align-items:center;justify-content:center;font-size:38px; }
        .ai-visual-title { font-size:22px;font-weight:900;margin-bottom:8px;position:relative;z-index:1;letter-spacing:-0.5px; }
        .ai-visual-desc { font-size:13px;color:rgba(255,255,255,0.38);position:relative;z-index:1;line-height:1.6; }
        .ai-chips { display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:20px;position:relative;z-index:1; }
        .ai-chip { font-size:11px;padding:5px 12px;border-radius:100px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);color:var(--violet-light);font-weight:600; }
        .workflow-section { padding:110px 24px;position:relative; }
        .workflow-steps { display:flex;gap:0;max-width:1000px;margin:0 auto;position:relative; }
        .workflow-steps::before { content:'';position:absolute;top:40px;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,0.3),rgba(236,72,153,0.3),transparent); }
        .workflow-step { flex:1;text-align:center;padding:0 20px; }
        .step-number { width:80px;height:80px;border-radius:24px;background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.08));border:1px solid rgba(139,92,246,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px;position:relative;z-index:1; }
        .step-title { font-size:16px;font-weight:700;margin-bottom:8px; }
        .step-desc { font-size:13px;color:rgba(255,255,255,0.42);line-height:1.6; }
        .cta-section { padding:130px 24px;text-align:center;position:relative;overflow:hidden; }
        .cta-bg { position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(139,92,246,0.14) 0%,transparent 70%); }
        .cta-content { position:relative;z-index:1; }
        .cta-title { font-size:clamp(40px,7vw,72px);font-weight:900;letter-spacing:-3px;margin-bottom:20px;line-height:1.0; }
        .cta-desc { font-size:19px;color:rgba(255,255,255,0.48);margin-bottom:52px;line-height:1.6; }
        .cta-actions { display:flex;gap:16px;justify-content:center;flex-wrap:wrap; }
        footer { border-top:1px solid rgba(255,255,255,0.05);padding:48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;color:rgba(255,255,255,0.28);font-size:13px; }
        .footer-logo { display:flex;align-items:center;gap:10px; }
        .footer-logo-icon { width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:white; }
        .footer-links { display:flex;gap:24px; }
        .footer-links a { color:rgba(255,255,255,0.28);text-decoration:none;transition:color 0.2s; }
        .footer-links a:hover { color:rgba(255,255,255,0.7); }
        @media(max-width:768px) { nav{padding:12px 20px;} .nav-links{display:none;} .ai-grid{grid-template-columns:1fr;} .workflow-steps{flex-direction:column;gap:32px;} .workflow-steps::before{display:none;} footer{flex-direction:column;text-align:center;} .hero-title{letter-spacing:-2px;} .mockup-panel{display:none;} .stat{padding:28px 24px;} }
      `}</style>

      {/* INTRO */}
      <div className="landing-intro" ref={introRef} style={{ transition: "opacity 0.8s ease" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        <div className="intro-logo">
          <div className="intro-logo-icon">✦</div>
          <div className="intro-title">ProEditor</div>
          <div className="intro-subtitle">Professional · AI-Powered · Browser-Based</div>
          <div className="intro-progress"><div className="intro-progress-bar" /></div>
        </div>
      </div>

      {/* MAIN SITE */}
      <div ref={siteRef} style={{ opacity: 0, transition: "opacity 0.8s ease" }}>

        {/* NAV */}
        <nav>
          <div className="nav-logo">
            <div className="nav-logo-icon">✦</div>
            <span className="nav-logo-text">ProEditor</span>
            <span className="nav-badge">PRO v4</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#ai">AI Tools</a>
            <a href="#workflow">Workflow</a>
            <a href="#editor">Preview</a>
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
              Now with Content-Aware Fill, Noise Reduction & 5 New Panels
            </div>
            <h1 className="hero-title">
              Edit Like a<br />
              <span className="gradient-text">Professional.</span>
            </h1>
            <p className="hero-desc">
              The world's most powerful browser-based photo and video editor. Real pixel-level AI tools,
              professional color grading, 8K support, and everything you need to create stunning visuals — no install required.
            </p>
            <div className="hero-actions">
              <button onClick={launchEditor} className="btn-primary">
                <span>🚀</span> Start Editing Free
              </button>
              <a href="#features" className="btn-secondary">
                <span>✦</span> Explore Features
              </a>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item"><span className="hero-trust-dot" />No account required</div>
              <div className="hero-trust-item"><span className="hero-trust-dot" />100% browser-based</div>
              <div className="hero-trust-item"><span className="hero-trust-dot" />8K export support</div>
              <div className="hero-trust-item"><span className="hero-trust-dot" />AI-powered tools</div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats">
          <div className="stat"><div className="stat-number">8K</div><div className="stat-label">Max Resolution</div></div>
          <div className="stat"><div className="stat-number">50+</div><div className="stat-label">Pro Tools</div></div>
          <div className="stat"><div className="stat-number">48+</div><div className="stat-label">Filters & LUTs</div></div>
          <div className="stat"><div className="stat-number">29</div><div className="stat-label">Editing Panels</div></div>
          <div className="stat"><div className="stat-number">∞</div><div className="stat-label">Undo History</div></div>
          <div className="stat"><div className="stat-number">AI</div><div className="stat-label">Smart Tools</div></div>
        </div>

        {/* EDITOR PREVIEW */}
        <section className="preview-section" id="editor">
          <div className="section-label">Live Preview</div>
          <h2 className="section-title">A <span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Studio-Grade</span> Editor</h2>
          <p className="section-desc">Everything you need in one place — built for photographers, filmmakers, and content creators.</p>

          <div className="editor-mockup">
            <div className="mockup-topbar">
              <div className="mockup-dots">
                <div className="mockup-dot" style={{ background: "#ff5f57" }} />
                <div className="mockup-dot" style={{ background: "#febc2e" }} />
                <div className="mockup-dot" style={{ background: "#28c840" }} />
              </div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>ProEditor v4 · Professional Photo &amp; Video Editor · 8K Ready</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 9, color: "rgba(139,92,246,0.6)", fontWeight: 700, background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 4 }}>AI READY</div>
              </div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                {["↖", "✂", "🖌", "✦", "T", "■", "⚡", "🤖", "🎨", "📐", "🔍"].map((icon, i) => (
                  <div key={i} className={`mockup-tool${i === 0 ? " active" : ""}`}>{icon}</div>
                ))}
              </div>
              <div className="mockup-canvas">
                <div className="canvas-ruler canvas-ruler-h" />
                <div className="canvas-ruler canvas-ruler-v" />
                <div className="canvas-demo">
                  <div className="canvas-demo-img">
                    <div className="canvas-demo-text">
                      <div className="canvas-demo-title">8K Canvas Ready</div>
                      <div className="canvas-demo-sub">Pro · AI · Real-time</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mockup-panel">
                <div className="panel-header">
                  <span>Adjustments</span>
                  <span style={{ fontSize: 9, color: "rgba(139,92,246,0.6)" }}>+ 28 more panels</span>
                </div>
                <div className="panel-tabs">
                  {["Light", "Color", "Detail", "Lens"].map((t, i) => (
                    <div key={t} className={`panel-tab${i === 0 ? " active" : ""}`}>{t}</div>
                  ))}
                </div>
                <div className="panel-body">
                  <div className="panel-section-title">LIGHT & TONE</div>
                  {[
                    ["Exposure", "+0.3", "57%", "linear-gradient(90deg,#8b5cf6,#a78bfa)"],
                    ["Contrast", "+20", "70%", "linear-gradient(90deg,#8b5cf6,#a78bfa)"],
                    ["Highlights", "-35", "32%", "linear-gradient(90deg,#f59e0b,#8b5cf6)"],
                    ["Shadows", "+15", "65%", "linear-gradient(90deg,#6d28d9,#8b5cf6)"],
                    ["Whites", "+10", "60%", "linear-gradient(90deg,#8b5cf6,#e5e5e5)"],
                  ].map(([label, val, w, bg]) => (
                    <div key={label} className="slider-row">
                      <div className="slider-labels"><span>{label}</span><span>{val}</span></div>
                      <div className="slider-track">
                        <div className="slider-fill" style={{ width: w, background: bg }} />
                        <div className="slider-thumb" style={{ left: w }} />
                      </div>
                    </div>
                  ))}
                  <div className="panel-section-title">COLOR</div>
                  {[
                    ["Saturation", "+25", "75%", "linear-gradient(90deg,#ec4899,#f97316)"],
                    ["Temperature", "+8", "58%", "linear-gradient(90deg,#06b6d4,#f59e0b)"],
                    ["Vibrance", "+18", "68%", "linear-gradient(90deg,#8b5cf6,#ec4899)"],
                  ].map(([label, val, w, bg]) => (
                    <div key={label} className="slider-row">
                      <div className="slider-labels"><span>{label}</span><span>{val}</span></div>
                      <div className="slider-track">
                        <div className="slider-fill" style={{ width: w, background: bg }} />
                        <div className="slider-thumb" style={{ left: w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <button onClick={launchEditor} className="btn-primary" style={{ margin: "0 auto" }}>
              Open the Editor →
            </button>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features" id="features">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-label">Capabilities</div>
            <h2 className="section-title">Every Tool You Need</h2>
            <p className="section-desc">From basic adjustments to advanced professional features — all in your browser, all for free.</p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: "📸",
                title: "Professional Photo Editing",
                desc: "Complete adjustment panel with exposure, brightness, contrast, highlights, shadows, whites, blacks, tone curves, and more — all non-destructive.",
                tags: ["8K Export", "Non-Destructive", "Tone Curves"],
              },
              {
                icon: "🎬",
                title: "Advanced Video Editing",
                desc: "Multi-track timeline with trim, cut, split, merge, speed control, transitions, keyframe animations, and audio mixing in one integrated editor.",
                tags: ["Multi-Track", "Keyframes", "4K/8K"],
              },
              {
                icon: "🎨",
                title: "Professional Color Grading",
                desc: "Interactive tone curves, full HSL color mixer, cinematic LUTs, color wheels for shadows/midtones/highlights, and split toning.",
                tags: ["Tone Curves", "HSL Mixer", "LUTs", "Split Tone"],
              },
              {
                icon: "✨",
                title: "48+ Filters & Film Emulation",
                desc: "48+ professional filters including cinematic, vintage, noir, film emulations (Portra, Velvia, Kodachrome), and custom presets.",
                tags: ["48+ Filters", "Film Emulation", "Presets"],
              },
              {
                icon: "🔲",
                title: "Layers & Blending",
                desc: "Full layer system with 20 blend modes, opacity control, visibility toggle, reordering, duplication, and non-destructive adjustment layers.",
                tags: ["20 Blend Modes", "Unlimited Layers", "Groups"],
              },
              {
                icon: "🔮",
                title: "Content-Aware Fill",
                desc: "Intelligent background filling that samples surrounding pixels to seamlessly remove objects, people, or unwanted elements from your photos.",
                tags: ["NEW", "AI-Powered", "Object Removal"],
                isNew: true,
              },
              {
                icon: "🧹",
                title: "Real Noise Reduction",
                desc: "True pixel-level noise reduction with bilateral filter, median filter, and controllable detail preservation for both luminance and color noise.",
                tags: ["NEW", "Pixel-Level", "Bilateral Filter"],
                isNew: true,
              },
              {
                icon: "📐",
                title: "Geometry & Lens Correction",
                desc: "Perspective correction (vertical/horizontal), lens distortion, chromatic aberration reduction, defringe, and vignette control with presets.",
                tags: ["NEW", "Perspective", "Lens Correction"],
                isNew: true,
              },
              {
                icon: "🗺",
                title: "Navigator Minimap",
                desc: "Interactive minimap showing your full canvas with a viewport indicator. Quick zoom presets, smooth pan controls, and one-click navigation.",
                tags: ["NEW", "Minimap", "Pan & Zoom"],
                isNew: true,
              },
              {
                icon: "📤",
                title: "Smart Export Panel",
                desc: "Social media presets (Instagram, Twitter, YouTube, LinkedIn), print sizes, custom dimensions, quality control, and one-click export.",
                tags: ["NEW", "Social Presets", "Print Sizes"],
                isNew: true,
              },
              {
                icon: "🤖",
                title: "AI-Powered Tools",
                desc: "Background removal, auto-enhance, subject detection, face retouch, sky replacement, object recognition, and smart crop suggestions.",
                tags: ["Background Remove", "Auto-Enhance", "Face Retouch"],
              },
              {
                icon: "🖋",
                title: "Text & Typography",
                desc: "Rich text editor with 15+ fonts, custom sizes, colors, alignment, letter spacing, line height, shadows, outlines, and blend modes.",
                tags: ["15+ Fonts", "Shadows", "Outlines"],
              },
            ].map(({ icon, title, desc, tags, isNew }) => (
              <div key={title} className="feature-card">
                <span className="feature-icon">{icon}</span>
                <div className="feature-title">{title}</div>
                <div className="feature-desc">{desc}</div>
                <div className="feature-tags">
                  {tags.map((t) => (
                    <span key={t} className={`feature-tag${t === "NEW" || isNew && t === tags[0] ? " new-tag" : ""}`}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section className="workflow-section" id="workflow">
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div className="section-label">Workflow</div>
            <h2 className="section-title">From Upload to <span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Masterpiece</span></h2>
            <p className="section-desc">A seamless workflow designed for creative professionals.</p>
          </div>
          <div className="workflow-steps">
            {[
              { emoji: "📁", title: "Import", desc: "Drag & drop photos, videos, or start fresh with a blank canvas in any resolution up to 8K." },
              { emoji: "✦", title: "Adjust", desc: "Use 29 specialized panels to perfect color, tone, detail, and composition with precision." },
              { emoji: "🤖", title: "AI Enhance", desc: "Apply AI-powered tools — remove backgrounds, reduce noise, or do content-aware fill in seconds." },
              { emoji: "📤", title: "Export", desc: "Export to social media presets, print sizes, or custom dimensions in PNG, JPEG, or WebP." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="workflow-step">
                <div className="step-number">{emoji}</div>
                <div className="step-title">{title}</div>
                <div className="step-desc">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* AI SECTION */}
        <section className="ai-section" id="ai">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-label">Artificial Intelligence</div>
            <h2 className="section-title">AI-Powered <span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Magic</span></h2>
            <p className="section-desc">Machine learning tools that do the heavy lifting so you can focus on creativity.</p>
          </div>
          <div className="ai-grid">
            <div className="ai-list">
              {[
                { icon: "✂️", title: "AI Background Remover", desc: "Remove backgrounds from photos and videos with one click — works for people, objects, and complex scenes." },
                { icon: "⚡", title: "Auto Enhance", desc: "One tap gives your photo a professional look — AI analyzes and adjusts color, sharpness, and lighting." },
                { icon: "👤", title: "Face Retouch & Beauty", desc: "Smooth skin, remove blemishes, enhance eyes and lips with AI-powered portrait retouching." },
                { icon: "🧹", title: "Noise Reduction", desc: "Real pixel-level bilateral filtering removes grain and noise while preserving fine detail and texture." },
                { icon: "🔮", title: "Content-Aware Fill", desc: "Seamlessly remove objects or people from photos — AI fills the gap with realistic background content." },
                { icon: "🌅", title: "Sky Replacement", desc: "Detect and replace skies automatically — choose from multiple sky options or use your own." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="ai-item">
                  <div className="ai-item-icon">{icon}</div>
                  <div>
                    <div className="ai-item-title">{title}</div>
                    <div className="ai-item-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ai-visual">
              <div className="ai-orb">
                <div className="ai-orb-inner">✦</div>
              </div>
              <div className="ai-visual-title">AI Intelligence</div>
              <div className="ai-visual-desc">Cutting-edge machine learning models running directly in your browser — no data leaves your device.</div>
              <div className="ai-chips">
                <span className="ai-chip">Background Removal</span>
                <span className="ai-chip">Face Detection</span>
                <span className="ai-chip">Smart Select</span>
                <span className="ai-chip">Noise Reduction</span>
                <span className="ai-chip">Content-Aware</span>
                <span className="ai-chip">Auto Enhance</span>
                <span className="ai-chip">Sky Replace</span>
                <span className="ai-chip">Object Remove</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-bg" />
          <div className="cta-content">
            <h2 className="cta-title">
              Start Creating<br /><span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Today.</span>
            </h2>
            <p className="cta-desc">
              No sign-up. No install. Just open and start editing with the<br />most powerful browser-based editor ever built.
            </p>
            <div className="cta-actions">
              <button onClick={launchEditor} className="btn-primary" style={{ fontSize: 18, padding: "20px 48px" }}>
                <span>🚀</span> Launch ProEditor — It's Free
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">
            <div className="footer-logo-icon">✦</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>ProEditor</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>Professional Photo & Video Editor v4.0</div>
            </div>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#ai">AI Tools</a>
            <a href="#workflow">Workflow</a>
            <a href="#editor">Preview</a>
          </div>
          <div style={{ fontSize: 12 }}>
            Built with ✦ for creators everywhere · {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
}
