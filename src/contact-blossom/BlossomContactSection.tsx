/*
 * The CXO page contact section with cherry-blossom petals falling across it,
 * as it shipped in ebafae0 on futurelab-website-official (removed later in
 * e81ee76). Styles live in cxo.css; the painting is
 * /images/cxo/blossom-temple.jpg.
 */
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { CherryPetals } from './CherryPetals';
import { InterestForm } from './InterestForm';
import { ROSE } from './content';
import { BlurWords, Eyebrow } from './primitives';
import './cxo.css';

/**
 * The contact section as one scene. A softly blurred, enlarged copy of the
 * painting fills the whole panel, so its sky and blossoms carry on behind the
 * form; the sharp painting sits on the left and dissolves into it through a
 * mask, with no edge. (The source is only 370px wide: blurred, it can fill
 * 1240px; sharp, it can only hold the left side.) It drifts, zooms slowly and
 * moves a touch with the scroll.
 */
function BlossomScene() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-5%', '5%']);

  return (
    <div ref={ref} className="absolute inset-0" aria-hidden="true">
      {/* The ambient extension: the whole painting, blurred into light and colour. */}
      <img
        src="/images/cxo/blossom-temple.jpg"
        alt=""
        loading="lazy"
        className="cxo-blossom-ambient absolute inset-0 h-full w-full object-cover object-[center_25%]"
      />
      {/* The sharp painting, fading out to the right (downward on phones). */}
      <div className="cxo-blossom-sharp absolute inset-y-0 left-0 w-full overflow-hidden lg:w-[64%]">
        <motion.div style={{ y }} className="absolute inset-[-7%]">
          <img
            src="/images/cxo/blossom-temple.jpg"
            alt=""
            loading="lazy"
            className="cxo-kenburns h-full w-full object-cover object-[center_30%]"
          />
        </motion.div>
      </div>
      {/* Dusk settling from below, so the copy reads; lighter toward the form. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1d1230]/85 via-[#1d1230]/40 via-45% to-transparent to-80% lg:bg-gradient-to-tr lg:from-[#1d1230]/85 lg:via-[#1d1230]/30 lg:via-45% lg:to-transparent lg:to-75%" />
      <div className="absolute inset-0 bg-[#1d1230]/40 lg:hidden" />
    </div>
  );
}

function BlossomCopy() {
  return (
    <div className="cxo-on-image relative flex flex-col justify-end px-4 pb-4 pt-40 text-white sm:px-6 lg:min-h-[720px] lg:px-6 lg:pb-8 lg:pt-10">
      <Eyebrow accent={ROSE}>Start with a conversation</Eyebrow>
      <BlurWords
        text="Tell us what you are working through."
        highlight={['what', 'you', 'are', 'working', 'through.']}
        className="cxo-display mt-5 text-[clamp(38px,4.4vw,64px)] !leading-[1.0] [text-shadow:0_2px_24px_rgba(20,10,35,0.35)]"
      />
      <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-white/85">
        Share a little about your role and priorities. We will get in touch to understand your context and help you
        choose the right option: a CXO workshop, 1:1 coaching or the CXO network.
      </p>
      <ul className="mt-6 space-y-2.5 text-[15px] text-white/90">
        {['A personal reply from the Futurelab team', 'No obligation, and no mailing list', 'Your details stay with Futurelab'].map((line) => (
          <li key={line} className="flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F9B8CB]">
              <Check className="h-3 w-3 text-[#111]" strokeWidth={3} />
            </span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BlossomContactSection() {
  return (
    <section className="relative px-5 pb-24 pt-8 sm:px-8 sm:pb-32">
      <div
        id="interest"
        className="relative isolate mx-auto max-w-[1240px] scroll-mt-24 overflow-hidden rounded-[40px] bg-[#2a1d3d]"
      >
        <BlossomScene />
        {/* Petals drift across the whole scene, and behind the form, never across it. */}
        <CherryPetals className="absolute inset-0 z-[5]" />
        <div className="relative grid gap-8 p-4 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:p-12">
          <BlossomCopy />
          <div className="relative z-10 flex items-center">
            <div className="w-full">
              <InterestForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
