/**
 * FooterHorizon - the painting that closes every page: someone working on a
 * laptop on a flowered hilltop, above a sea of clouds, at sunset - and, after
 * dark, under the stars.
 *
 * The illustration is a flat image, so everything that moves is drawn on top
 * of it in the image's own 1774x887 pixel grid, and belongs to the scene:
 * - he types: lines of text fill his screen with a blinking caret, his hands
 *   move on the keys, and small glyphs drift up off the screen;
 * - wind through the flowers and grass, and the sea of clouds slowly rolling
 *   (displacement filters, drawn around him so he never bends);
 * - the sun breathing and glinting on the sea, haze, distant birds;
 * - at night: the painted night version of the same scene (a crescent
 *   moon, the Milky Way), with stars twinkling, the odd shooting star,
 *   moonlight glinting on the sea, fireflies, and his laptop lighting him.
 *   Both paintings share one pixel grid, so every overlay fits either.
 *
 * Day or night follows the visitor's local time, with a switch to flip it.
 * Petals, pollen and fireflies are a canvas layer on top (FooterBreeze).
 * Everything pauses off screen and stays still under reduced motion.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { FooterBreeze } from './FooterBreeze';

const ART = '/images/footer-horizon.webp';
const NIGHT_ART = '/images/footer-horizon-night.webp';
const W = 1774;
const H = 887;

const SUN = { x: 1452, y: 457 };
const MOON = { x: 1438, y: 152 };

/* The laptop screen's corners, read off the painting. */
const SCREEN = { tl: [1149, 582], tr: [1187.5, 581], br: [1166, 621], bl: [1130, 614] } as const;
/* Maps a unit square onto the screen, so the typed lines lie on its surface. */
const SCREEN_MATRIX = `matrix(${SCREEN.tr[0] - SCREEN.tl[0]} ${SCREEN.tr[1] - SCREEN.tl[1]} ${SCREEN.bl[0] - SCREEN.tl[0]} ${SCREEN.bl[1] - SCREEN.tl[1]} ${SCREEN.tl[0]} ${SCREEN.tl[1]})`;
const SCREEN_POLY = [SCREEN.tl, SCREEN.tr, SCREEN.br, SCREEN.bl].map((p) => p.join(',')).join(' ');

/* Lines he types, in screen units (0..1): start y and final width. */
const TYPED = [
  { y: 0.16, w: 0.62 },
  { y: 0.3, w: 0.74 },
  { y: 0.44, w: 0.5 },
  { y: 0.58, w: 0.7 },
  { y: 0.72, w: 0.42 },
];
const TYPE_CYCLE = 9; // seconds for the whole screen to fill, pause and clear

/* His hands on the keys. */
const HANDS = [
  { cx: 1099, cy: 617, rx: 13, ry: 9, delay: 0 },
  { cx: 1124, cy: 614, rx: 11, ry: 8, delay: 0.17 },
];

/* The hill, drawn around the seated figure so the wind never bends him. */
const HILL = `M0 560 L880 650 L915 722 L1232 727 L1774 772 V${H} H0 Z`;
/* The sea of clouds, left and right of him, below the far mountains. */
const CLOUDS = 'M0 468 L915 440 L915 632 L400 552 L0 494 Z M1228 440 L1774 430 L1774 748 L1236 720 Z';

const GLINTS = [
  { x: 1440, y: 492, w: 26, d: 0 },
  { x: 1462, y: 508, w: 18, d: 1.3 },
  { x: 1448, y: 527, w: 30, d: 2.1 },
  { x: 1470, y: 546, w: 20, d: 0.7 },
  { x: 1436, y: 566, w: 24, d: 2.8 },
  { x: 1458, y: 588, w: 16, d: 1.8 },
];

const BIRDS = [
  { y: 250, scale: 1, dur: 58, delay: 0 },
  { y: 275, scale: 0.8, dur: 64, delay: -6 },
  { y: 232, scale: 0.65, dur: 70, delay: -3 },
];

const GLYPHS = ['a', '{', '✦', '1', '}', 'Σ', '·', '0'];

