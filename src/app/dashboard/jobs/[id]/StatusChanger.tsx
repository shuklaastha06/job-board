"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function StatusChanger({ applicationId, currentStatus }: { applicationId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true)
    const newStatus = e.target.value

    try {
      await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <select 
      value={currentStatus} 
      onChange={handleStatusChange}
      disabled={loading}
      className={`badge badge-${currentStatus.toLowerCase()}`}
      style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
    >
      <option value="PENDING">PENDING</option>
      <option value="REVIEWED">REVIEWED</option>
      <option value="ACCEPTED">ACCEPTED</option>
      <option value="REJECTED">REJECTED</option>
    </select>
  )
}
