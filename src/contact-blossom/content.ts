import { TESTIMONIALS, type Testimonial } from '@/data/testimonials';

/* Everything the AI-for-leaders-and-CXOs page says, in one place. */

export const PAGE = 'ai_training_leaders_cxos';

/*
 * The on-page interest form writes straight into the "CXO Workshop Interest
 * Form" in Google Forms, so responses land in the same place (and the same
 * linked sheet) as anyone who fills in the Google Form itself. Entry ids come
 * from that form; if a question is added, renamed or re-created there, its id
 * changes and must be updated here, or that answer is silently dropped.
 */
export const GOOGLE_FORM_URL = 'https://forms.gle/h73EYrWDzLS6RiU9A';
export const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSfhmUjkGrFWvd0MC9y5wRKq2_yssBA9KiOA26Q4TDuXCJkfFQ/formResponse';
export const ENTRY = {
  name: 'entry.2095937142',
  email: 'entry.1679327267',
  phone: 'entry.15192940',
  organisation: 'entry.43650366',
  role: 'entry.1711762389',
  lookingFor: 'entry.1361823809',
} as const;

/* Must match the Google Form's choices character for character; Google
   rejects a choice it does not recognise. */
export const LOOKING_FOR = [
  { value: '1:1 Personalised Coaching', hint: 'Private sessions built around your agenda' },
  { value: 'Accelerator Program', hint: 'The CXO workshop and accelerator cohort' },
  { value: 'Open to explore what works best for me', hint: 'Help me choose, including the CXO network' },
] as const;

export type LookingFor = (typeof LOOKING_FOR)[number]['value'];

export const EASE = [0.16, 1, 0.3, 1] as const;

export const ROSE = '#F49AB1';
export const MINT = '#86DEB4';
export const SKY = '#82C3FF';
export const LILAC = '#C0A1EE';
export const GOLD = '#F0D679';

/*
 * The accents are pastels: right as fills behind Ink, too pale as text or a
 * thin line on white. Where an accent has to carry text, a stroke or a small
 * dot on the white page, its deep partner (same hue, AA on white) stands in.
 */
export const DEEP: Record<string, string> = {
  [ROSE]: '#C2416B',
  [MINT]: '#1A7A53',
  [SKY]: '#2F6FD6',
  [LILAC]: '#7A4FD0',
  [GOLD]: '#876600',
};
export const deep = (accent: string) => DEEP[accent] ?? '#111111';

export const MANIFESTO =
  'Most leaders do not need another AI workshop. They need a trusted thinking partner that turns the flood of new capability into better judgment, sharper priorities and practical moves inside a real organisation.';
/** Words in the manifesto that light up in Gold rather than white. */
export const MANIFESTO_KEYS = new Set(['thinking', 'partner', 'judgment,', 'priorities', 'practical', 'moves']);

export const PRINCIPLES = [
  { n: '01', title: 'Your context first', body: 'We begin with your role, industry, goals, constraints and the decisions currently on your desk.', accent: MINT },
  { n: '02', title: 'Useful, not abstract', body: 'Build habits and workflows that have a direct bearing on strategy, teams and everyday executive work.', accent: SKY },
  { n: '03', title: 'Keep moving', body: 'Continue learning alongside a small group of leaders who are working through the same change.', accent: LILAC },
];

export type Offer = {
  id: 'workshop' | 'coaching' | 'network';
  title: string;
  lede: string;
  forWho: string;
  includes: string[];
  accent: string;
  /** The interest-form choice this option preselects. */
  choice: LookingFor;
};