/* Stars, placed once with a fixed seed so they never jump between renders,
   and kept off the big clouds top-left and right. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const STARS = (() => {
  const r = seeded(7);
  const out: { x: number; y: number; r: number; d: number; dur: number }[] = [];
  while (out.length < 110) {
    const x = r() * W;
    const y = 12 + Math.pow(r(), 1.3) * 360;
    if ((x < 430 && y > 160) || (x > 1480 && y > 250)) continue;
    out.push({ x, y, r: 0.6 + Math.pow(r(), 2.5) * 2.2, d: r() * 6, dur: 2.5 + r() * 4 });
  }
  return out;
})();

type Mode = 'day' | 'night';

function initialMode(): Mode {
  if (typeof window === 'undefined') return 'day';
  const h = new Date().getHours();
  return h >= 19 || h < 6 ? 'night' : 'day';
}

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mql.matches);
    on();
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, []);
  return wide;
}

export function FooterHorizon({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '200px' });
  const reduceMotion = useReducedMotion();
  const wide = useWide();
  const [mode, setMode] = useState<Mode>(initialMode);
  const night = mode === 'night';
  // The night painting loads the first time it could be seen, then stays.
  const [nightLoaded, setNightLoaded] = useState(night);
  useEffect(() => {
    if (inView || night) setNightLoaded(true);
  }, [inView, night]);
  const live = inView && !reduceMotion;
  const play = live ? 'running' : 'paused';
  const fade = { transition: 'opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1)' };

  /*
   * The painting, day with night crossfading over it. Every layer that
   * redraws part of the scene (clouds, hill, hands) draws this same pair on
   * the same fade, so the whole picture turns over together: no region can
   * switch ahead of the rest and show as a box.
   */
  const painting = (
    <>
      <image href={ART} x="0" y="0" width={W} height={H} preserveAspectRatio="none" />
      {nightLoaded && (
        <image href={NIGHT_ART} x="0" y="0" width={W} height={H} preserveAspectRatio="none" style={{ ...fade, opacity: night ? 1 : 0 }} />
      )}
    </>
  );

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        // The sky dissolves into the page above; no edge, no border.
        maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 18%, rgba(0,0,0,0.45) 33%, #000 50%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 18%, rgba(0,0,0,0.45) 33%, #000 50%)',
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 block h-full w-full"
        role="img"
        aria-label={
          night
            ? 'At night, under a crescent moon and the Milky Way, someone works on a glowing laptop on a flowered hilltop above a moonlit sea of clouds.'
            : 'At sunset, someone works on a laptop on a flowered hilltop above a sea of clouds, the sun setting over the water.'
        }
      >
        <defs>
          <radialGradient id={`${uid}-sun`}>
            <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.95" />
            <stop offset="0.25" stopColor="#FFD9A0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFB27A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-halo`}>
            <stop offset="0" stopColor="#FFC98F" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FF9E7A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-moon`}>
            <stop offset="0" stopColor="#F4F8FF" stopOpacity="0.95" />
            <stop offset="0.3" stopColor="#DCE7FF" stopOpacity="0.45" />
            <stop offset="1" stopColor="#B8CCFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-screen`}>
            <stop offset="0" stopColor="#FFF1DC" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFE0B8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-screen-night`}>
            <stop offset="0" stopColor="#FFE7C2" stopOpacity="0.6" />
            <stop offset="0.4" stopColor="#FFC98A" stopOpacity="0.2" />
            <stop offset="1" stopColor="#FFB870" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-meteor`} x1="0" x2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.95" />
          </linearGradient>
          <filter id={`${uid}-soft`} x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <clipPath id={`${uid}-hill`}>
            <path d={HILL} />
          </clipPath>
          <clipPath id={`${uid}-clouds`}>
            <path d={CLOUDS} />
          </clipPath>
          {HANDS.map((h, i) => (
            <clipPath key={i} id={`${uid}-hand-${i}`}>
              <ellipse cx={h.cx} cy={h.cy} rx={h.rx} ry={h.ry} />
            </clipPath>
          ))}
          {/* Wind: slow noise pushing the grass and flowers sideways, in gusts. */}
          <filter id={`${uid}-wind`} filterUnits="userSpaceOnUse" x="0" y="540" width={W} height={H - 540}>
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.045" numOctaves="2" seed="4" result="wind">
              <animate attributeName="baseFrequency" dur="11s" values="0.012 0.045;0.016 0.05;0.012 0.045" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="wind" scale="5" xChannelSelector="R" yChannelSelector="G">
              <animate attributeName="scale" dur="7s" values="3;9;4;10;3" repeatCount="indefinite" />
            </feDisplacementMap>
          </filter>
          {/* The cloud sea rolling: broad, slow, mostly sideways. */}
          <filter id={`${uid}-roll`} filterUnits="userSpaceOnUse" x="0" y="420" width={W} height="340">
            <feTurbulence type="fractalNoise" baseFrequency="0.0045 0.014" numOctaves="2" seed="11" result="roll">
              <animate attributeName="baseFrequency" dur="24s" values="0.0045 0.014;0.0065 0.017;0.0045 0.014" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="roll" scale="14" xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </defs>

        <g style={{ animation: live ? `${uid}-camera 22s ease-in-out infinite alternate` : undefined, transformOrigin: '60% 70%' }}>
          {painting}

          {/* Clouds and hill again, moved by the air. Desktop only: they are the costly layers. */}
          {live && wide && (
            <>
              <g clipPath={`url(#${uid}-clouds)`} filter={`url(#${uid}-roll)`}>
                {painting}
              </g>
              <g clipPath={`url(#${uid}-hill)`} filter={`url(#${uid}-wind)`}>
                {painting}
              </g>
            </>
          )}

          {/* His hands, moving on the keys. */}
          {live &&
            HANDS.map((h, i) => (
              <g key={`hand-${i}`} clipPath={`url(#${uid}-hand-${i})`}>
                <g style={{ animation: `${uid}-keys 0.62s steps(1) infinite`, animationDelay: `${h.delay}s` }}>{painting}</g>
              </g>
            ))}

          {/* The screen: lit, and filling with what he types. */}
          <polygon
            points={SCREEN_POLY}
            fill="#FFD2A6"
            opacity={night ? 0.45 : 0.35}
            style={fade}
          />
          {!reduceMotion && (
            <g transform={SCREEN_MATRIX}>
              {TYPED.map((line, i) => (
                <rect
                  key={`type-${i}`}
                  x={0.12}
                  y={line.y}
                  width={line.w}
                  height={0.07}
                  rx={0.03}
                  fill="#8A4A2C"
                  opacity={0.55}
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'left center',
                    animation: `${uid}-type-${i} ${TYPE_CYCLE}s linear infinite`,
                    animationPlayState: play,
                  }}
                />
              ))}
              <rect
                x={0.12}
                y={TYPED[0].y - 0.02}
                width={0.035}
                height={0.11}
                fill="#5A2A14"
                style={{ animation: `${uid}-caret ${TYPE_CYCLE}s linear infinite`, animationPlayState: play }}
              />
            </g>
          )}
        </g>

        {!reduceMotion && (
          <g>
            {/* Night sky: stars twinkling, now and then a shooting star. */}
            <g style={{ ...fade, opacity: night ? 1 : 0 }}>
              {STARS.map((s, i) => (
                <circle
                  key={`star-${i}`}
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  fill="#F3F6FF"
                  style={{ animation: `${uid}-twinkle ${s.dur}s ease-in-out infinite`, animationDelay: `${s.d}s`, animationPlayState: play }}
                />
              ))}
              {[0, 1].map((i) => (
                <line
                  key={`meteor-${i}`}
                  x1={0}
                  y1={0}
                  x2={120}
                  y2={34}
                  stroke={`url(#${uid}-meteor)`}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  opacity={0}
                  style={{
                    animation: `${uid}-meteor-${i} ${13 + i * 7}s linear infinite`,
                    animationDelay: `${i * 5 + 3}s`,
                    animationPlayState: play,
                  }}
                />
              ))}
              {/* The crescent moon's glow, and its light glinting on the sea. */}
              <circle
                cx={MOON.x}
                cy={MOON.y}
                r={70}
                fill={`url(#${uid}-moon)`}
                style={{ animation: `${uid}-breathe 8s ease-in-out infinite`, animationPlayState: play }}
              />
              {GLINTS.map((g, i) => (
                <rect
                  key={`moonglint-${i}`}
                  x={g.x - g.w / 2}
                  y={g.y + 8}
                  width={g.w}
                  height={2}
                  rx={1}
                  fill="#E4ECFF"
                  opacity={0}
                  style={{ animation: `${uid}-glint 4.2s ease-in-out infinite`, animationDelay: `${g.d}s`, animationPlayState: play }}
                />
              ))}
              {/* His screen, warm in the dark, lighting him and the grass. */}
              <circle
                cx={1152}
                cy={604}
                r={130}
                fill={`url(#${uid}-screen-night)`}
                style={{ animation: `${uid}-screen 4s ease-in-out infinite`, animationPlayState: play }}
              />
            </g>

            {/* Day: the sun breathing, light on the sea, birds, the screen's warmth. */}
            <g style={{ ...fade, opacity: night ? 0 : 1 }}>
              <circle
                cx={SUN.x}
                cy={SUN.y}
                r={260}
                fill={`url(#${uid}-halo)`}
                style={{ animation: `${uid}-breathe 9s ease-in-out infinite`, animationPlayState: play }}
              />
              <circle
                cx={SUN.x}
                cy={SUN.y}
                r={70}
                fill={`url(#${uid}-sun)`}
                style={{ animation: `${uid}-breathe 6s ease-in-out infinite`, animationPlayState: play }}
              />
              {GLINTS.map((g, i) => (
                <rect
                  key={`glint-${i}`}
                  x={g.x - g.w / 2}
                  y={g.y}
                  width={g.w}
                  height={2.2}
                  rx={1.1}
                  fill="#FFF3D1"
                  opacity={0}
                  style={{ animation: `${uid}-glint 3.4s ease-in-out infinite`, animationDelay: `${g.d}s`, animationPlayState: play }}
                />
              ))}
              <circle
                cx={1158}
                cy={598}
                r={46}
                fill={`url(#${uid}-screen)`}
                style={{ animation: `${uid}-screen 5s ease-in-out infinite`, animationPlayState: play }}
              />
              {BIRDS.map((b, i) => (
                <g
                  key={`bird-${i}`}
                  style={{ animation: `${uid}-fly ${b.dur}s linear infinite`, animationDelay: `${b.delay}s`, animationPlayState: play }}
                >
                  <g transform={`translate(0 ${b.y}) scale(${b.scale})`}>
                    <path
                      d="M-9 0 Q-4 -5 0 0 Q4 -5 9 0"
                      fill="none"
                      stroke="#2B2F55"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      opacity={0.55}
                      style={{
                        animation: `${uid}-flap 0.9s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`,
                        animationPlayState: play,
                        transformBox: 'fill-box',
                        transformOrigin: 'center',
                      }}
                    />
                  </g>
                </g>
              ))}
            </g>

            {/* Haze drifting over the sea of clouds, day and night. */}
            <g opacity={night ? 0.22 : 0.5} filter={`url(#${uid}-soft)`} style={fade}>
              <ellipse cx={520} cy={560} rx={260} ry={22} fill="#FFFFFF" style={{ animation: `${uid}-drift 26s ease-in-out infinite`, animationPlayState: play }} />
              <ellipse cx={1280} cy={625} rx={300} ry={20} fill="#FFE6EE" style={{ animation: `${uid}-drift 32s ease-in-out infinite reverse`, animationPlayState: play }} />
              <ellipse cx={860} cy={500} rx={220} ry={16} fill="#F4ECFF" style={{ animation: `${uid}-drift 22s ease-in-out infinite`, animationDelay: '-8s', animationPlayState: play }} />
            </g>

            {/* What he types, drifting up off the screen as small glyphs. */}
            {GLYPHS.map((ch, i) => (
              <text
                key={`glyph-${i}`}
                x={1162 + (i % 3) * 6}
                y={576}
                fontSize={i % 2 ? 9 : 11}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fill={night ? '#DDE8FF' : '#FFF1D6'}
                opacity={0}
                style={{
                  animation: `${uid}-glyph 4.8s ease-out infinite`,
                  animationDelay: `${i * 0.6}s`,
                  animationPlayState: play,
                  ['--gx' as string]: `${(i % 2 ? 1 : -1) * (14 + (i % 4) * 9)}px`,
                }}
              >
                {ch}
              </text>
            ))}
          </g>
        )}

        <style>{`
          @keyframes ${uid}-camera { from { transform: scale(1.005) translate(-4px, 2px); } to { transform: scale(1.035) translate(6px, -4px); } }
          @keyframes ${uid}-breathe { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
          @keyframes ${uid}-glint { 0%,100% { opacity: 0; } 45% { opacity: .95; } 60% { opacity: .2; } }
          @keyframes ${uid}-drift { 0%,100% { transform: translateX(-80px); } 50% { transform: translateX(90px); } }
          @keyframes ${uid}-screen { 0%,100% { opacity: .45; } 50% { opacity: .85; } }
          @keyframes ${uid}-fly { from { transform: translate(-60px, 0); } to { transform: translate(${W + 120}px, -40px); } }
          @keyframes ${uid}-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(-0.4); } }
          @keyframes ${uid}-twinkle { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
          @keyframes ${uid}-keys { 0% { transform: translate(0,0); } 25% { transform: translate(0.4px,-1.3px); } 50% { transform: translate(0,0.3px); } 75% { transform: translate(-0.4px,-0.9px); } }
          @keyframes ${uid}-glyph { 0% { opacity: 0; transform: translate(0,0); } 15% { opacity: .95; } 100% { opacity: 0; transform: translate(var(--gx), -70px); } }
          @keyframes ${uid}-meteor-0 { 0%,88% { opacity: 0; transform: translate(260px, 60px); } 90% { opacity: 1; } 96%,100% { opacity: 0; transform: translate(760px, 200px); } }
          @keyframes ${uid}-meteor-1 { 0%,90% { opacity: 0; transform: translate(900px, 40px); } 92% { opacity: 1; } 98%,100% { opacity: 0; transform: translate(1380px, 175px); } }
          ${TYPED.map((_, i) => {
            const n = TYPED.length;
            const start = (i / n) * 72;
            const end = ((i + 1) / n) * 72;
            return `@keyframes ${uid}-type-${i} { 0%, ${start.toFixed(1)}% { transform: scaleX(0); } ${end.toFixed(1)}%, 94% { transform: scaleX(1); } 97%, 100% { transform: scaleX(0); } }`;
          }).join('\n')}
          @keyframes ${uid}-caret {
            ${TYPED.map((line, i) => {
              const n = TYPED.length;
              const start = (i / n) * 72;
              const end = ((i + 1) / n) * 72;
              const dy = (line.y - TYPED[0].y).toFixed(2);
              return `${start.toFixed(1)}% { transform: translate(0px, ${dy}px); } ${(end - 0.1).toFixed(1)}% { transform: translate(${line.w.toFixed(2)}px, ${dy}px); }`;
            }).join(' ')}
            72%, 94% { transform: translate(${TYPED[TYPED.length - 1].w}px, ${(TYPED[TYPED.length - 1].y - TYPED[0].y).toFixed(2)}px); opacity: 1; }
            95% { opacity: 0; } 100% { transform: translate(0px, 0px); opacity: 0; }
          }
        `}</style>
      </svg>

      <FooterBreeze active={live} night={night} className="absolute inset-0" />

      {/* Day / night switch. */}
      <div className="absolute bottom-4 left-4 z-10 flex rounded-full border border-white/40 bg-white/25 p-1 backdrop-blur-md sm:bottom-6 sm:left-6">
        {(['day', 'night'] as const).map((m) => {
          const Icon = m === 'day' ? Sun : Moon;
          const on = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={on}
              aria-label={m === 'day' ? 'Show the scene by day' : 'Show the scene by night'}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
                on ? 'bg-white text-[#111]' : 'text-white hover:bg-white/20'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
