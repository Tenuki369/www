'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { ServiceTier } from '@/lib/auth';
import { TIER_META } from '@/lib/tiers';
import { submitIntake } from '@/lib/intake-actions';

type TierWeights = Partial<Record<ServiceTier, number>>;

interface Choice {
  label: string;
  weights: TierWeights;
}

interface Question {
  id: string;
  prompt: string;
  helper: string;
  choices: Choice[];
}

const QUESTIONS: Question[] = [
  {
    id: 'primary-need',
    prompt: 'What is the operating problem you most need to solve first?',
    helper: 'Company profile — your dominant pain point sets the initial routing.',
    choices: [
      { label: 'Moving money: payments, reconciliation, liquidity', weights: { FINANCIAL: 3 } },
      { label: 'Delivering expert-led projects with compliance', weights: { ADVISORY: 3 } },
      { label: 'Building APIs, automations, and AI workflows', weights: { INFRASTRUCTURE: 3 } },
      { label: 'Dispatching fleets and optimizing physical assets', weights: { LOGISTICS: 3 } },
    ],
  },
  {
    id: 'footprint',
    prompt: 'Where does most of your operational complexity live?',
    helper: 'Operating footprint — this confirms or broadens the primary signal.',
    choices: [
      { label: 'Finance and treasury operations', weights: { FINANCIAL: 2 } },
      { label: 'Client engagements and managed services', weights: { ADVISORY: 2 } },
      { label: 'Engineering and platform teams', weights: { INFRASTRUCTURE: 2 } },
      { label: 'Warehouses, drivers, and transportation', weights: { LOGISTICS: 2 } },
      { label: 'All of the above — we span every function', weights: { ALL_INCLUSIVE: 4 } },
    ],
  },
  {
    id: 'breadth',
    prompt: 'How many of these capabilities do you expect to run on one platform?',
    helper: 'Tier intent — breadth is the strongest signal for the All-Inclusive plane.',
    choices: [
      { label: 'Just one focused area for now', weights: {} },
      { label: 'Two areas that need to share context', weights: { ALL_INCLUSIVE: 2 } },
      { label: 'Three or more — we want a single operating system', weights: { ALL_INCLUSIVE: 5 } },
    ],
  },
  {
    id: 'urgency',
    prompt: 'What is your timeline to go live?',
    helper: 'Urgency — does not change the tier, but shapes onboarding.',
    choices: [
      { label: 'This quarter', weights: {} },
      { label: 'Next quarter', weights: {} },
      { label: 'Exploring options', weights: {} },
    ],
  },
];

function suggestTier(weights: TierWeights): ServiceTier {
  const entries = Object.entries(weights) as [ServiceTier, number][];
  if (entries.length === 0) {
    return 'ALL_INCLUSIVE';
  }
  const allInclusive = weights.ALL_INCLUSIVE ?? 0;
  const pillarEntries = entries.filter(([key]) => key !== 'ALL_INCLUSIVE');
  const topPillar = pillarEntries.sort((a, b) => b[1] - a[1])[0];

  // The unified plane wins when breadth signals outweigh any single pillar.
  if (allInclusive >= (topPillar?.[1] ?? 0)) {
    return 'ALL_INCLUSIVE';
  }
  return topPillar[0];
}

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, Choice>>({});
  const [email, setEmail] = React.useState('');
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, startSubmit] = React.useTransition();

  const total = QUESTIONS.length;
  const isReview = step >= total;
  const current = QUESTIONS[step];

  const weights = React.useMemo(() => {
    const acc: TierWeights = {};
    for (const choice of Object.values(answers)) {
      for (const [tier, weight] of Object.entries(choice.weights) as [ServiceTier, number][]) {
        acc[tier] = (acc[tier] ?? 0) + weight;
      }
    }
    return acc;
  }, [answers]);

  const suggested = suggestTier(weights);
  const suggestedMeta = TIER_META[suggested];
  const intentScore = Math.max(0, ...Object.values(weights), 0);

  const select = (choice: Choice) => {
    setAnswers((prev) => ({ ...prev, [current.id]: choice }));
    setStep((s) => s + 1);
  };

  const finish = () => {
    setSubmitError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError('Enter a valid email address.');
      return;
    }
    const serialized = Object.fromEntries(
      Object.entries(answers).map(([id, choice]) => [id, choice.label]),
    );
    startSubmit(async () => {
      // Persistence is best-effort; route into auth regardless of the result.
      const result = await submitIntake({
        email,
        answers: serialized,
        suggestedTier: suggested,
        intentScore,
      });
      if (!result.ok && result.error) {
        setSubmitError(result.error);
        return;
      }
      router.push(`/login?tier=${suggested}`);
    });
  };

  const progress = Math.round((Math.min(step, total) / total) * 100);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-3xl flex-col justify-center px-6 py-16">
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
            Dynamic intake
          </p>
          <p className="text-xs text-[rgb(var(--muted))]">
            {isReview ? 'Complete' : `Step ${step + 1} of ${total}`}
          </p>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[rgb(var(--accent))] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!isReview ? (
          <div className="mt-8">
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{current.prompt}</h1>
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">{current.helper}</p>

            <div className="mt-6 grid gap-3">
              {current.choices.map((choice) => (
                <button
                  key={choice.label}
                  type="button"
                  onClick={() => select(choice)}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-left text-sm font-medium text-white transition hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/5"
                >
                  <span>{choice.label}</span>
                  <span aria-hidden className="text-[rgb(var(--muted))]">
                    →
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="text-[rgb(var(--muted))] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Back
              </button>
              <a className="text-[rgb(var(--muted))] transition hover:text-white" href="/">
                Cancel
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Your recommended tier
            </h1>
            <div className="mt-6 rounded-2xl border border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent))]/5 p-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--accent))] uppercase">
                {suggestedMeta.tagline}
              </p>
              <p className="mt-2 text-2xl font-black text-white">{suggestedMeta.name}</p>
              <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">{suggestedMeta.description}</p>
            </div>

            <label className="mt-6 block">
              <span className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] uppercase">
                Work email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[rgb(var(--accent))]"
              />
              <span className="mt-2 block text-xs text-[rgb(var(--muted))]">
                We save your responses against this email so your workspace is ready at sign-in.
              </span>
            </label>

            {submitError ? (
              <p className="mt-4 rounded-xl border border-[rgb(var(--danger))]/40 bg-[rgb(var(--danger))]/10 px-4 py-3 text-sm text-[rgb(var(--danger))]">
                {submitError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={finish}
                disabled={isSubmitting}
                className="rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : 'Continue to authentication'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setStep(0);
                  setEmail('');
                  setSubmitError(null);
                }}
                className="rounded-full border border-[rgb(var(--border))] bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
