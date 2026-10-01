/**
 * Footer - the sitemap and colophon, then the sunset hillside painting
 * closing the page underneath, rising out of the page with no edge.
 *
 * The earlier river-city panorama is parked whole in
 * `FooterUtopiaArtifact.tsx`; swap the import back to restore it.
 */

import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Facebook, Github, Instagram, Linkedin, Twitter } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { resourceLinks } from '@/data/resourceLinks';
import { FooterHorizon } from './FooterHorizon';
import { useLenis } from './core/LenisProvider';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const INK = '#111111';

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

const socialLinks = [
  { href: 'https://linkedin.com/company/futurelabstudios', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://x.com/futurelabst', label: 'X', icon: Twitter },
  { href: 'https://www.instagram.com/futurelab_studios/', label: 'Instagram', icon: Instagram },
  { href: 'https://github.com/futurelabstudios', label: 'GitHub', icon: Github },
  { href: 'https://www.facebook.com/profile.php?id=61584742716855', label: 'Facebook', icon: Facebook },
];

const storyLinks = [
  { to: '/our-vision', label: 'Our Vision' },
  { to: '/our-team', label: 'Our Team' },
  { to: '/job-openings', label: 'Job Openings' },
];

const serviceLinks = [
  { to: '/forward-ai-deployment', label: 'Forward AI Deployment' },
  { to: '/ai-workshop', label: 'AI Workshop for Enterprises' },
  { to: '/ai-workflow-accelerator', label: 'AI Accelerator for Individuals' },
  { to: '/ai-training-for-leaders-and-cxos', label: 'AI for Leaders & CXOs' },
];

const productLinks = [
  { to: '/products-for-enterprise', label: 'For Teams' },
  { to: '/product-gallery', label: 'For Individuals' },
];

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
];


/* -------------------------------------------------------------------------- */
/* Light sitemap                                                               */
/* -------------------------------------------------------------------------- */

const linkClass =
  'group block w-full text-left text-[14px] leading-snug text-[#5B6270] transition-colors duration-300 hover:text-[#111111] sm:text-[15px]';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#111111]/40 transition-[width] duration-500 ease-out group-hover:w-full"
      />
    </span>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    /* `break-inside-avoid` keeps a list whole when the footer is flowing as
       columns on a phone; the margin is the row gap the grid supplies itself
       from `sm` up. */
    <div className="mb-8 break-inside-avoid sm:mb-0">
      <h3
        className="mb-4 text-[15px] font-bold tracking-[-0.01em] sm:text-[16px] lg:text-[17px]"
        style={{ color: INK }}
      >
        {title}
      </h3>
      <nav className="space-y-3 sm:space-y-3.5">{children}</nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { scrollTo } = useLenis();
  const reduceMotion = !!useReducedMotion();

  const scrollToSection = (id: string) => {
    window.history.pushState(null, '', `#${id}`);
    scrollTo(`#${id}`, { offset: -90 });
  };

  return (
    <footer className="relative z-10 overflow-hidden bg-background lg:min-h-[max(100svh,calc(50vw+120px))]">
      {/* Sitemap first, then the panorama closes the page - the last thing a
          reader sees, not the first. */}
      <div className="relative z-10">
        {/* The concept's paper: a fine dot grid behind the sitemap, fading out
            before it reaches the panorama. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full"
          style={{
            backgroundImage: 'radial-gradient(rgba(17,17,17,0.10) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, #000 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 60%, transparent 100%)',
          }}
        />
        <div className="container relative mx-auto px-4 pb-8 pt-16 sm:px-6 sm:pb-10 sm:pt-24 lg:pt-28">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Identity */}
            <motion.div
              className="lg:col-span-4"
              initial={reduceMotion ? false : { opacity: 0.85, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="text-[32px] leading-none tracking-[-0.03em] sm:text-[40px] lg:text-[46px]">
                <span className="font-bold" style={{ color: INK }}>
                  futurelab
                </span>{' '}
                <span className="font-normal" style={{ color: '#6B7280' }}>
                  studios
                </span>
              </div>
              <p
                className="mt-3 text-[17px] leading-tight tracking-[-0.01em] sm:text-[19px] lg:text-[20px]"
                style={{ color: INK }}
              >
                Enabling Abundance.
              </p>
              <p
                className="mt-5 text-[13px] leading-relaxed sm:text-[14px]"
                style={{ color: '#9099A6' }}
              >
                &copy; {new Date().getFullYear()} Futurelab Ikigai Private Limited. All rights
                reserved.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border border-[#D1D5DB] text-[#6B7280] transition-colors duration-300 hover:border-[#111111] hover:bg-[#111111] hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Sitemap */}
            <motion.div
              /*
               * Phones flow the columns rather than grid them.
               *
               * On a two-column grid the rows line up, so Products (two
               * links) shared a row with Resources (six) and inherited its
               * height - a dead gap under Products, and Legal pushed right
               * to the bottom of the footer. Multi-column lets the lists
               * pack against each other instead. The grid returns at `sm`,
               * where there is room for every column on one row.
               */
              className="columns-2 gap-x-6 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8 lg:col-span-8 lg:grid-cols-5 lg:gap-x-6"
              initial={reduceMotion ? false : { opacity: 0.85, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.65, ease: EASE, delay: reduceMotion ? 0 : 0.08 }}
            >
              <Column title="Company">
                {storyLinks.map((link) => (
                  <RouterLink key={link.to} to={link.to} className={linkClass}>
                    <Label>{link.label}</Label>
                  </RouterLink>
                ))}
                {isHomePage ? (
                  <button
                    type="button"
                    onClick={() => scrollToSection('contact')}
                    className={linkClass}
                  >
                    <Label>Contact</Label>
                  </button>
                ) : (
                  <RouterLink to="/#contact" className={linkClass}>
                    <Label>Contact</Label>
                  </RouterLink>
                )}
              </Column>

              <Column title="Services">
                {serviceLinks.map((link) => (
                  <RouterLink key={link.to} to={link.to} className={linkClass}>
                    <Label>{link.label}</Label>
                  </RouterLink>
                ))}
              </Column>

              <Column title="Products">
                {productLinks.map((link) => (
                  <RouterLink key={link.to} to={link.to} className={linkClass}>
                    <Label>{link.label}</Label>
                  </RouterLink>
                ))}
              </Column>

              <Column title="Resources">
                {resourceLinks.map((link) =>
                  link.kind === 'internal' ? (
                    <RouterLink key={link.to} to={link.to} className={linkClass}>
                      <Label>{link.label}</Label>
                    </RouterLink>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      <Label>{link.label}</Label>
                    </a>
                  ),
                )}
              </Column>

              <Column title="Legal">
                {legalLinks.map((link) => (
                  <RouterLink key={link.to} to={link.to} className={linkClass}>
                    <Label>{link.label}</Label>
                  </RouterLink>
                ))}
              </Column>
            </motion.div>
          </div>
        </div>

        {/* The banger: the page ends on the skyline, full width, nothing
            after it. The oversized wordmark lockup that used to close it is
            parked whole in `FooterWordmarkBand.tsx`, which carries its own
            restore note. */}
      </div>
      {/* The painting rises from under the sitemap, faded in from the top so
          the page flows straight into it. On desktop the footer is one
          screen: the painting fills it from the bottom, its sky under the
          links. */}
      <FooterHorizon className="-mt-10 aspect-[4/5] sm:-mt-16 sm:aspect-[16/10] lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:aspect-[2/1]" />
    </footer>
  );
}
