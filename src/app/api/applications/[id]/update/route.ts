import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { evaluateResumeWithClaude } from '@/lib/atsScorer';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'APPLICANT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applicationId = params.id;
  
  // Verify application belongs to user
  const existingApp = await prisma.application.findUnique({
    where: { id: applicationId }
  });

  if (!existingApp || existingApp.applicantId !== (session.user as any).id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
  }

  const formData = await request.formData();
  const resume = formData.get('resume') as File;

  if (!resume) {
    return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
  }

  // Fetch Job to get description for ATS scoring
  const job = await prisma.job.findUnique({
    where: { id: existingApp.jobId },
    select: { description: true }
  });

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const resumeUrl = `https://mock-s3-bucket.s3.amazonaws.com/resumes/${Date.now()}-mock-updated.pdf`;
  
  // Get ArrayBuffer from uploaded file
  const resumeBuffer = await resume.arrayBuffer();

  // Evaluate Resume using Claude AI
  const evaluation = await evaluateResumeWithClaude(job.description, resumeBuffer);
  
  const atsScore = evaluation.score;
  let status = 'ACCEPTED';
  let rejectionReason = null;

  if (atsScore < 7) {
    status = 'REJECTED';
    rejectionReason = evaluation.reason;
  }

  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        resumeUrl,
        atsScore,
        status,
        rejectionReason,
        appliedAt: new Date() // optionally reset the application date
      }
    });

    return NextResponse.redirect(new URL('/dashboard', request.url), 303);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
