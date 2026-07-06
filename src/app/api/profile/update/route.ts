import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const formData = await request.formData();

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const about = formData.get('about') as string;
  const skills = formData.get('skills') as string;
  const profileResumeUrl = formData.get('profileResumeUrl') as string;
  const basicDetailsData = formData.get('basicDetailsData') as string;
  const educationData = formData.get('educationData') as string;
  const workExperienceData = formData.get('workExperienceData') as string;
  const accomplishmentsData = formData.get('accomplishmentsData') as string;
  const personalDetailsData = formData.get('personalDetailsData') as string;
  const socialLinksData = formData.get('socialLinksData') as string;
  const aiResumeData = formData.get('aiResumeData') as string;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        about: about || null,
        skills: skills || null,
        profileResumeUrl: profileResumeUrl || null,
        basicDetailsData: basicDetailsData || null,
        educationData: educationData || null,
        workExperienceData: workExperienceData || null,
        accomplishmentsData: accomplishmentsData || null,
        personalDetailsData: personalDetailsData || null,
        socialLinksData: socialLinksData || null,
        aiResumeData: aiResumeData || null,
      }
    });

    revalidatePath('/introduction');
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
