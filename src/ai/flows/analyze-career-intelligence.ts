'use server';
/**
 * @fileOverview AI flow for analyzing a student's career metrics and generating a structured 4-phase tactical roadmap.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const CareerInputSchema = z.object({
  github: z.any().optional(),
  leetcode: z.any().optional(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.string()
  })).optional(),
  academic: z.object({
    course: z.string(),
    semester: z.number(),
    cgpa: z.number().optional(),
    targetRole: z.string().optional(),
  }),
});
export type CareerInput = z.infer<typeof CareerInputSchema>;

const RoadmapPhaseSchema = z.object({
  phase: z.string().describe('The name of the phase (Foundations, Core Skills, Projects, or Placement Prep)'),
  duration: z.string().describe('Expected duration (e.g., 2 weeks)'),
  goal: z.string().describe('The primary objective of this phase'),
  tasks: z.array(z.string()).describe('List of specific learning or building tasks'),
});

const CareerAnalysisOutputSchema = z.object({
  skillScores: z.object({
    dsa: z.number().min(0).max(100),
    webDev: z.number().min(0).max(100),
    core: z.number().min(0).max(100),
    softSkills: z.number().min(0).max(100),
  }),
  placementProbability: z.number().min(0).max(100),
  category: z.enum(['Product-based', 'Service-based', 'Niche Startup']),
  salaryRange: z.string(),
  insights: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  recommendedRoles: z.array(z.string()),
  riskLevel: z.enum(['Low', 'Medium', 'High']),
  roadmap: z.array(RoadmapPhaseSchema).describe('A structured 4-phase tactical plan starting from basics.'),
});
export type CareerAnalysisOutput = z.infer<typeof CareerAnalysisOutputSchema>;

/**
 * Execute AI call with exponential backoff retries.
 */
async function generateWithRetry(input: CareerInput, retries = 3): Promise<CareerAnalysisOutput> {
  for (let i = 0; i < retries; i++) {
    try {
      const { output } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: `You are an expert Career Mentor and Placement Officer for B.Tech students. 
        Analyze the student's profile data to predict placement success and generate a practical, structured 4-phase roadmap.
        
        STRICT ROADMAP STRUCTURE:
        The roadmap MUST always contain exactly 4 phases in this sequence:
        1. PHASE 1: FOUNDATIONS (Beginner) - Core language basics (variables, loops, arrays) even if user has skills.
        2. PHASE 2: CORE SKILLS (Intermediate) - Goal-specific DSA, Web Dev, or Data Science fundamentals.
        3. PHASE 3: PRACTICAL BUILDING - 2-3 specific project ideas and GitHub best practices.
        4. PHASE 4: PLACEMENT PREP (Advanced) - Intensive LeetCode, Resume optimization, and Mock Interviews.
        
        SCORING LOGIC:
        - DSA: Based on LeetCode solved counts.
        - WebDev: Based on GitHub repos and technologies used.
        - Core: Based on CGPA and course track.`,
        prompt: `Analyze this student profile and build a phased roadmap to their goal:
        Academic: ${input.academic.course}, Sem ${input.academic.semester}, CGPA ${input.academic.cgpa || 'N/A'}
        Target Goal: ${input.academic.targetRole || 'Software Engineer'}
        GitHub Context: ${JSON.stringify(input.github || 'No data')}
        LeetCode Context: ${JSON.stringify(input.leetcode || 'No data')}
        Current Skills: ${JSON.stringify(input.skills || [])}
        `,
        output: { schema: CareerAnalysisOutputSchema }
      });
      return output as CareerAnalysisOutput;
    } catch (err: any) {
      const isRetryable = err.message?.includes('503') || err.message?.includes('demand') || err.message?.includes('429');
      if (!isRetryable || i === retries - 1) throw err;
      
      const delay = Math.pow(2, i + 1) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function analyzeCareer(input: CareerInput): Promise<CareerAnalysisOutput> {
  return analyzeCareerFlow(input);
}

const analyzeCareerFlow = ai.defineFlow(
  {
    name: 'analyzeCareerFlow',
    inputSchema: CareerInputSchema,
    outputSchema: CareerAnalysisOutputSchema,
  },
  async (input) => {
    return await generateWithRetry(input);
  }
);
