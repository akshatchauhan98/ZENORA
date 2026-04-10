
'use server';
/**
 * @fileOverview An AI flow for solving academic questions from images with stable model targeting.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const VisionSolverInputSchema = z.object({
  photoDataUri: z.string().describe("Image as a data URI."),
  subject: z.string().optional(),
});
export type VisionSolverInput = z.infer<typeof VisionSolverInputSchema>;

const VisionSolverOutputSchema = z.object({
  solution: z.string().describe('The AI-generated solution.'),
});
export type VisionSolverOutput = z.infer<typeof VisionSolverOutputSchema>;

export async function solveImageQuestion(input: VisionSolverInput): Promise<VisionSolverOutput> {
  return visionSolverFlow(input);
}

const visionSolverFlow = ai.defineFlow(
  {
    name: 'visionSolverFlow',
    inputSchema: VisionSolverInputSchema,
    outputSchema: VisionSolverOutputSchema,
  },
  async (input) => {
    try {
      const mimeMatch = input.photoDataUri.match(/^data:([^;]+);base64,/);
      const contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const {text} = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: [
          {media: {url: input.photoDataUri, contentType}},
          {text: `Solve this academic question from the image. 
          If a subject is provided (${input.subject || 'General'}), use it as context.
          
          Always:
          - Explain step-by-step
          - Use LaTeX format for math, wrapped in $$ $$
          - Use clear headings: # Title, ## Explanation, ## Steps, ## Key Points, ## Final Answer`}
        ],
        config: {
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        }
      });

      return { solution: text || "Unable to synthesize a solution from the provided image artifact." };
    } catch (err: any) {
      console.error("Vision Solver Error:", err);
      return { solution: "Visual analysis is currently busy. Please re-upload the artifact in a moment." };
    }
  }
);
