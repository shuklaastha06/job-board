import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key missing. Please add GROQ_API_KEY to your .env.' }, { status: 500 });
    }

    const profileData = {
      name: user.name,
      about: user.about,
      skills: user.skills,
      basicDetails: user.basicDetailsData,
      education: user.educationData,
      workExperience: user.workExperienceData,
      accomplishments: user.accomplishmentsData,
      personalDetails: user.personalDetailsData,
      socialLinks: user.socialLinksData
    };

    const prompt = `You are an expert Resume Writer. I will provide you with raw JSON data representing a user's entire career profile.
Take all this data and format it into a pristine, professional Resume written in Markdown format.
Do not add conversational filler. Start directly with the markdown structure (e.g. # John Doe).
Organize it logically: Header, Summary, Skills, Work Experience, Education, Accomplishments.

CRITICAL INSTRUCTION FOR CONTACT INFO:
Format the Email, Phone, and Location in the header as Markdown links so they are clickable:
- Email must be a mailto link: [test@example.com](mailto:test@example.com)
- Phone must be a tel link: [1234567890](tel:1234567890)
- Location must be a Google Maps search link: [New York](https://www.google.com/maps/search/?api=1&query=New+York)

Raw Profile Data:
${JSON.stringify(profileData, null, 2)}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const generatedMarkdown = data.choices?.[0]?.message?.content || "Failed to generate resume.";

    // Save generated resume to database
    await prisma.user.update({
      where: { id: userId },
      data: { aiResumeData: generatedMarkdown }
    });

    const { revalidatePath } = require('next/cache');
    revalidatePath('/introduction');

    return NextResponse.json({ success: true, markdown: generatedMarkdown });

  } catch (error: any) {
    console.error('Error generating full resume:', error);
    return NextResponse.json({ error: `AI Error: ${error.message}` }, { status: 500 });
  }
}
