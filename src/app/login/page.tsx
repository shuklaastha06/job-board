"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard"
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else if (res?.url) {
      window.location.href = res.url
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="card">
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Sign In</h1>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input" 
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input" 
            placeholder="Your password"
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Don't have an account? <Link href="/register" style={{ color: 'var(--primary-color)' }}>Sign up here</Link>
      </p>
    </div>
  )
}
