import { getSession } from '@/lib/auth';
import { getRealLetters } from '@/lib/letters';
import { getPublicLandingStats } from '@/lib/stats';
import SipasdApp from '@/components/SipasdApp';
import { demoUsers } from '@/data/users';

export const dynamic = 'force-dynamic';

export default async function LandingRoute() {
  const session = await getSession();
  const letters = session ? await getRealLetters() : [];
  const publicCounts = session ? undefined : await getPublicLandingStats();
  const user = session ? demoUsers.find((u) => u.username === session.username) || null : null;
  return (
    <SipasdApp
      initialLetters={letters}
      initialUser={user}
      initialPage="landing"
      isAuthenticated={Boolean(session)}
      initialCounts={publicCounts}
      allowDemoLogin={process.env.ALLOW_DEMO_LOGIN === 'true'}
    />
  );
}
