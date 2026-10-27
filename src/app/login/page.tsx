import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import SipasdApp from '@/components/SipasdApp';

export const dynamic = 'force-dynamic';

export default async function LoginRoute() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <SipasdApp
      initialLetters={[]}
      initialUser={null}
      initialPage="login"
      isAuthenticated={false}
    />
  );
}
