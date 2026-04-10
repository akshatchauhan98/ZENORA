'use server';
/**
 * @fileOverview A notes summarization AI agent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNotesInputSchema = z.object({
  notes: z
    .string()
    .describe('The notes to be summarized.'),
});
export type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

const SummarizeNotesOutputSchema = z.object({
  summary: z.string().describe('The summary of the notes.'),
});
export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  return summarizeNotesFlow(input);
}

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      system: "You are an expert academic summarizer. Condense the provided notes into clear, high-yield bullet points and core concepts.",
      prompt: `Notes to summarize: ${input.notes}`,
    });
    return { summary: text || "I could not generate a summary for these notes." };
  }
);
