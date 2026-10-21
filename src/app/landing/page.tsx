import { getRealLetters } from '@/lib/letters';
import SipasdApp from '@/components/SipasdApp';
import { demoUsers } from '@/data/users';

export const dynamic = 'force-dynamic';

export default async function LandingRoute() {
  const letters = await getRealLetters();
  return (
    <SipasdApp
      initialLetters={letters}
      initialUser={demoUsers[1]}
      initialPage="landing"
    />
  );
}
