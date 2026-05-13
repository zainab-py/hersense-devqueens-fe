import { useRef, useEffect, useCallback } from 'react';
import { useHerSenseStore, CyclePhase } from '@/stores/useHerSenseStore';

const PHASE_COLORS: Record<CyclePhase, { r: number; g: number; b: number }> = {
  menstrual: { r: 220, g: 80, b: 100 },
  follicular: { r: 60, g: 180, b: 110 },
  ovulation: { r: 240, g: 190, b: 50 },
  luteal: { r: 140, g: 90, b: 210 },
};

interface Particle {
  x: number; y: number; vx: number; vy: number;
  baseX: number; baseY: number;
  size: number; alpha: number;
}

const NeuralCore = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const { cyclePhase, stress, energy } = useHerSenseStore();

  const initParticles = useCallback((w: number, h: number) => {
    const cx = w / 2, cy = h / 2;
    const count = 120;
    particles.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.min(w, h) * 0.35;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      return {
        x, y, vx: 0, vy: 0,
        baseX: x, baseY: y,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.7,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouse.current = { x: -1000, y: -1000 }; };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleLeave);

    let time = 0;
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      ctx.clearRect(0, 0, w, h);
      time += 0.01;

      const color = PHASE_COLORS[cyclePhase];
      const stressF = stress / 100;
      const energyF = energy / 100;
      const speed = 0.3 + stressF * 1.5;
      const glow = 0.3 + energyF * 0.7;

      // Draw connections
      const pts = particles.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15 * glow;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & draw particles
      for (const p of pts) {
        const breathe = Math.sin(time * 1.5) * 3;
        const dx = p.baseX - p.x + Math.sin(time + p.baseX * 0.01) * speed * 8;
        const dy = p.baseY - p.y + Math.cos(time + p.baseY * 0.01) * speed * 8 + breathe;
        p.vx += dx * 0.015;
        p.vy += dy * 0.015;
        p.vx *= 0.92;
        p.vy *= 0.92;

        // Mouse interaction
        const mx = mouse.current.x - p.x;
        const my = mouse.current.y - p.y;
        const md = Math.sqrt(mx * mx + my * my);
        if (md < 120) {
          const force = (120 - md) / 120;
          p.vx -= (mx / md) * force * 2;
          p.vy -= (my / md) * force * 2;
        }

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${p.alpha * glow})`);
        gradient.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${p.alpha * glow})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central glow
      const cx = w / 2, cy = h / 2;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.25);
      const pulse = 0.08 + Math.sin(time * 2) * 0.04;
      coreGrad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${pulse * glow})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [cyclePhase, stress, energy, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      style={{ touchAction: 'none' }}
    />
  );
};

export default NeuralCore;
