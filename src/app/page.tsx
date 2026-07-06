"use client"
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// 3D Tilt Card Component
function TiltCard({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [style, setStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' });
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [delay]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="card"
      style={{ 
        ...style, 
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? style.transform : 'perspective(1000px) translateY(50px)',
        transition: isVisible && style.transform.includes('scale3d(1, 1, 1)') ? 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : style.transition
      }}
    >
      {children}
    </div>
  );
}

// Parallax Section Component
function ScrollSection({ children, background }: { children: React.ReactNode, background?: string }) {
  const [offset, setOffset] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setOffset(rect.top * 0.2); 
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} style={{ position: 'relative', overflow: 'hidden', background }}>
      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0,
        transform: `translateY(${offset}px)`,
        zIndex: -1,
        opacity: 0.1,
        background: 'radial-gradient(circle at center, var(--primary-color) 0%, transparent 70%)'
      }}></div>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <div style={{ perspective: '1px', overflowX: 'hidden' }}>
      
      {/* Hero Section */}
      <ScrollSection>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'var(--primary-color)', filter: 'blur(120px)', opacity: 'var(--glow-opacity)', zIndex: -1, animation: 'float 8s infinite alternate' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 'var(--glow-opacity)', zIndex: -1, animation: 'float 6s infinite alternate-reverse' }}></div>
        
        <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '6rem', 
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.5rem', 
            color: 'var(--text-primary)',
          }}>
            Shape Your <br/>
            <span style={{ display: 'inline-block', animation: 'float 4s ease-in-out infinite' }}>
              <span style={{ 
                backgroundImage: 'linear-gradient(135deg, var(--primary-color), var(--accent), var(--primary-hover))', 
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}>Future</span>
            </span> Today.
          </h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            A dynamic, 3D-powered platform connecting elite talent with visionary companies worldwide.
          </p>
          
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <Link href="/jobs" className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 3rem', borderRadius: '50px' }}>
              Explore Jobs
            </Link>
            <Link href="/introduction" className="btn" style={{ padding: '1rem 3rem', fontSize: '1.25rem', borderRadius: '50px', border: '1px solid var(--border-color)', background: 'var(--nav-bg)' }}>
              My Introduction
            </Link>
          </div>
        </div>
      </ScrollSection>

      {/* About Section */}
      <ScrollSection background="var(--section-alt-bg)">
        <div id="about" className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>About CareerBoard</h2>
            <div style={{ width: '80px', height: '6px', background: 'linear-gradient(90deg, var(--primary-color), var(--accent))', margin: '0 auto', borderRadius: '3px' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <TiltCard delay={0}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>For Applicants</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Experience a frictionless application process. Upload your resume once, track your progress in real-time, and get hired faster than ever with our intelligent matching system.
              </p>
            </TiltCard>
            
            <TiltCard delay={200}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>For Recruiters</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Manage your hiring pipeline with our cutting-edge ATS. Filter candidates, update statuses instantly with interactive boards, and communicate effortlessly.
              </p>
            </TiltCard>
            
            <TiltCard delay={400}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Lightning Fast</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Built on Next.js 14 and powered by modern database infrastructure, ensuring you never wait for a page load during your critical hiring workflows.
              </p>
            </TiltCard>
          </div>
        </div>
      </ScrollSection>

      {/* Contact Section */}
      <ScrollSection>
        <div id="contact" className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Contact Us</h2>
            <div style={{ width: '80px', height: '6px', background: 'linear-gradient(90deg, var(--accent), var(--primary-color))', margin: '0 auto', borderRadius: '3px' }}></div>
          </div>
          
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <TiltCard>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Name</label>
                    <input type="text" className="form-input" placeholder="Your Name" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" placeholder="hello@example.com" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows={6} placeholder="How can we help you?"></textarea>
                </div>
                <button type="button" className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.2rem', marginTop: '1rem', borderRadius: '10px' }}>
                  Send Message
                </button>
              </form>
            </TiltCard>
          </div>
        </div>
      </ScrollSection>

      {/* Dedicated Footer */}
      <footer className="footer">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
          <div>
            <div className="nav-brand" style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'inline-block' }}>CareerBoard</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              The premium destination for modern hiring. Building the bridge between exceptional talent and visionary companies.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontSize: '1.3rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)' }}>
              <Link href="/jobs" style={{ transition: 'color 0.2s' }}>Browse Jobs</Link>
              <Link href="/dashboard" style={{ transition: 'color 0.2s' }}>Recruiter Dashboard</Link>
              <Link href="/login" style={{ transition: 'color 0.2s' }}>Sign In</Link>
            </div>
          </div>
          
          <div>
            <h4 style={{ fontSize: '1.3rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)' }}>
              <a href="#" style={{ transition: 'color 0.2s' }}>Privacy Policy</a>
              <a href="#" style={{ transition: 'color 0.2s' }}>Terms of Service</a>
              <a href="#" style={{ transition: 'color 0.2s' }}>Cookie Policy</a>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '5rem', paddingTop: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>&copy; {new Date().getFullYear()} CareerBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
