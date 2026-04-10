'use server';

/**
 * @fileOverview A flow for answering questions about college life, mentorship opportunities, and student communities.
 *
 * - askQuestionsAboutCollegeLife - A function that handles the process of answering questions about college life.
 * - AskQuestionsAboutCollegeLifeInput - The input type for the askQuestionsAboutCollegeLife function.
 * - AskQuestionsAboutCollegeLifeOutput - The return type for the askQuestionsAboutCollegeLife function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskQuestionsAboutCollegeLifeInputSchema = z.object({
  collegeName: z.string().describe('The name of the college the student attends.'),
  question: z.string().describe('The question about campus life, mentorship, or student communities.'),
});
export type AskQuestionsAboutCollegeLifeInput = z.infer<
  typeof AskQuestionsAboutCollegeLifeInputSchema
>;

const AskQuestionsAboutCollegeLifeOutputSchema = z.object({
  answer: z.string().describe('The AI assistant answer to the question.'),
});
export type AskQuestionsAboutCollegeLifeOutput = z.infer<
  typeof AskQuestionsAboutCollegeLifeOutputSchema
>;

export async function askQuestionsAboutCollegeLife(
  input: AskQuestionsAboutCollegeLifeInput
): Promise<AskQuestionsAboutCollegeLifeOutput> {
  return askQuestionsAboutCollegeLifeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionsAboutCollegeLifePrompt',
  input: {schema: AskQuestionsAboutCollegeLifeInputSchema},
  output: {schema: AskQuestionsAboutCollegeLifeOutputSchema},
  prompt: `You are a helpful AI assistant providing information about college life.

  Answer the following question about {{collegeName}}:
  {{question}}
  `,
});

const askQuestionsAboutCollegeLifeFlow = ai.defineFlow(
  {
    name: 'askQuestionsAboutCollegeLifeFlow',
    inputSchema: AskQuestionsAboutCollegeLifeInputSchema,
    outputSchema: AskQuestionsAboutCollegeLifeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
