'use client';

import { useState } from 'react';
import EditProfileForm from './EditProfileForm';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function IntroductionClient({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const router = useRouter();

  // Parsing JSON data
  const basicDetails = user.basicDetailsData ? JSON.parse(user.basicDetailsData) : {};
  const education = user.educationData ? JSON.parse(user.educationData) : null;
  const workExperience = user.workExperienceData ? JSON.parse(user.workExperienceData) : [];
  const personalDetails = user.personalDetailsData ? JSON.parse(user.personalDetailsData) : {};
  const accomplishments = user.accomplishmentsData ? JSON.parse(user.accomplishmentsData) : {};
  const socialLinks = user.socialLinksData ? JSON.parse(user.socialLinksData) : {};
  const skills = user.skills ? user.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  const handleGenerateResume = async () => {
    setIsGeneratingResume(true);
    try {
      const res = await fetch('/api/ai/generate-resume', { method: 'POST' });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingResume(false);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-content');
    if (element && typeof window !== 'undefined' && (window as any).html2pdf) {
      const opt = {
        margin:       1,
        filename:     `${basicDetails.FirstName || 'User'}_${basicDetails.LastName || ''}_Resume.pdf`.trim(),
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      (window as any).html2pdf().set(opt).from(element).save();
    } else {
      alert("PDF generator is still loading or unavailable. Please try again in a few seconds.");
    }
  };

  const [activeTab, setActiveTab] = useState('About');
  const tabs = ['About', 'Education', 'Work Experience', 'Skills & Accomplishments', 'Personal Info'];

  const formatResume = (text: string) => {
    if (!text) return { __html: '' };
    let html = text
      .replace(/</g, '&lt;') // Sanitize slightly
      .replace(/>/g, '&gt;')
      .replace(/^### (.*$)/gim, '<h3 style="color: #2563EB; margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.3rem;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color: #1E3A8A; border-bottom: 2px solid #BFDBFE; padding-bottom: 0.5rem; margin-top: 2rem; margin-bottom: 1rem; font-size: 1.6rem; text-transform: uppercase; letter-spacing: 1px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="color: #1E3A8A; margin-bottom: 1rem; font-size: 2.2rem; text-align: center; text-transform: uppercase;">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #111827;">$1</strong>')
      .replace(/^\* (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem; list-style-type: disc;">$1</li>')
      .replace(/^- (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem; list-style-type: disc;">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563EB; text-decoration: none; font-weight: 500;">$1</a>');
      
    // Handle newlines that aren't part of lists or headers
    html = html.replace(/\n(?!(<h|<li))/g, '<br>');
    return { __html: html };
  };

  if (isEditing) {
    return <EditProfileForm user={user} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button onClick={handleGenerateResume} disabled={isGeneratingResume} className="btn" style={{ background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', color: 'white', padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
          {isGeneratingResume ? 'Generating Resume...' : '📄 Generate AI Resume'}
        </button>
        <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
          ✎ Edit Profile
        </button>
      </div>

      {user.aiResumeData && (
        <div className="card" style={{ marginBottom: '3rem', border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0 }}>✨ Your Professional Resume</h2>
            <button onClick={handleDownloadPDF} className="btn" style={{ background: '#2563EB', color: 'white', padding: '0.75rem 1.5rem', fontWeight: 600, boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
              ⬇️ Download PDF
            </button>
          </div>
          <div 
            id="resume-content" 
            style={{ 
              fontFamily: '"Inter", "Arial", sans-serif', 
              fontSize: '1.05rem', 
              lineHeight: 1.7, 
              color: '#000000', 
              background: '#ffffff', 
              padding: '4rem 3rem', 
              borderRadius: '8px', 
              border: '4px solid #2563EB', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '850px',
              margin: '0 auto'
            }}
            dangerouslySetInnerHTML={formatResume(user.aiResumeData)}
          />
        </div>
      )}

      {/* Hero Section of Profile */}
      <div className="card" style={{ marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(52,211,153,0.05) 100%)' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{basicDetails.FirstName} {basicDetails.LastName}</h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--primary-color)', fontWeight: 600 }}>{basicDetails.Course} - {basicDetails.CourseSpecialization}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', flexWrap: 'wrap', fontSize: '1.1rem' }}>
            {basicDetails.Email ? (
              <a href={`mailto:${basicDetails.Email}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
                📧 {basicDetails.Email}
              </a>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>📧 Not provided</span>
            )}
            
            {basicDetails.MobileNumber ? (
              <a href={`tel:${basicDetails.MobileNumber}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
                📱 {basicDetails.MobileNumber}
              </a>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>📱 Not provided</span>
            )}
            
            {basicDetails.CurrentLocation ? (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(basicDetails.CurrentLocation)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
                📍 {basicDetails.CurrentLocation}
              </a>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>📍 Not provided</span>
            )}
            
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              🎯 {basicDetails.Domain || 'Not provided'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        {/* Tabs Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '250px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '1rem' }}>
          <h3 style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sections</h3>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem',
                textAlign: 'left',
                background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                fontSize: '1rem'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div style={{ flex: 1, minHeight: '400px' }}>
          
          {activeTab === 'About' && (
            <section className="card animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>👋 About Me</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{user.about || 'Not provided'}</p>
            </section>
          )}

          {activeTab === 'Education' && (
            <section className="card animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--success)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>🎓 Education</h2>
              {education ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {education.ug?.college && (
                    <div style={{ background: 'var(--section-alt-bg)', padding: '1.5rem', borderRadius: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Undergraduate: {education.ug.college}</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>CPA: {education.ug.cpa}</p>
                      {education.ug.marksheet && <a href={education.ug.marksheet} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }}>View Marksheet PDF</a>}
                    </div>
                  )}
                  {education.intermediate?.school && (
                    <div style={{ background: 'var(--section-alt-bg)', padding: '1.5rem', borderRadius: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Intermediate: {education.intermediate.school}</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Percentage: {education.intermediate.percentage}</p>
                      {education.intermediate.marksheet && <a href={education.intermediate.marksheet} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }}>View Marksheet PDF</a>}
                    </div>
                  )}
                  {education.highSchool?.school && (
                    <div style={{ background: 'var(--section-alt-bg)', padding: '1.5rem', borderRadius: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>High School: {education.highSchool.school}</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Percentage: {education.highSchool.percentage}</p>
                      {education.highSchool.marksheet && <a href={education.highSchool.marksheet} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }}>View Marksheet PDF</a>}
                    </div>
                  )}
                </div>
              ) : <p style={{ color: 'var(--text-secondary)' }}>No education details provided.</p>}
            </section>
          )}

          {activeTab === 'Work Experience' && (
            <section className="card animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--accent)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>💼 Work Experience</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {workExperience.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No work experience.</p> : workExperience.map((exp: any, index: number) => (
                  <div key={index} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{exp.designation} at {exp.organisation}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{exp.startDate} - {exp.endDate} | {exp.employmentType} | {exp.location}</p>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'Skills & Accomplishments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section className="card animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>⚡ Skills</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {skills.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No skills listed.</p> : skills.map((skill: string, index: number) => (
                    <span key={index} className="badge" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>{skill}</span>
                  ))}
                </div>
              </section>

              <section className="card animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', color: '#F59E0B', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>🏆 Accomplishments</h2>
                <div>
                  {accomplishments.project && <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{accomplishments.project}</h3>}
                  {accomplishments.achievement && <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{accomplishments.achievement}</p>}
                  {accomplishments.certificate && <a href={accomplishments.certificate} target="_blank" rel="noopener noreferrer" className="btn btn-primary">View Certificate PDF</a>}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'Personal Info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section className="card animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>✨ Personal Details</h2>
                <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                  <p><strong>Pronouns:</strong> {personalDetails.pronouns || 'N/A'}</p>
                  <p><strong>DOB:</strong> {personalDetails.dob || 'N/A'}</p>
                  <p><strong>Current Address:</strong> {personalDetails.currLine1}, {personalDetails.currLine2}, {personalDetails.currPincode}</p>
                  <p><strong>Permanent Address:</strong> {personalDetails.permLine1}, {personalDetails.permLine2}</p>
                </div>
              </section>

              <section className="card animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', color: '#3B82F6', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>🌐 Social Links</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem' }}>
                  {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>🔗 LinkedIn Profile</a>}
                  {socialLinks.github && <a href={socialLinks.github} target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>🐙 GitHub Profile</a>}
                  {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>📸 Instagram Profile</a>}
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
