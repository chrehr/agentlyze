// api/assess.js — Vercel Serverless Function
// Proxies the Claude API call so the API key stays server-side

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { answers } = req.body;

    const prompt = `You are an expert AI adoption consultant for small and mid-sized businesses. A client has submitted this business profile:

Industry: ${answers.industry}
Company size: ${answers.companySize} employees
Workflow areas needing improvement: ${answers.workflows.join(', ')}
Pain points: ${answers.painPoints.join(', ')}
Budget tier: ${answers.budget}
Current tools in use: ${answers.currentTools || 'Not specified'}
Additional context: ${answers.freeText || 'None'}

Based on this profile, produce a comprehensive AI Opportunity Assessment. Respond ONLY with a valid JSON object (no markdown, no preamble) with this EXACT structure:
{
  "readinessScore": <integer 0-100>,
  "readinessLabel": <"Low"|"Moderate"|"High"|"Advanced">,
  "readinessSummary": <2-sentence summary of their AI readiness>,
  "estimatedROI": { "timesSaved": <"X hrs/week">, "costSaving": <"€X,XXX/year">, "paybackMonths": <integer> },
  "opportunities": [
    {
      "title": <string>,
      "description": <string, 1-2 sentences>,
      "impact": <integer 1-10>,
      "effort": <integer 1-10>,
      "tools": [<string>, <string>],
      "category": <string>,
      "quickWin": <boolean>
    }
  ],
  "roadmap": [
    { "phase": "Phase 1 – Quick Wins", "duration": "0-30 days", "items": [<string>, ...] },
    { "phase": "Phase 2 – Core Automation", "duration": "1-3 months", "items": [<string>, ...] },
    { "phase": "Phase 3 – Scale & Optimise", "duration": "3-6 months", "items": [<string>, ...] }
  ],
  "riskFlags": [<string>, ...],
  "topInsight": <1 striking sentence summarizing the single biggest opportunity>
}

Return 4-6 opportunities ranked by ROI potential, specific to their industry and workflows. Be concrete and name real AI tools (e.g. Claude, ChatGPT, Zapier, HubSpot AI, Notion AI, etc.). The riskFlags array should have 2-3 items. Make all data specific to their industry and size.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content.map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Assessment error:', err);
    return res.status(500).json({ error: err.message });
  }
}
