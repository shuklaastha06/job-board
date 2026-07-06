import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function PostJobPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "RECRUITER") {
    redirect("/dashboard")
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Post a New Job</h1>
      
      <form action="/api/jobs" method="POST" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Job Title</label>
          <input type="text" name="title" required className="form-input" placeholder="e.g. Senior Frontend Developer" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input type="text" name="company" required className="form-input" placeholder="e.g. Acme Corp" />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input type="text" name="location" required className="form-input" placeholder="e.g. Remote, San Francisco" />
          </div>
          <div className="form-group">
            <label className="form-label">Salary (Optional)</label>
            <input type="text" name="salary" className="form-input" placeholder="e.g. $120k - $150k" />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            name="description" 
            required 
            className="form-input" 
            rows={6}
            placeholder="Describe the role, responsibilities, and requirements..."
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
          Publish Job
        </button>
      </form>
    </div>
  )
}
