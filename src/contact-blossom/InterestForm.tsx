import { useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { trackInquirySubmit } from '@/lib/analytics';
import { EASE, ENTRY, GOOGLE_FORM_ACTION, GOOGLE_FORM_URL, LOOKING_FOR } from './content';
import { useAsk } from './primitives';

type FormStatus = 'idle' | 'sending' | 'sent' | 'failed';

const FIELDS = [
  { key: 'name', label: 'Name', type: 'text', autoComplete: 'name', placeholder: 'Your full name', wide: true },
  { key: 'email', label: 'Work email', type: 'email', autoComplete: 'email', placeholder: 'you@company.com', wide: false },
  { key: 'phone', label: 'Contact number', type: 'tel', autoComplete: 'tel', placeholder: '+91 98765 43210', wide: false },
  { key: 'organisation', label: 'Organisation', type: 'text', autoComplete: 'organization', placeholder: 'Company name', wide: false },
  { key: 'role', label: 'Your role', type: 'text', autoComplete: 'organization-title', placeholder: 'e.g. Chief Marketing Officer', wide: false },
] as const;

export function InterestForm() {
  const { choice, setChoice } = useAsk();
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [firstName, setFirstName] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? '').trim();

    const body = new FormData();
    body.append(ENTRY.name, value('name'));
    body.append(ENTRY.email, value('email'));
    body.append(ENTRY.phone, value('phone'));
    body.append(ENTRY.organisation, value('organisation'));
    body.append(ENTRY.role, value('role'));
    body.append(ENTRY.lookingFor, value('lookingFor'));

    setStatus('sending');
    try {
      // Google Forms sends no CORS headers, so the response is opaque: we can
      // tell a network failure (this throws) but not a rejected answer.
      await fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body });
      trackInquirySubmit({ service: `cxo: ${value('lookingFor')}` });
      setFirstName(value('name').split(/\s+/)[0] ?? '');
      setStatus('sent');
      form.reset();
      setChoice('');
    } catch {
      setStatus('failed');
    }
  }

  if (status === 'sent') {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="cxo-glass-strong flex min-h-[520px] flex-col items-center justify-center rounded-[32px] p-8 text-center sm:p-12"
        role="status"
      >
        <motion.span
          initial={reduce ? false : { scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.2 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0D679] shadow-[0_18px_50px_rgba(240,214,121,0.55)]"
        >
          <Check className="h-10 w-10 text-[#111]" strokeWidth={2.5} />
        </motion.span>
        <h3 className="cxo-display mt-8 text-4xl">Thank you{firstName ? `, ${firstName}` : ''}.</h3>
        <p className="mt-4 max-w-sm leading-relaxed text-[#4B5563]">
          We have your details and will get in touch personally to understand what you are working through.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="cxo-focus mt-8 text-sm font-bold text-[#4B5563] underline underline-offset-4 hover:text-[#111]"
        >
          Send another response
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="cxo-glass-strong rounded-[32px] p-6 sm:p-9" aria-label="Express interest">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className={`block ${f.wide ? 'sm:col-span-2' : ''}`}>
            <span className="mb-2 block text-[13px] font-bold tracking-wide text-[#374151]">{f.label}</span>
            <input
              name={f.key}
              type={f.type}
              required
              autoComplete={f.autoComplete}
              placeholder={f.placeholder}
              className="cxo-input"
              {...(f.key === 'phone'
                ? { pattern: '[0-9\\s+\\-\\(\\)]{7,20}', title: 'A phone number, digits and + ( ) - only', inputMode: 'tel' as const }
                : {})}
            />
          </label>
        ))}
      </div>

      <fieldset className="mt-7">
        <legend className="mb-3 text-[13px] font-bold tracking-wide text-[#374151]">What are you looking for?</legend>
        <div className="grid gap-2.5">
          {LOOKING_FOR.map((o) => {
            const selected = choice === o.value;
            return (
              <label key={o.value} className={`cxo-choice ${selected ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="lookingFor"
                  value={o.value}
                  required
                  checked={selected}
                  onChange={() => setChoice(o.value)}
                  className="sr-only"
                />
                <span className="cxo-radio" aria-hidden="true">
                  {selected && (
                    <motion.span
                      layoutId="cxo-radio-dot"
                      className="h-2.5 w-2.5 rounded-full bg-[#111]"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}
                </span>
                <span>
                  <span className="block text-[15px] font-bold">{o.value}</span>
                  <span className="block text-[13px] opacity-70">{o.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {status === 'failed' && (
        <p role="alert" className="mt-5 rounded-2xl border border-[#C2416B]/30 bg-[#F49AB1]/15 p-4 text-sm text-[#111111]">
          That did not go through, most likely a connection problem. Please try again, or{' '}
          <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4">
            use the Google Form
          </a>
          .
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={status === 'sending'} className="cxo-btn cxo-btn-primary group disabled:opacity-60">
          {status === 'sending' ? (
            <>
              Sending <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Express interest <ArrowRight className="cxo-arrow h-4 w-4" />
            </>
          )}
        </button>
        <p className="text-xs text-[#6B7280]">All fields are required. We reply personally.</p>
      </div>
    </form>
  );
}
