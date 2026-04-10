
'use server';

/**
 * @fileOverview Zenora AI Assistant Chat Flow with stable model configuration.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ZenoraChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  message: z.string().describe('The new user message.'),
  userData: z.object({
    collegeName: z.string().optional(),
    course: z.string().optional(),
    semester: z.number().optional(),
  }).optional(),
});
export type ZenoraChatInput = z.infer<typeof ZenoraChatInputSchema>;

const ZenoraChatOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
});
export type ZenoraChatOutput = z.infer<typeof ZenoraChatOutputSchema>;

export async function zenoraChat(input: ZenoraChatInput): Promise<ZenoraChatOutput> {
  return zenoraChatFlow(input);
}

const zenoraChatFlow = ai.defineFlow(
  {
    name: 'zenoraChatFlow',
    inputSchema: ZenoraChatInputSchema,
    outputSchema: ZenoraChatOutputSchema,
  },
  async (input) => {
    try {
      const { history, message, userData } = input;

      const systemPrompt = `You are Zenora AI, a professional academic specialist.

      STRICT RESPONSE PATTERN:
      If the question is academic or conceptual, use these labels to structure your answer:
      [CONCEPT] - Core definition.
      [EXPLANATION] - Detailed reasoning.
      [EXAMPLE] - Practical scenario.
      [FINAL_ANSWER] - Concluding summary.

      STRICT MATH RULES:
      1. Do NOT use LaTeX ($$, \frac, etc.).
      2. Fractions: (a+b)/(c+d).
      3. Powers: x^2.
      4. Square roots: sqrt(x).
      5. Each formula on a NEW line.

      Student Context:
      - College: ${userData?.collegeName || 'Not specified'}
      - Course: ${userData?.course || 'Not specified'}
      - Semester: ${userData?.semester || 'Not specified'}`;

      const { text } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: systemPrompt,
        messages: [
          ...history.map(h => ({ role: h.role, content: [{ text: h.content }] })),
          { role: 'user', content: [{ text: message }] }
        ],
      });

      return { response: text || "Unable to process request." };
    } catch (err: any) {
      console.error("Zenora Chat Error:", err);
      return { response: "My neural link is currently fluctuating. Please send your message again." };
    }
  }
);
