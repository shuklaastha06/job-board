import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { recruiter: true }
  });

  if (!job) {
    return <div>Job not found</div>;
  }

  const session = await getServerSession(authOptions);
  
  let hasApplied = false;
  if (session?.user && (session.user as any).role === 'APPLICANT') {
    const existingApp = await prisma.application.findFirst({
      where: {
        jobId: job.id,
        applicantId: (session.user as any).id
      }
    });
    hasApplied = !!existingApp;
  }

  return (
    <div className="card" style={{ padding: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/jobs" className="btn" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Back to Jobs
        </Link>
      </div>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{job.title}</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
          {job.company} • {job.location}
        </p>
        {job.salary && <p style={{ marginTop: '0.5rem', color: 'var(--success)', fontWeight: 'bold' }}>{job.salary}</p>}
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Job Description</h2>
        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          {job.description}
        </div>
      </div>

      <div>
        {!session ? (
          <a href="/login" className="btn btn-primary">Sign in to Apply</a>
        ) : (session.user as any).role === 'RECRUITER' ? (
          <p style={{ color: 'var(--text-secondary)' }}>Recruiters cannot apply for jobs.</p>
        ) : hasApplied ? (
          <button className="btn" disabled style={{ backgroundColor: 'var(--success)', color: 'white', opacity: 0.8 }}>
            Already Applied
          </button>
        ) : (
          <form action="/api/apply" method="POST" encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
            <input type="hidden" name="jobId" value={job.id} />
            <div className="form-group">
              <label className="form-label">Resume (PDF)</label>
              <input type="file" name="resume" accept=".pdf" required className="form-input" />
            </div>
            <button type="submit" className="btn btn-primary">Submit Application</button>
          </form>
        )}
      </div>
    </div>
  );
}
