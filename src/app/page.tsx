import { getSession } from '@/lib/auth';
import { getRealLetters } from '@/lib/letters';
import SipasdApp from '@/components/SipasdApp';
import { demoUsers } from '@/data/users';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ view?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const [session, letters, params] = await Promise.all([
    getSession(),
    getRealLetters(),
    searchParams ? searchParams : Promise.resolve({ view: undefined }),
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

  const initialPage = session ? (params?.view || 'dashboard') : 'landing';

  return (
    <SipasdApp
      initialLetters={letters}
      initialUser={user}
      initialPage={initialPage}
    />
  );
}
