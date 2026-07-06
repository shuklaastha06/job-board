'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditResumeForm({ applicationId }: { applicationId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/applications/${applicationId}/update`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh(); // Refresh the dashboard data without a full page reload
      } else {
        console.error('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)} 
        style={{ fontSize: '0.875rem', padding: '0.5rem 0', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline' }}
      >
        Re-upload Resume
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
      <input type="file" name="resume" accept=".pdf" required style={{ flex: 1, padding: '0.25rem', border: 'none', background: 'transparent', color: 'var(--text-primary)' }} />
      <button type="submit" disabled={isSubmitting} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', border: 'none', background: 'var(--card-bg)', color: 'var(--primary-color)', cursor: isSubmitting ? 'not-allowed' : 'pointer', borderRadius: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      <button type="button" onClick={() => setIsEditing(false)} disabled={isSubmitting} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>Cancel</button>
    </form>
  );
}
