
'use server';
/**
 * @fileOverview Advanced AI academic assistant with structured generation, LaTeX support, and robust retry logic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const GetAcademicHelpInputSchema = z.object({
  course: z.string().describe('The course of the student (e.g., B.Tech, MBA).'),
  semester: z.number().describe('The current semester of the student.'),
  subject: z.string().describe('The subject for which help is needed.'),
  typeOfHelp: z
    .enum([
      'Ask Doubt',
      'Math Solver',
      'Assignment Helper',
      'Concept Simplifier',
      'Exam Prep',
      'Revision Notes'
    ])
    .describe('The type of help requested.'),
  question: z.string().describe('The specific query or problem.'),
  collegeName: z.string().describe('The name of the college.'),
});
export type GetAcademicHelpInput = z.infer<typeof GetAcademicHelpInputSchema>;

const GetAcademicHelpOutputSchema = z.object({
  response: z.string().describe('The AI-generated Markdown/LaTeX response.'),
});
export type GetAcademicHelpOutput = z.infer<typeof GetAcademicHelpOutputSchema>;

/**
 * Robust generation with exponential backoff retries for high-demand periods.
 */
async function generateHelpWithRetry(input: GetAcademicHelpInput, retries = 3): Promise<string> {
  const systemPrompt = `You are an advanced academic assistant for college students. Structure responses exactly as follows:
    # [Title]
    ## Explanation
    [Summary]
    ## Steps
    [Breakdown]
    ## Final Answer
    [Conclusion]
    
    FOR MATHEMATICS: Use LaTeX ($$ $$).`;

  const userPrompt = `Student Context: ${input.course}, Sem ${input.semester}, Subject: ${input.subject}, Mode: ${input.typeOfHelp}
    Question: ${input.question}`;

  for (let i = 0; i < retries; i++) {
    try {
      const { text } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: userPrompt,
        config: {
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
          ]
        }
      });
      return text || "I encountered an empty response artifact.";
    } catch (err: any) {
      const isRetryable = err.message?.includes('503') || err.message?.includes('demand') || err.message?.includes('429');
      if (!isRetryable || i === retries - 1) throw err;
      
      const delay = Math.pow(2, i + 1) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return "The model is currently under high load. Please try your query again in a moment.";
}

export async function getAcademicHelp(input: GetAcademicHelpInput): Promise<GetAcademicHelpOutput> {
  return getAcademicHelpFlow(input);
}

const getAcademicHelpFlow = ai.defineFlow(
  {
    name: 'getAcademicHelpFlow',
    inputSchema: GetAcademicHelpInputSchema,
    outputSchema: GetAcademicHelpOutputSchema,
  },
  async (input) => {
    try {
      const response = await generateHelpWithRetry(input);
      return { response };
    } catch (error: any) {
      console.error("Academic AI Error:", error);
      return { response: "Academic AI is currently synthesizing high-logic responses. Please re-trigger the analysis in a moment." };
    }
  }
);
