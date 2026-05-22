'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEMO_TIER_COOKIE, isServiceTier } from '@/lib/auth';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Binds the demo session to a service tier and routes into the workspace.
 * Used by the login surface and the in-app tier switcher.
 */
export async function startDemoSession(formData: FormData) {
  const tier = formData.get('tier');

  if (typeof tier !== 'string' || !isServiceTier(tier)) {
    redirect('/login?error=invalid-tier');
  }

  const cookieStore = await cookies();
  cookieStore.set(DEMO_TIER_COOKIE, tier, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  // Only honor in-app paths to avoid open-redirects.
  const redirectTo = formData.get('redirect');
  const target =
    typeof redirectTo === 'string' && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';

  redirect(target);
}

/**
 * Clears the demo session and returns the user to the public plane.
 */
export async function endDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_TIER_COOKIE);
  redirect('/login');
}
