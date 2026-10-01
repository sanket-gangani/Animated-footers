import { useEffect, useRef } from 'react';

/*
 * The breeze over the footer's hillside: small flower petals, in the
 * painting's own blues, whites and peaches, carried left to right low over
 * the grass, and warm pollen motes rising slowly through the sunset light.
 * One 2D canvas; it only runs while `active`, and draws nothing otherwise.
 */

const PETAL_COLOURS = ['#FFFFFF', '#E6EDFF', '#A9C1F5', '#7F9FE8', '#FAD2B4', '#F7B99A'];

type Petal = {
  x: number;
  y: number;
  size: number;
  speed: number;
  bob: number;
  bobFreq: number;
  phase: number;
  rot: number;
  spin: number;
  flip: number;
  flipSpeed: number;
  colour: string;
  alpha: number;
};

type Mote = { x: number; y: number; r: number; rise: number; drift: number; phase: number; twinkle: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makePetal(w: number, h: number, anywhere: boolean): Petal {
  return {
    x: anywhere ? rand(0, w) : rand(-60, -10),
    // Low over the hill: the lower half of the scene.
    y: rand(h * 0.45, h * 0.98),
    size: rand(2.5, 6.5),
    speed: rand(0.5, 1.5),
    bob: rand(0.2, 0.7),
    bobFreq: rand(0.6, 1.4),
    phase: rand(0, Math.PI * 2),
    rot: rand(0, Math.PI * 2),
    spin: rand(-0.04, 0.04),
    flip: rand(0, Math.PI * 2),
    flipSpeed: rand(0.03, 0.07),
    colour: PETAL_COLOURS[Math.floor(Math.random() * PETAL_COLOURS.length)],
    alpha: rand(0.55, 0.95),
  };
}

function makeMote(w: number, h: number, anywhere: boolean): Mote {
  return {
    // Gathered toward the sunlit right half, where the light falls.
    x: rand(w * 0.3, w),
    y: anywhere ? rand(h * 0.35, h) : rand(h * 0.85, h * 1.05),
    r: rand(0.8, 2.2),
    rise: rand(0.12, 0.35),
    drift: rand(0.05, 0.25),
    phase: rand(0, Math.PI * 2),
    twinkle: rand(0.02, 0.05),
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  const s = p.size;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(Math.max(0.2, Math.abs(Math.cos(p.flip))), 1);
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.colour;
  ctx.beginPath();
  // A simple rounded petal, wider at the tip.
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(s * 0.9, s * 0.4, s * 0.8, -s * 0.9, 0, -s);
  ctx.bezierCurveTo(-s * 0.8, -s * 0.9, -s * 0.9, s * 0.4, 0, s);
  ctx.fill();
  ctx.restore();
}

export function FooterBreeze({
  active,
  night = false,
  className = '',
}: {
  active: boolean;
  /** Fireflies instead of petals and pollen. */
  night?: boolean;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box || !active) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let petals: Petal[] = [];
    let motes: Mote[] = [];

    const resize = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = w * h;
      petals = night
        ? []
        : Array.from({ length: Math.round(Math.min(34, Math.max(10, area / 30000))) }, () => makePetal(w, h, true));
      motes = Array.from({ length: Math.round(Math.min(40, Math.max(12, area / 25000))) }, () => makeMote(w, h, true));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      const t = now / 1000;
      // Gusts: the breeze rises and falls on a slow cycle.
      const gust = 1 + Math.sin(t * 0.5) * 0.45 + Math.sin(t * 1.7) * 0.15;
      ctx.clearRect(0, 0, w, h);

      for (const m of motes) {
        m.phase += m.twinkle * dt;
        if (night) {
          // Fireflies wander low over the hill, rather than rise.
          m.x += Math.sin(m.phase * 0.9) * 0.45 * dt;
          m.y += Math.cos(m.phase * 0.6) * 0.3 * dt;
          if (m.x < -10 || m.x > w + 10 || m.y < h * 0.45 || m.y > h + 10) {
            Object.assign(m, makeMote(w, h, true), { y: rand(h * 0.55, h) });
          }
        } else {
          m.y -= m.rise * dt;
          m.x += (m.drift + Math.sin(m.phase * 0.7) * 0.15) * dt;
          if (m.y < h * 0.25 || m.x > w + 10) Object.assign(m, makeMote(w, h, false));
        }
        const glow = night ? Math.max(0, Math.sin(m.phase * 1.6)) : 0.35 + 0.65 * Math.abs(Math.sin(m.phase));
        const reach = m.r * (night ? 6 : 4);
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, reach);
        g.addColorStop(0, night ? `rgba(255, 222, 150, ${glow})` : `rgba(255, 236, 196, ${0.9 * glow})`);
        g.addColorStop(1, night ? 'rgba(255, 190, 90, 0)' : 'rgba(255, 214, 150, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, reach, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of petals) {
        p.phase += 0.02 * p.bobFreq * dt;
        p.x += p.speed * gust * dt;
        p.y += (Math.sin(p.phase) * p.bob + 0.05) * dt;
        p.rot += p.spin * gust * dt;
        p.flip += p.flipSpeed * dt;
        if (p.x > w + 40 || p.y > h + 20) Object.assign(p, makePetal(w, h, false));
        drawPetal(ctx, p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ctx.clearRect(0, 0, w, h);
    };
  }, [active, night]);

  return (
    <div ref={wrap} className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvas} className="block" />
    </div>
  );
}
