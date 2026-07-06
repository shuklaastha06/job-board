'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show the back button on the home page
  if (pathname === '/') return null;

  return (
    <button 
      onClick={() => router.back()} 
      className="btn" 
      style={{ 
        padding: '0.5rem 1rem', 
        fontSize: '0.875rem', 
        border: '1px solid var(--border-color)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginRight: '1rem',
        background: 'var(--card-bg)',
        color: 'var(--text-primary)'
      }}
    >
      ← Back
    </button>
  );
}
