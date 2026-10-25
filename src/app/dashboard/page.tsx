import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getRealLetters } from '@/lib/letters';
import SipasdApp from '@/components/SipasdApp';
import { demoUsers } from '@/data/users';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ view?: string }>;
}

export default async function DashboardRoute({ searchParams }: Props) {
  const [session, params] = await Promise.all([
    getSession(),
    searchParams ? searchParams : Promise.resolve({ view: 'dashboard' }),
  ]);
  if (!session) {
    redirect('/login');
  }

  const letters = await getRealLetters();
  const user = demoUsers.find((u) => u.username === session.username) || {
    username: session.username,
    name: session.namaLengkap,
    role: session.jabatan,
    label: session.role,
    initials: session.namaLengkap.slice(0, 2).toUpperCase(),
  };

  return (
    <SipasdApp
      initialLetters={letters}
      initialUser={user}
      initialPage={params?.view || 'dashboard'}
    />
  );
}
