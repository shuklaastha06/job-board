import Link from 'next/link';
import prisma from '@/lib/prisma';

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q || '';

  // Simple full text search implementation using Prisma
  const jobs = await prisma.job.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { company: { contains: query } },
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Browse Jobs</h1>
      
      <form style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          name="q" 
          defaultValue={query}
          placeholder="Search by title, company, or keywords..." 
          className="form-input"
          style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>
          Search
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {jobs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
            No jobs found matching your criteria.
          </p>
        ) : (
          jobs.map(job => (
            <Link href={`/jobs/${job.id}`} key={job.id}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--primary-color)' }}>{job.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{job.company} • {job.location}</p>
                </div>
                {job.salary && (
                  <div style={{ fontWeight: '500', color: 'var(--success)' }}>
                    {job.salary}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
