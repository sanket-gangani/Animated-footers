import { useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/*
 * Cherry-blossom petals drifting down across the contact section, to go with
 * the painting beside the form. A single 2D canvas: each petal is a notched
 * blossom petal that falls, sways on its own rhythm, spins, and flips in
 * depth (its width follows a cosine, so it catches the light as it turns).
 * A slow breeze comes and goes, and petals ease away from the pointer.
 *
 * Runs only while the section is on screen; with reduced motion it draws one
 * still scatter and stops.
 */

const COLOURS = ['#F9B8CB', '#F49AB1', '#FBD3DF', '#F7A8BF', '#FFE3EC', '#F28FAB'];

type Petal = {
  x: number;
  y: number;
  size: number;
  fall: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  rot: number;
  spin: number;
  flip: number;
  flipSpeed: number;
  colour: string;
  alpha: number;
};

function makePetal(w: number, h: number, anywhere: boolean): Petal {
  const size = 5 + Math.random() * 9;
  return {
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : -20 - Math.random() * h * 0.3,
    size,
    // Bigger petals read as nearer, so they fall a little faster.
    fall: 0.35 + (size / 14) * 0.75 + Math.random() * 0.25,
    swayAmp: 0.4 + Math.random() * 1.1,
    swayFreq: 0.6 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.03,
    flip: Math.random() * Math.PI * 2,
    flipSpeed: 0.02 + Math.random() * 0.04,
    colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    alpha: 0.65 + Math.random() * 0.35,
  };
}

/** A cherry petal: rounded, tapering to the stem, with the notch at its tip. */
function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  const s = p.size;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(Math.max(0.15, Math.abs(Math.cos(p.flip))), 1);
  ctx.globalAlpha = p.alpha;

  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(s * 0.95, s * 0.55, s * 0.9, -s * 0.55, s * 0.28, -s * 0.95);
  ctx.lineTo(0, -s * 0.7);
  ctx.lineTo(-s * 0.28, -s * 0.95);
  ctx.bezierCurveTo(-s * 0.9, -s * 0.55, -s * 0.95, s * 0.55, 0, s);
  ctx.closePath();

  const g = ctx.createLinearGradient(0, s, 0, -s);
  g.addColorStop(0, '#FFF5F8');
  g.addColorStop(0.55, p.colour);
  g.addColorStop(1, p.colour);
  ctx.fillStyle = g;
  ctx.fill();

  // A faint vein down the middle.
  ctx.globalAlpha = p.alpha * 0.35;
  ctx.strokeStyle = '#E57A9A';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.85);
  ctx.lineTo(0, -s * 0.55);
  ctx.stroke();
  ctx.restore();
}

export function CherryPetals({ className = '', density = 1 }: { className?: string; density?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(wrap, { margin: '80px' });

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let petals: Petal[] = [];
    const pointer = { x: -9999, y: -9999 };

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
      // Roughly one petal per 22,000px², capped so phones stay light.
      const count = Math.round(Math.min(70, Math.max(14, (w * h) / 22000)) * density);
      petals = Array.from({ length: count }, () => makePetal(w, h, true));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    window.addEventListener('pointermove', onMove);
    box.addEventListener('pointerleave', onLeave);

    const drawAll = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) drawPetal(ctx, p);
    };

    if (reduce || !inView) {
      drawAll();
      return () => {
        ro.disconnect();
        window.removeEventListener('pointermove', onMove);
        box.removeEventListener('pointerleave', onLeave);
      };
    }

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      const t = now / 1000;
      // A breeze that rises and falls, always leaning a little to the right.
      const breeze = 0.35 + Math.sin(t * 0.35) * 0.45 + Math.sin(t * 1.3) * 0.12;

      for (const p of petals) {
        p.phase += 0.016 * p.swayFreq * dt;
        p.x += (Math.sin(p.phase) * p.swayAmp + breeze * (p.size / 10)) * dt;
        p.y += p.fall * dt;
        p.rot += p.spin * dt + Math.sin(p.phase) * 0.004 * dt;
        p.flip += p.flipSpeed * dt;

        // Ease away from the pointer, as if brushed aside.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 110 * 110) {
          const d = Math.sqrt(d2) || 1;
          const push = (1 - d / 110) * 2.2 * dt;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push * 0.5;
        }

        if (p.y > h + 20 || p.x > w + 30 || p.x < -30) Object.assign(p, makePetal(w, h, false));
      }
      drawAll();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerleave', onLeave);
    };
  }, [inView, reduce, density]);

  return (
    <div ref={wrap} className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvas} className="block" />
    </div>
  );
}
