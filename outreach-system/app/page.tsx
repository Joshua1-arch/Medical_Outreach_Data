import { auth } from '@/auth';
import StaticHome from '@/app/components/StaticHome';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  
  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  // Otherwise, show the home page
  return <StaticHome />;
}