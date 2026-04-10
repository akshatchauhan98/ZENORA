
/**
 * @fileOverview Netlify Serverless Function for Zenora Placement Preparation Agent.
 * Handles specialized logic for generating step-by-step career roadmaps.
 * Includes a Mock Mode for placeholder API keys to maintain stability.
 */

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Placement Agent credentials not configured. Please check environment variables." }),
      };
    }

    // Mock Mode for Placeholder Key
    if (apiKey === 'abcccc') {
      const mockData = {
        "level": "Intermediate",
        "placement_probability": 78,
        "strengths": ["Core Logic", "Algorithm Foundations"],
        "weaknesses": ["Deployment Pipelines"],
        "missing_skills": ["Docker", "CI/CD"],
        "job_roles": ["Software Engineer"],
        "expected_package": "12 LPA",
        "category": "Product-based",
        "risk_level": "Low",
        "roadmap": [{ "phase": "Mock Phase", "duration": "1 week", "tasks": ["Configure real API key"] }],
        "daily_plan": ["Update .env"],
        "interview_preparation": ["System review"]
      };
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockData)
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an intelligent Placement Preparation Agent."
          },
          {
            role: "user",
            content: `Analyze this profile: ${JSON.stringify(data)}. Return STRICT JSON for career roadmap.`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || "Placement Agent Synthesis Error");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: result.choices[0].message.content
    };

  } catch (error) {
    console.error("Placement Agent Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
