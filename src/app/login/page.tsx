import SipasdApp from '@/components/SipasdApp';
import { demoUsers } from '@/data/users';

export const dynamic = 'force-dynamic';

export default async function LoginRoute() {
  return (
    <SipasdApp
      initialLetters={[]}
      initialUser={demoUsers[1]}
      initialPage="login"
    />
  );
}
