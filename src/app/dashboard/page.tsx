import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import EditResumeForm from "./EditResumeForm"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const role = (session.user as any).role
  const userId = (session.user as any).id

  if (role === "RECRUITER") {
    const jobs = await prisma.job.findMany({
      where: { recruiterId: userId },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem' }}>Recruiter Dashboard</h1>
          <Link href="/dashboard/post-job" className="btn btn-primary">Post New Job</Link>
        </div>
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Your Job Postings</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {jobs.length === 0 ? (
            <p className="card" style={{ textAlign: 'center' }}>You haven't posted any jobs yet.</p>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{job.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{job.company} • {job.location}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{job._count.applications}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Applicants</div>
                  </div>
                  <Link href={`/dashboard/jobs/${job.id}`} className="btn" style={{ border: '1px solid var(--border-color)' }}>
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // APPLICANT View
  const applications = await prisma.application.findMany({
    where: { applicantId: userId },
    include: { job: true },
    orderBy: { appliedAt: 'desc' }
  })

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Applicant Dashboard</h1>
      
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Your Applications</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem' }}>You haven't applied to any jobs yet.</p>
            <Link href="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          applications.map(app => (
            <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{app.job.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{app.job.company} • Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                  </div>
                  {app.atsScore !== null && (
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: app.atsScore >= 7 ? 'var(--success)' : 'var(--error)' }}>
                      ATS Score: {app.atsScore}/10
                    </div>
                  )}
                </div>
              </div>
              {app.status === 'REJECTED' && app.rejectionReason && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <p style={{ margin: 0, color: 'var(--error)', fontSize: '0.875rem' }}>
                    <strong>Rejection Reason:</strong> {app.rejectionReason}
                  </p>
                </div>
              )}
              <EditResumeForm applicationId={app.id} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
