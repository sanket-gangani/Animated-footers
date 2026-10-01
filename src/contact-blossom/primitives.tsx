import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import type { Testimonial } from '@/data/testimonials';
import { trackCTAClick } from '@/lib/analytics';
import { EASE, PAGE, deep, type LookingFor } from './content';

/* -------------------------------------------------------------------------- */
/* "Take me to the form"                                                       */
/* -------------------------------------------------------------------------- */

type AskContextValue = {
  choice: LookingFor | '';
  setChoice: (c: LookingFor | '') => void;
  ask: (c?: LookingFor) => void;
};

export const AskContext = createContext<AskContextValue | null>(null);

export function useAsk() {
  const ctx = useContext(AskContext);
  if (!ctx) throw new Error('useAsk must be used inside the CXO page');
  return ctx;
}

/** Takes the reader down to the interest form, preselecting an option. */
export function AskButton({
  cta,
  choice,
  className,
  children,
}: {
  cta: string;
  choice?: LookingFor;
  className: string;
  children: ReactNode;
}) {
  const { ask } = useAsk();
  return (
    <button
      type="button"
      onClick={() => {
        trackCTAClick(cta, PAGE);
        ask(choice);
      }}
      className={className}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                      */
/* -------------------------------------------------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className,
  y = 32,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A line of display type that resolves word by word out of a blur, the way a
 * keynote slide builds. `highlight` words take the `tone`: `quiet` settles
 * them into soft grey for a two-tone headline (the default, used section by
 * section); `serif` switches them to the italic serif, kept for the hero
 * alone. `breakBefore` starts a new line at a word.
 */
export function BlurWords({
  text,
  highlight = [],
  as: Tag = 'h2',
  className,
  delay = 0,
  inView = true,
  breakBefore,
  tone = 'quiet',
}: {
  text: string;
  highlight?: string[];
  as?: 'h1' | 'h2' | 'p';
  className?: string;
  delay?: number;
  /** false animates on mount instead of on scroll into view. */
  inView?: boolean;
  breakBefore?: string;
  tone?: 'quiet' | 'serif';
}) {
  const reduce = useReducedMotion();
  const keys = new Set(highlight);
  const words = text.split(' ');
  const MotionTag = motion[Tag];
  const trigger = inView ? { whileInView: 'show' as const, viewport: { once: true, amount: 0.5 } } : { animate: 'show' as const };

  return (
    <MotionTag className={className} aria-label={text} initial={reduce ? false : 'hidden'} {...trigger}>
      {words.map((word, i) => [
        word === breakBefore && <br key={`br-${i}`} />,
        <motion.span
          key={i}
          aria-hidden="true"
          className={`inline-block ${keys.has(word) ? (tone === 'serif' ? 'cxo-serif' : 'cxo-quiet') : ''}`}
          variants={{
            hidden: { opacity: 0, y: '0.35em', filter: 'blur(14px)' },
            show: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 1.1, ease: EASE, delay: delay + i * 0.06 },
            },
          }}
        >
          {word}
          {i < words.length - 1 && ' '}
        </motion.span>,
      ])}
    </MotionTag>
  );
}

export function CountUp({ to, suffix = '', duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A glass card whose border and surface catch a soft light that follows the
 * pointer. The light is two CSS custom properties, so it costs no re-renders.
 */
export function SpotlightCard({
  children,
  className = '',
  accent = '#F0D679',
  style,
  flat = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  style?: CSSProperties;
  /** A flat grey surface with no light or lift, for cards that lead with a gradient tile. */
  flat?: boolean;
}) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div
      onMouseMove={onMove}
      className={`${flat ? 'cxo-flat' : 'cxo-spotlight'} ${className}`}
      style={{ ...style, ['--spot' as string]: accent }}
    >
      {children}
    </div>
  );
}

export function Portrait({ t, className }: { t: Testimonial; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-full bg-[#EEF0F3] ${className}`}>
      <img
        src={t.image}
        alt={t.name}
        loading="lazy"
        className={t.portraitFrame ? 'absolute h-auto max-w-none' : 'h-full w-full object-cover'}
        style={t.portraitFrame as CSSProperties | undefined}
      />
    </div>
  );
}

export function Eyebrow({ children, accent = '#F0D679' }: { children: ReactNode; accent?: string }) {
  return (
    <p className="cxo-eyebrow inline-flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-[3px]" style={{ background: deep(accent) }} />
      {children}
    </p>
  );
}
