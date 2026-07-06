export async function evaluateResumeWithClaude(jobDescription: string, resumeBuffer: ArrayBuffer) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.warn("No ANTHROPIC_API_KEY found. Falling back to mock scoring.");
    return mockScore();
  }

  // Convert ArrayBuffer to Base64
  const base64Pdf = Buffer.from(resumeBuffer).toString('base64');

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) software. 
Your task is to evaluate the provided resume against the provided job description.
Output your evaluation as a strict JSON object with exactly two keys:
- "score": an integer from 0 to 10 representing how well the resume matches the job description.
- "reason": a string providing a concise, constructive reason for the score. Focus on matching skills, missing skills, or formatting.`;

  const requestBody = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Pdf
            }
          },
          {
            type: "text",
            text: `Please evaluate this resume against the following job description:\n\n${jobDescription}`
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
        "content-type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API Error:", err);
      return mockScore(); // fallback
    }

    const data = await response.json();
    const messageContent = data.content[0].text;
    
    // Parse JSON out of Claude's response
    const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : parseInt(parsed.score) || 0,
        reason: parsed.reason || "Unable to generate reason."
      };
    }

    return mockScore();

  } catch (error) {
    console.error("Error evaluating resume with Claude:", error);
    return mockScore();
  }
}

function mockScore() {
  const atsScore = Math.floor(Math.random() * 11);
  return {
    score: atsScore,
    reason: atsScore < 7 
      ? 'Needs Improvement: Ensure your resume highlights key skills from the job description. Quantify your past achievements and use clear formatting.'
      : 'Good match for the required skills.'
  };
}
