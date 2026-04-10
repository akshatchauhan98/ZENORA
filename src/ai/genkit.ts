
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Global Genkit configuration.
 * Uses Google Gemini for internal flows.
 * OpenAI functionality is handled via the official SDK in the API route for stability.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
  ],
});

export { z } from 'genkit';
