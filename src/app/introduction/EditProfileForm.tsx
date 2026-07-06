'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfileForm({ user, onCancel }: { user: any, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Parsing existing JSON data or using defaults
  const [basicDetails, setBasicDetails] = useState(user.basicDetailsData ? JSON.parse(user.basicDetailsData) : {});
  const [education, setEducation] = useState(user.educationData ? JSON.parse(user.educationData) : {
    highSchool: {}, intermediate: {}, ug: {}, pg: {}
  });
  const [workExperience, setWorkExperience] = useState<any[]>(user.workExperienceData ? JSON.parse(user.workExperienceData) : []);
  const [personalDetails, setPersonalDetails] = useState(user.personalDetailsData ? JSON.parse(user.personalDetailsData) : {});
  const [accomplishments, setAccomplishments] = useState(user.accomplishmentsData ? JSON.parse(user.accomplishmentsData) : {});
  const [socialLinks, setSocialLinks] = useState(user.socialLinksData ? JSON.parse(user.socialLinksData) : {});
  const [hobbies, setHobbies] = useState<string[]>(user.hobbies ? user.hobbies.split(',').filter(Boolean) : []);
  
  const [about, setAbout] = useState(user.about || '');
  const [skills, setSkills] = useState(user.skills || '');
  const [isGeneratingAbout, setIsGeneratingAbout] = useState(false);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  };

  const handleGenerateAbout = async () => {
    setIsGeneratingAbout(true);
    try {
      const res = await fetch('/api/ai/generate-about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details: JSON.stringify(basicDetails) })
      });
      const data = await res.json();
      if (data.text) setAbout(data.text);
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingAbout(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set('about', about);
    formData.set('skills', skills);
    formData.append('basicDetailsData', JSON.stringify(basicDetails));
    formData.append('educationData', JSON.stringify(education));
    formData.append('workExperienceData', JSON.stringify(workExperience));
    formData.append('personalDetailsData', JSON.stringify(personalDetails));
    formData.append('accomplishmentsData', JSON.stringify(accomplishments));
    formData.append('socialLinksData', JSON.stringify(socialLinks));

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onCancel();
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = ['Basic Details', 'About & Skills', 'Education', 'Work Experience', 'Accomplishments', 'Personal Details', 'Social Links'];
  const [activeTab, setActiveTab] = useState('Basic Details');

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Edit Your Profile</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn" style={{ padding: '0.75rem 2rem', fontSize: '1rem', border: '1px solid var(--border-color)' }}>
            Cancel
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Tabs Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '250px', background: 'var(--section-alt-bg)', padding: '1rem', borderRadius: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem',
                textAlign: 'left',
                background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div style={{ flex: 1, minHeight: '500px' }}>
          
          {/* BASIC DETAILS */}
          {activeTab === 'Basic Details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>Basic Details (Required)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {['First Name', 'Last Name', 'Email', 'Username', 'Mobile Number', 'Aadhar Verification'].map(field => {
                  const key = field.replace(/\s+/g, '');
                  return (
                    <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{field} *</label>
                      <input type="text" className="form-input" value={basicDetails[key] || ''} onChange={e => setBasicDetails({...basicDetails, [key]: e.target.value})} required />
                    </div>
                  );
                })}
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Gender *</label>
                  <select className="form-input" value={basicDetails.Gender || ''} onChange={e => setBasicDetails({...basicDetails, Gender: e.target.value})} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Domain *</label>
                  <select className="form-input" value={basicDetails.Domain || ''} onChange={e => setBasicDetails({...basicDetails, Domain: e.target.value})} required>
                    <option value="">Select Domain</option>
                    <option value="Management">Management</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Art and Science">Art and Science</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Law">Law</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {['Course', 'Course Specialization', 'Course Duration', 'College', 'Purpose', 'Career Goal', 'Preferred Work Location', 'Current Location'].map(field => {
                  const key = field.replace(/\s+/g, '');
                  return (
                    <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{field} *</label>
                      <input type="text" className="form-input" value={basicDetails[key] || ''} onChange={e => setBasicDetails({...basicDetails, [key]: e.target.value})} required />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABOUT & SKILLS */}
          {activeTab === 'About & Skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>About (Required)</h3>
                  <button type="button" onClick={handleGenerateAbout} className="btn" style={{ background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    {isGeneratingAbout ? 'Generating...' : '✨ Generate with AI'}
                  </button>
                </div>
                <textarea name="about" className="form-input" rows={5} value={about} onChange={e => setAbout(e.target.value)} placeholder="Describe yourself in 100 words..." required></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>Skills (Required)</h3>
                <input type="text" name="skills" className="form-input" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Add skills separated by commas (e.g. React, Node.js)" required />
              </div>
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === 'Education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>Education</h3>
              
              <div style={{ background: 'var(--section-alt-bg)', padding: '1.5rem', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>High School (Required)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" className="form-input" placeholder="School Name *" value={education.highSchool.school || ''} onChange={e => setEducation({...education, highSchool: {...education.highSchool, school: e.target.value}})} required />
                  <input type="text" className="form-input" placeholder="Percentage *" value={education.highSchool.percentage || ''} onChange={e => setEducation({...education, highSchool: {...education.highSchool, percentage: e.target.value}})} required />
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Marksheet (PDF) *</label>
                    <input type="file" accept="application/pdf" required={!education.highSchool.marksheet} onChange={async (e) => {
                      if(e.target.files?.[0]) {
                        const url = await handleFileUpload(e.target.files[0]);
                        setEducation({...education, highSchool: {...education.highSchool, marksheet: url}});
                      }
                    }} />
                    {education.highSchool.marksheet && <span style={{ marginLeft: '1rem', color: 'var(--success)' }}>✓ Uploaded</span>}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--section-alt-bg)', padding: '1.5rem', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Intermediate (Required)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" className="form-input" placeholder="School Name *" value={education.intermediate.school || ''} onChange={e => setEducation({...education, intermediate: {...education.intermediate, school: e.target.value}})} required />
                  <input type="text" className="form-input" placeholder="Percentage *" value={education.intermediate.percentage || ''} onChange={e => setEducation({...education, intermediate: {...education.intermediate, percentage: e.target.value}})} required />
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Marksheet (PDF) *</label>
                    <input type="file" accept="application/pdf" required={!education.intermediate.marksheet} onChange={async (e) => {
                      if(e.target.files?.[0]) {
                        const url = await handleFileUpload(e.target.files[0]);
                        setEducation({...education, intermediate: {...education.intermediate, marksheet: url}});
                      }
                    }} />
                    {education.intermediate.marksheet && <span style={{ marginLeft: '1rem', color: 'var(--success)' }}>✓ Uploaded</span>}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--section-alt-bg)', padding: '1.5rem', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Under Graduate (Required)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" className="form-input" placeholder="College Name *" value={education.ug.college || ''} onChange={e => setEducation({...education, ug: {...education.ug, college: e.target.value}})} required />
                  <input type="text" className="form-input" placeholder="CPA *" value={education.ug.cpa || ''} onChange={e => setEducation({...education, ug: {...education.ug, cpa: e.target.value}})} required />
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Marksheet (PDF) *</label>
                    <input type="file" accept="application/pdf" required={!education.ug.marksheet} onChange={async (e) => {
                      if(e.target.files?.[0]) {
                        const url = await handleFileUpload(e.target.files[0]);
                        setEducation({...education, ug: {...education.ug, marksheet: url}});
                      }
                    }} />
                    {education.ug.marksheet && <span style={{ marginLeft: '1rem', color: 'var(--success)' }}>✓ Uploaded</span>}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--section-alt-bg)', padding: '1.5rem', borderRadius: '8px', opacity: 0.8 }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Post Graduate (Optional)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" className="form-input" placeholder="College Name" value={education.pg.college || ''} onChange={e => setEducation({...education, pg: {...education.pg, college: e.target.value}})} />
                  <input type="text" className="form-input" placeholder="GPA" value={education.pg.gpa || ''} onChange={e => setEducation({...education, pg: {...education.pg, gpa: e.target.value}})} />
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Marksheet (PDF)</label>
                    <input type="file" accept="application/pdf" onChange={async (e) => {
                      if(e.target.files?.[0]) {
                        const url = await handleFileUpload(e.target.files[0]);
                        setEducation({...education, pg: {...education.pg, marksheet: url}});
                      }
                    }} />
                    {education.pg.marksheet && <span style={{ marginLeft: '1rem', color: 'var(--success)' }}>✓ Uploaded</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORK EXPERIENCE */}
          {activeTab === 'Work Experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>Work Experience</h3>
              {workExperience.map((work, idx) => (
                <div key={idx} style={{ background: 'var(--section-alt-bg)', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input type="text" className="form-input" placeholder="Designation *" value={work.designation || ''} onChange={e => {
                      const newExp = [...workExperience];
                      newExp[idx].designation = e.target.value;
                      setWorkExperience(newExp);
                    }} />
                    <input type="text" className="form-input" placeholder="Organisation *" value={work.organisation || ''} onChange={e => {
                      const newExp = [...workExperience];
                      newExp[idx].organisation = e.target.value;
                      setWorkExperience(newExp);
                    }} />
                    <input type="text" className="form-input" placeholder="Employment Type *" value={work.employmentType || ''} onChange={e => {
                      const newExp = [...workExperience];
                      newExp[idx].employmentType = e.target.value;
                      setWorkExperience(newExp);
                    }} />
                    <input type="text" className="form-input" placeholder="Location" value={work.location || ''} onChange={e => {
                      const newExp = [...workExperience];
                      newExp[idx].location = e.target.value;
                      setWorkExperience(newExp);
                    }} />
                    <input type="date" className="form-input" placeholder="Start Date" value={work.startDate || ''} onChange={e => {
                      const newExp = [...workExperience];
                      newExp[idx].startDate = e.target.value;
                      setWorkExperience(newExp);
                    }} />
                    <input type="date" className="form-input" placeholder="End Date" value={work.endDate || ''} onChange={e => {
                      const newExp = [...workExperience];
                      newExp[idx].endDate = e.target.value;
                      setWorkExperience(newExp);
                    }} />
                  </div>
                  <textarea className="form-input" rows={3} placeholder="Description" value={work.description || ''} onChange={e => {
                      const newExp = [...workExperience];
                      newExp[idx].description = e.target.value;
                      setWorkExperience(newExp);
                  }}></textarea>
                  <button type="button" onClick={async () => {
                    const res = await fetch('/api/ai/generate-work', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ designation: work.designation, organization: work.organisation, skills: 'Various' })
                    });
                    const data = await res.json();
                    const newExp = [...workExperience];
                    newExp[idx].description = data.text;
                    setWorkExperience(newExp);
                  }} className="btn" style={{ background: '#3B82F6', color: 'white', alignSelf: 'flex-start' }}>✨ Generate Description with AI</button>
                </div>
              ))}
              <button type="button" onClick={() => setWorkExperience([...workExperience, {}])} className="btn" style={{ border: '1px solid var(--primary-color)', color: 'var(--primary-color)', alignSelf: 'flex-start' }}>
                + Add Work Experience
              </button>
            </div>
          )}

          {/* ACCOMPLISHMENTS */}
          {activeTab === 'Accomplishments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>Accomplishments & Initiatives</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <input type="text" className="form-input" placeholder="Project Title" value={accomplishments.project || ''} onChange={e => setAccomplishments({...accomplishments, project: e.target.value})} />
                <textarea className="form-input" placeholder="Achievements and Responsibilities" rows={3} value={accomplishments.achievement || ''} onChange={e => setAccomplishments({...accomplishments, achievement: e.target.value})}></textarea>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Certificate (PDF)</label>
                  <input type="file" accept="application/pdf" onChange={async (e) => {
                    if(e.target.files?.[0]) {
                      const url = await handleFileUpload(e.target.files[0]);
                      setAccomplishments({...accomplishments, certificate: url});
                    }
                  }} />
                  {accomplishments.certificate && <span style={{ marginLeft: '1rem', color: 'var(--success)' }}>✓ Uploaded</span>}
                </div>
              </div>
            </div>
          )}

          {/* PERSONAL DETAILS */}
          {activeTab === 'Personal Details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pronouns</label>
                  <select className="form-input" value={personalDetails.pronouns || ''} onChange={e => setPersonalDetails({...personalDetails, pronouns: e.target.value})}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">DOB</label>
                  <input type="date" className="form-input" value={personalDetails.dob || ''} onChange={e => setPersonalDetails({...personalDetails, dob: e.target.value})} />
                </div>
              </div>
              
              <h4 style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Current Address</h4>
              <input type="text" className="form-input" placeholder="Address Line 1" value={personalDetails.currLine1 || ''} onChange={e => setPersonalDetails({...personalDetails, currLine1: e.target.value})} />
              <input type="text" className="form-input" placeholder="Address Line 2" value={personalDetails.currLine2 || ''} onChange={e => setPersonalDetails({...personalDetails, currLine2: e.target.value})} />
              <input type="text" className="form-input" placeholder="Pincode" value={personalDetails.currPincode || ''} onChange={e => setPersonalDetails({...personalDetails, currPincode: e.target.value})} />

              <h4 style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Permanent Address</h4>
              <input type="text" className="form-input" placeholder="Address Line 1" value={personalDetails.permLine1 || ''} onChange={e => setPersonalDetails({...personalDetails, permLine1: e.target.value})} />
              <input type="text" className="form-input" placeholder="Address Line 2" value={personalDetails.permLine2 || ''} onChange={e => setPersonalDetails({...personalDetails, permLine2: e.target.value})} />
            </div>
          )}

          {/* SOCIAL LINKS */}
          {activeTab === 'Social Links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>Social Links</h3>
              <input type="url" className="form-input" placeholder="LinkedIn URL" value={socialLinks.linkedin || ''} onChange={e => setSocialLinks({...socialLinks, linkedin: e.target.value})} />
              <input type="url" className="form-input" placeholder="GitHub URL" value={socialLinks.github || ''} onChange={e => setSocialLinks({...socialLinks, github: e.target.value})} />
              <input type="url" className="form-input" placeholder="Instagram URL (Optional)" value={socialLinks.instagram || ''} onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} />
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
