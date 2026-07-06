import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { details } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ text: "Generated Profile: (Groq API key missing. Please add GROQ_API_KEY to your .env file to enable free AI generation.)" });
    }

    const prompt = `Based on the following details, write a professional 'About Me' description for a resume or portfolio in exactly 100 words. Make it sound professional, engaging, and highlight their strengths.
Details:
${details}

Output ONLY the 100-word description, no conversational filler.`;

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
    const generatedText = data.choices?.[0]?.message?.content || "Failed to generate text.";
    
    return NextResponse.json({ text: generatedText });

  } catch (error: any) {
    console.error('Error generating about:', error);
    return NextResponse.json({ text: `AI Error: ${error.message}` }, { status: 500 });
  }
}