export const OFFERS: Offer[] = [
  {
    id: 'workshop',
    title: 'CXO AI Workshop & Accelerator',
    lede: 'A high-trust cohort for leaders. Understand the landscape, test high-value use cases and develop a practical personal AI practice.',
    forWho: 'For leaders who learn best with peers.',
    includes: [
      'Live, hands-on workshop with a small group of senior leaders',
      'Your own use cases worked through in the room, not generic demos',
      'A personal AI workflow you leave with and keep using',
      'Can run privately for your own leadership team',
    ],
    // Lilac, not the guide's Rose: it sits with the Sky and Mint beside it.
    accent: LILAC,
    choice: 'Accelerator Program',
  },
  {
    id: 'coaching',
    title: '1:1 Executive AI Coaching',
    lede: 'Private working sessions tailored to your strategic agenda: market intelligence, leadership communication, decision support or a functional priority.',
    forWho: 'For a specific challenge that needs depth.',
    includes: [
      'One-on-one coaching with a Futurelab lead',
      'Sessions shaped around the decisions on your desk',
      'Prompts, tools and workflows set up with you, for your work',
      'Scheduled around your calendar',
    ],
    accent: SKY,
    choice: '1:1 Personalised Coaching',
  },
  {
    id: 'network',
    title: 'CXO Network, Masterclasses & AI School',
    lede: 'Ongoing access to a curated CXO WhatsApp group, live masterclasses by Futurelab Studios and Futurelab AI School, so you stay current without chasing the noise.',
    forWho: 'For leaders who want to stay current.',
    includes: [
      'A dedicated WhatsApp group for CXOs and senior leaders',
      'Live masterclasses by Futurelab Studios',
      'Access to Futurelab AI School',
      'Fresh examples and useful signals from peers',
    ],
    accent: MINT,
    choice: 'Open to explore what works best for me',
  },
];

export const TOPICS = [
  { title: 'The AI landscape that matters', body: 'What has changed, what is genuinely useful now, and how to distinguish capability from noise.', accent: SKY },
  { title: 'Your executive AI workflow', body: 'Use AI for research, analysis, writing, decision preparation and communication without surrendering judgment.', accent: GOLD },
  { title: 'Prompts, tools and agents', body: 'Hands-on practice with the tools and interaction patterns that make executive work materially easier.', accent: MINT },
  { title: 'Where value sits in your organisation', body: 'Find, score and prioritise the workflows where AI can improve speed, quality or customer outcomes.', accent: ROSE },
  { title: 'Leading adoption', body: 'How to build confidence, capability and momentum across a leadership team, not just issue licences.', accent: LILAC },
  { title: 'Risk, judgment and responsible use', body: 'Work through privacy, accuracy and governance in a way that enables action rather than freezes it.', accent: SKY },
];

export const OUTCOMES = [
  { title: 'A clearer personal workflow', body: 'Know where AI meaningfully supports your thinking, drafting, analysis, research and preparation.' },
  { title: 'A stronger leadership lens', body: 'Separate short-term tool noise from the choices that will change your function and organisation.' },
  { title: 'Real use cases to sponsor', body: 'Identify the workflow or team problem worth backing first, with a practical adoption path.' },
  { title: 'A credible internal voice', body: 'Communicate opportunity, limits, risk and next steps without becoming either alarmist or vague.' },
];

/*
 * Leaders and senior managers who have already said this on record, drawn
 * from the shared testimonial list so a quote is only ever edited in one
 * place. The FMCG names the brief asked for lead.
 */
const TESTIMONIAL_NAMES = [
  'Vikram Varde',
  'Akshita Summan',
  'Mrinal Pallial',
  'Sanjeev Asthana',
  'Lovaii Navlakhi',
  'Harish R',
  'Yuvrraj Agarwaal',
];

/*
 * Mrinal's shared entry points at the full 1200px ITC testimonial poster and
 * frames the face with CSS offsets: 768 KB for a 64px circle, which often
 * showed empty while it loaded. This page uses a small crop of the same photo.
 */
const PORTRAIT_OVERRIDES: Record<string, Partial<Testimonial>> = {
  'Mrinal Pallial': { image: '/images/testimonials/mrinal-pallial.jpg', portraitFrame: undefined },
};

export const LEADER_TESTIMONIALS = TESTIMONIAL_NAMES
  .map((name) => TESTIMONIALS.find((t) => t.name === name))
  .filter((t): t is Testimonial => Boolean(t))
  .map((t) => ({ ...t, ...PORTRAIT_OVERRIDES[t.name] }));

export const FOUNDERS = [
  {
    name: 'Kuntal Sharma',
    role: 'Co-Founder',
    bio: '13+ years in marketing and growth leadership at Google, Paytm, Airtel and Amul.',
    image: '/images/team/Kuntal Sharma.jpg',
    linkedin: 'https://www.linkedin.com/in/kuntal7/',
    accent: GOLD,
  },
  {
    name: 'Shabbir Haider',
    role: 'Co-Founder',
    bio: '13+ years across business strategy and technology transformation at Amul, Wipro, PepsiCo and Mondelez.',
    image: '/images/team/Shabbir Haider.jpeg',
    linkedin: 'https://www.linkedin.com/in/shabbir7',
    accent: SKY,
  },
];
