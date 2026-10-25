import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import SipasdApp from '@/components/SipasdApp';
import { demoUsers } from '@/data/users';

export const dynamic = 'force-dynamic';

export default async function LoginRoute() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <SipasdApp
      initialLetters={[]}
      initialUser={demoUsers[1]}
      initialPage="login"
    />
  );
}
