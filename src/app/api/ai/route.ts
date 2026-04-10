
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Universal AI Backend Route
 * Handles secure AI generation using the official OpenAI SDK.
 * Includes a Mock Mode for placeholder credentials to ensure UI stability.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, format } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    
    // 1. Check for missing credentials
    if (!apiKey) {
      return NextResponse.json({ 
        error: "AI Specialist credentials not configured. Ensure your API key is valid." 
      }, { status: 500 });
    }

    // 2. Mock Mode for Prototyping (Placeholder Key)
    if (apiKey === 'abcccc') {
      if (format === 'json') {
        const mockTest = {
          title: "Mock Assessment (Sample)",
          questions: [
            {
              id: "1",
              questionText: "What is the primary purpose of a 'load balancer' in distributed systems?",
              options: [
                "Distribute incoming network traffic across multiple servers",
                "Store persistent user session data",
                "Translate high-level code into machine instructions",
                "Encrypt data before it leaves the local network"
              ],
              correctAnswer: "A"
            }
          ]
        };
        return NextResponse.json({ result: JSON.stringify(mockTest) });
      }

      const mockText = `# Specialist Insights\n\nThis is a high-fidelity **Mock Response** generated because you are using a placeholder API key (\`abcccc\`).\n\n## Analysis\nYour academic query has been received by the neural gateway. In a live environment, GPT-4o would synthesize a step-by-step solution here.\n\n## Recommendation\nTo enable live AI intelligence, please update your \`.env\` file with a valid OpenAI API key.`;
      return NextResponse.json({ result: mockText });
    }

    // 3. Official OpenAI Integration
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: format === 'json' ? { type: 'json_object' } : undefined,
    });

    const result = response.choices[0]?.message?.content || "";
    return NextResponse.json({ result });

  } catch (error: any) {
    console.error("AI API Synthesis Error:", error);
    const isRateLimit = error.status === 429;
    const message = isRateLimit 
      ? "AI capacity reached. Please try again in 60 seconds."
      : "Visual synthesis busy or model offline. Please re-trigger the artifact analysis.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
