'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing career guidance to students.
 *
 * It suggests internships, courses, certifications, and provides resume/cover letter guidance based on the student's profile.
 * - receiveCareerGuidance - A function that handles the career guidance process.
 * - CareerGuidanceInput - The input type for the receiveCareerGuidance function.
 * - CareerGuidanceOutput - The return type for the receiveCareerGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerGuidanceInputSchema = z.object({
  course: z.string().describe('The student course (e.g., B.Tech, MBA).'),
  semester: z.number().describe('The current semester of the student.'),
  interests: z.string().describe('The student interests.'),
  previousExperience: z.string().describe('The student previous experience.'),
});
export type CareerGuidanceInput = z.infer<typeof CareerGuidanceInputSchema>;

const CareerGuidanceOutputSchema = z.object({
  internshipSuggestions: z.array(z.string()).describe('Suggested internships for the student.'),
  courseSuggestions: z.array(z.string()).describe('Suggested courses for the student.'),
  certificationSuggestions: z.array(z.string()).describe('Suggested certifications for the student.'),
  resumeGuidance: z.string().describe('Guidance for improving the student resume.'),
  coverLetterGuidance: z.string().describe('Guidance for improving the student cover letter.'),
  careerPathSuggestions: z.array(z.string()).describe('Career paths suggested for the student'),
});
export type CareerGuidanceOutput = z.infer<typeof CareerGuidanceOutputSchema>;

export async function receiveCareerGuidance(input: CareerGuidanceInput): Promise<CareerGuidanceOutput> {
  return receiveCareerGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerGuidancePrompt',
  input: {schema: CareerGuidanceInputSchema},
  output: {schema: CareerGuidanceOutputSchema},
  prompt: `You are a career counselor providing guidance to a student.

  Based on the student's course, semester, interests and previous experience, provide personalized suggestions for internships, courses, and certifications. Also provide resume and cover letter guidance and career path suggestions.  Use the student info below as context:

  Course: {{{course}}}
  Semester: {{{semester}}}
  Interests: {{{interests}}}
  Previous Experience: {{{previousExperience}}}

  Internship Suggestions:
  Course Suggestions:
  Certification Suggestions:
  Resume Guidance:
  Cover Letter Guidance:
 Career Path Suggestions:`,
});

const receiveCareerGuidanceFlow = ai.defineFlow(
  {
    name: 'receiveCareerGuidanceFlow',
    inputSchema: CareerGuidanceInputSchema,
    outputSchema: CareerGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
