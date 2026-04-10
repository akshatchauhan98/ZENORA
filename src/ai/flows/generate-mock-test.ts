
'use server';
/**
 * @fileOverview AI flow for generating academic mock tests with perfectly formatted MCQs and advanced Math support.
 * Includes robust exponential backoff retry logic to handle high-demand API periods.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const MockTestInputSchema = z.object({
  subject: z.string().describe('The subject for the test.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level.'),
  numQuestions: z.number().min(1).max(100).describe('Number of questions.'),
});
export type MockTestInput = z.infer<typeof MockTestInputSchema>;

const MockTestOutputSchema = z.object({
  title: z.string(),
  questions: z.array(z.object({
    id: z.string(),
    questionText: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string().describe('The letter of the correct option (A, B, C, or D).'),
  })),
});
export type MockTestOutput = z.infer<typeof MockTestOutputSchema>;

/**
 * Execute AI call with exponential backoff retries for generation stability.
 */
async function generateWithRetry(input: MockTestInput, retries = 3): Promise<MockTestOutput> {
  for (let i = 0; i < retries; i++) {
    try {
      const { output } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: `You are an expert academic examiner. 
        Generate a structured mock test in valid JSON format.
        
        STRICT MATH RULES:
        1. Use LaTeX ONLY for complex expressions, wrapped in $$ $$.
        2. DO NOT wrap simple words or single variables in $$.
        
        JSON STRUCTURE:
        Output MUST be valid JSON matching the schema provided.`,
        prompt: `Subject: ${input.subject}
        Difficulty: ${input.difficulty}
        Questions: ${input.numQuestions}`,
        output: { schema: MockTestOutputSchema }
      });
      
      if (!output) throw new Error("Empty model response");
      return output as MockTestOutput;
    } catch (err: any) {
      const isRetryable = err.message?.includes('503') || err.message?.includes('demand') || err.message?.includes('429');
      if (!isRetryable || i === retries - 1) throw err;
      
      const delay = Math.pow(2, i + 1) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function generateMockTest(input: MockTestInput): Promise<MockTestOutput> {
  return generateMockTestFlow(input);
}

const generateMockTestFlow = ai.defineFlow(
  {
    name: 'generateMockTestFlow',
    inputSchema: MockTestInputSchema,
    outputSchema: MockTestOutputSchema,
  },
  async (input) => {
    try {
      return await generateWithRetry(input);
    } catch (error: any) {
      console.error("Mock Test Generation Fault:", error);
      // Return a basic structure instead of crashing if possible, or throw a clean error
      throw new Error("The Assessment Grid is currently over-taxed. Please re-initialize in a moment.");
    }
  }
);
