import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import StatusChanger from "./StatusChanger"

export default async function JobApplicantsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/dashboard")
  }

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      applications: {
        include: { applicant: true },
        orderBy: { appliedAt: 'desc' }
      }
    }
  })

  if (!job) {
    return <div>Job not found</div>
  }

  // Ensure this recruiter owns this job
  if (job.recruiterId !== (session.user as any).id) {
    redirect("/dashboard")
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard" className="btn" style={{ border: '1px solid var(--border-color)' }}>
          &larr; Back
        </Link>
        <h1 style={{ fontSize: '2.5rem' }}>{job.title}</h1>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Applicants ({job.applications.length})</h2>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {job.applications.length === 0 ? (
          <p className="card" style={{ textAlign: 'center' }}>No applications yet.</p>
        ) : (
          job.applications.map(app => (
            <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{app.applicant.name || app.applicant.email}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <StatusChanger applicationId={app.id} currentStatus={app.status} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  View Resume
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

