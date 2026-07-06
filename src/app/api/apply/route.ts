import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { evaluateResumeWithClaude } from '@/lib/atsScorer';
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'APPLICANT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const jobId = formData.get('jobId') as string;
  const resume = formData.get('resume') as File;

  if (!jobId || !resume) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // AWS S3 integration is stubbed here since credentials are required
  // const s3 = new S3Client({ region: process.env.AWS_REGION });
  // const key = `resumes/${Date.now()}-${resume.name}`;
  // const arrayBuffer = await resume.arrayBuffer();
  // const buffer = Buffer.from(arrayBuffer);
  // await s3.send(new PutObjectCommand({
  //   Bucket: process.env.AWS_S3_BUCKET_NAME,
  //   Key: key,
  //   Body: buffer,
  // }));
  // const resumeUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  
  // For demo, we just simulate the S3 upload:
  const resumeUrl = `https://mock-s3-bucket.s3.amazonaws.com/resumes/${Date.now()}-mock.pdf`;

  // Fetch Job to get description for ATS scoring
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { description: true }
  });

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

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
    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: (session.user as any).id,
        resumeUrl,
        atsScore,
        status,
        rejectionReason
      }
    });

    return NextResponse.redirect(new URL('/dashboard', request.url), 303);
  } catch (error: any) {
    if (error.code === 'P2002') {
       return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
