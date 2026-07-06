import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import IntroductionClient from './IntroductionClient';
import Link from 'next/link';

export default async function IntroductionPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Authentication Required</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>
          Please sign in to view and edit your personal introduction profile.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 3rem' }}>
          Sign In Now
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id }
  });

  if (!user) {
    return <div className="container" style={{ paddingTop: '4rem' }}>User not found.</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          My Introduction
        </h1>
        <div style={{ width: '80px', height: '6px', background: 'linear-gradient(90deg, var(--primary-color), var(--accent))', margin: '0 auto', borderRadius: '3px' }}></div>
        <p style={{ marginTop: '2rem', fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '2rem auto 0 auto' }}>
          Welcome to your personal profile. Here you can edit your qualifications, interests, and contact details.
        </p>
      </div>

      <IntroductionClient user={user} />
    </div>
  );
}
