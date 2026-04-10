
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Career AI API Route
 * Handles secure, server-side placement analysis and roadmap generation.
 * Includes a robust Mock Mode for placeholder keys to allow UI testing.
 */
export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    const data = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    // 1. Credential Verification
    if (!apiKey) {
      return NextResponse.json({ 
        success: false,
        error: 'Placement Agent credentials not configured. Please ensure OPENAI_API_KEY is set in your environment.' 
      }, { status: 500 });
    }

    // 2. Mock Protocol for Prototyping
    if (apiKey === 'abcccc') {
      const mockAnalysis = {
        "level": "Intermediate",
        "placement_probability": 78,
        "strengths": ["Strong Academic Core", "GitHub Active", "Data Structures Fundamentals"],
        "weaknesses": ["System Design Architecture", "Cloud Deployment Experience", "Advanced SQL"],
        "missing_skills": ["Docker", "Kubernetes", "Redis", "AWS Lambda"],
        "job_roles": ["Software Engineer", "Backend Developer", "Cloud Associate"],
        "expected_package": "12-18 LPA",
        "category": "Product-based",
        "risk_level": "Low",
        "roadmap": [
          { "phase": "Phase 1: Foundations", "duration": "2 weeks", "tasks": ["Complete 50 LeetCode Mediums", "Review OS/DBMS fundamentals"] },
          { "phase": "Phase 2: Core Engineering", "duration": "3 weeks", "tasks": ["Build a Scalable Backend with Node.js", "Master PostgreSQL indexing"] },
          { "phase": "Phase 3: Tactical Projects", "duration": "2 weeks", "tasks": ["Deploy a full-stack artifact using CI/CD", "Optimize GitHub documentation"] },
          { "phase": "Phase 4: Placement Mastery", "duration": "1 week", "tasks": ["Mock Behavioral Interviews", "Resume Optimization Protocol"] }
        ],
        "daily_plan": ["2 Medium LeetCode problems", "1 System Design video", "1 hour building artifacts"],
        "interview_preparation": ["Prepare for Deep Link questions on OS", "Practice STAR method for HR rounds"]
      };

      return NextResponse.json({
        success: true,
        data: JSON.stringify(mockAnalysis)
      });
    }

    // 3. Agentic AI Synthesis
    const client = new OpenAI({ apiKey });
    const prompt = `
Analyze this student profile for a ${data.academic?.targetRole || 'Software Engineer'} role:

- Academic Context: ${data.academic?.course}, Sem ${data.academic?.semester}, CGPA ${data.academic?.cgpa || '7.5'}
- Technical Matrix: ${JSON.stringify(data.skills || [])}
- Footprints: GitHub (${JSON.stringify(data.github || 'No data')}), LeetCode (${JSON.stringify(data.leetcode || 'No data')})

Generate a complete placement preparation plan. You MUST return STRICT JSON matching this structure:
{
  "level": "Beginner | Intermediate | Advanced",
  "placement_probability": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missing_skills": ["string"],
  "job_roles": ["string"],
  "expected_package": "string",
  "category": "string",
  "risk_level": "Low | Medium | High",
  "roadmap": [
    { "phase": "string", "duration": "string", "tasks": ["string"] }
  ],
  "daily_plan": ["string"],
  "interview_preparation": ["string"]
}
`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an intelligent Placement Preparation Agent.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Neural response was empty.');

    return NextResponse.json({
      success: true,
      data: content
    });

  } catch (error: any) {
    console.error('[Career AI] Processing Fault:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'The Placement Agent is currently offline.' 
    }, { status: 500 });
  }
}
