'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { SERVICE_TIERS, type ServiceTier } from '@/lib/auth';

const intakeSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  answers: z.record(z.string(), z.string()),
  suggestedTier: z.enum(SERVICE_TIERS as [ServiceTier, ...ServiceTier[]]),
  intentScore: z.number().int().nonnegative(),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

export interface IntakeResult {
  ok: boolean;
  /** True when the submission was written to the database. */
  persisted: boolean;
  error?: string;
}

/**
 * Persists an intake submission before authentication. Persistence is
 * best-effort: without a configured database (demo mode) the flow still
 * succeeds so the user can continue to authentication.
 */
export async function submitIntake(input: IntakeInput): Promise<IntakeResult> {
  const parsed = intakeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, persisted: false, error: parsed.error.issues[0]?.message ?? 'Invalid intake.' };
  }

  if (!prisma) {
    // No database configured — accept the submission without storing it.
    return { ok: true, persisted: false };
  }

  try {
    await prisma.intakeSubmission.create({
      data: {
        email: parsed.data.email,
        answers: parsed.data.answers,
        intentScore: parsed.data.intentScore,
        suggestedTier: parsed.data.suggestedTier,
      },
    });
    return { ok: true, persisted: true };
  } catch (error) {
    // Don't block the conversion flow on a storage failure — log and proceed.
    console.error('Failed to persist intake submission:', error);
    return { ok: true, persisted: false, error: 'Could not save your responses, but you can continue.' };
  }
}
