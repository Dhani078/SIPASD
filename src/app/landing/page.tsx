import { getSession } from '@/lib/auth';
import { getRealLetters } from '@/lib/letters';
import SipasdApp from '@/components/SipasdApp';
import { demoUsers } from '@/data/users';

export const dynamic = 'force-dynamic';

export default async function LandingRoute() {
  const [session, letters] = await Promise.all([getSession(), getRealLetters()]);
  const user = session ? demoUsers.find((u) => u.username === session.username) || null : null;
  return (
    <SipasdApp
      initialLetters={letters}
      initialUser={user}
      initialPage="landing"
      isAuthenticated={Boolean(session)}
    />
  );
}
