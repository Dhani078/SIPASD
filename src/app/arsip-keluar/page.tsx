import { getSession } from '@/lib/auth';
import { getRealLetters } from '@/lib/letters';
import SipasdApp from '@/components/SipasdApp';
import { demoUsers } from '@/data/users';

export const dynamic = 'force-dynamic';

export default async function ArsipKeluarRoute() {
  const [session, letters] = await Promise.all([
    getSession(),
    getRealLetters(),
  ]);

  const user = session
    ? demoUsers.find((u) => u.username === session.username) || {
        username: session.username,
        name: session.namaLengkap,
        role: session.jabatan,
        label: session.role,
        initials: session.namaLengkap.slice(0, 2).toUpperCase(),
      }
    : demoUsers[1];

  return (
    <SipasdApp
      initialLetters={letters}
      initialUser={user}
      initialPage="out"
    />
  );
}
