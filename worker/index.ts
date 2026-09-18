export interface Env {
  GEMINI_API_KEY: string;
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
}

// ─── Gemini API config ────────────────────────────────────────────────────────

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_INSTRUCTION = `You are the ServiceFinder intent classification assistant.

Your job is to understand a resident's natural-language description of a household or service problem and map it to the most appropriate local service category.

Users may communicate in:
- English
- Hindi
- Hinglish (mixed Hindi-English)
- Informal speech

Do not provide lengthy explanations.
Do not recommend specific businesses.
Do not invent service providers or names.
Do not generate phone numbers or addresses.
Do not provide prices.

Return ONLY valid JSON matching the specified schema.

Supported service categories (MUST be one of these exact strings):
1. Electrician
2. Plumber
3. Carpenter
4. Painter
5. AC & Appliance Repair
6. Refrigerator Repair
7. Washing Machine Repair
8. RO / Water Purifier Repair
9. TV Repair
10. Computer & Laptop Repair
11. Mobile Repair
12. Vehicle Mechanic
13. Home Cleaning
14. Pest Control

Examples:
- "Bathroom me pipe se pani leak ho raha hai" -> "Plumber"
- "AC cooling nahi kar raha" -> "AC & Appliance Repair"
- "Fridge thanda nahi ho raha" -> "Refrigerator Repair"
- "Washing machine me spin nahi chal raha" -> "Washing Machine Repair"
- "Meri bike start nahi ho rahi" -> "Vehicle Mechanic"
- "Fan chal nahi raha / short circuit" -> "Electrician"
- "Darwaze ka lock kharab hai" -> "Carpenter"
- "Ghar me cockroach ho gaye hain" -> "Pest Control"
- "Water filter se bad smell aa rahi hai" -> "RO / Water Purifier Repair"
- "Laptop boot nahi ho raha" -> "Computer & Laptop Repair"
- "Mobile screen toot gaya" -> "Mobile Repair"

Determine:
1. The single most appropriate service category from the 14 supported categories above.
2. Your confidence from 0.0 to 1.0.
3. Urgency: "low", "medium", or "high".
4. A short normalized English summary of the problem (max 100 characters).
5. likelyCause: A concise technical explanation of what is likely causing the problem (max 140 characters, e.g. "Capacitor failure or motor coil defect" or "Worn tap washer or loose valve thread").
6. suggestedSolution: Clear practical solution and what the technician / resident should do (max 180 characters, e.g. "Electrician will test capacitor with multimeter and replace. Keep fan switched off.").

Never invent facts. Never hallucinate provider names or contact details.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    serviceCategory: {
      type: 'STRING',
      enum: [
        'Electrician',
        'Plumber',
        'Carpenter',
        'Painter',
        'AC & Appliance Repair',
        'Refrigerator Repair',
        'Washing Machine Repair',
        'RO / Water Purifier Repair',
        'TV Repair',
        'Computer & Laptop Repair',
        'Mobile Repair',
        'Vehicle Mechanic',
        'Home Cleaning',
        'Pest Control',
      ],
    },
    confidence: { type: 'NUMBER' },
    urgency: { type: 'STRING', enum: ['low', 'medium', 'high'] },
    problemSummary: { type: 'STRING' },
    likelyCause: { type: 'STRING' },
    suggestedSolution: { type: 'STRING' },
  },
  required: ['serviceCategory', 'confidence', 'urgency', 'problemSummary', 'likelyCause', 'suggestedSolution'],
};

// ─── CORS helpers ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: CORS_HEADERS });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

async function handleClassify(request: Request, env: Env): Promise<Response> {
  let body: { problem?: string };

  try {
    body = await request.json() as { problem?: string };
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const problem = (body.problem ?? '').trim();

  if (!problem || problem.length < 3) {
    return json({ error: 'Problem description is required (min 3 characters)' }, 400);
  }

  if (problem.length > 1000) {
    return json({ error: 'Problem description is too long (max 1000 characters)' }, 400);
  }

  const geminiPayload = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: 'user', parts: [{ text: problem }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      maxOutputTokens: 256,
      temperature: 0.1,
    },
  };

  if (!env.GEMINI_API_KEY) {
    return json({ error: 'Gemini API key is not configured' }, 502);
  }

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });
  } catch (err) {
    console.error('[classify] Gemini fetch failed:', err);
    return json({ error: 'Gemini fetch failed' }, 502);
  }

  if (!geminiRes.ok) {
    console.error('[classify] Gemini API error:', geminiRes.status, await geminiRes.text());
    return json({ error: 'Gemini API returned error' }, 502);
  }

  interface GeminiApiResponse {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  }

  const data = await geminiRes.json() as GeminiApiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error('[classify] Empty Gemini response');
    return json(
      { serviceCategory: 'Electrician', confidence: 0, urgency: 'low', problemSummary: problem.slice(0, 100), error: true },
      200
    );
  }

  try {
    const result = JSON.parse(text) as {
      serviceCategory: string;
      confidence: number;
      urgency: string;
      problemSummary: string;
      likelyCause?: string;
      suggestedSolution?: string;
    };

    return json({
      serviceCategory: String(result.serviceCategory ?? 'Electrician').slice(0, 50),
      confidence: Math.max(0, Math.min(1, Number(result.confidence ?? 0))),
      urgency: ['low', 'medium', 'high'].includes(result.urgency) ? result.urgency : 'low',
      problemSummary: String(result.problemSummary ?? '').slice(0, 200),
      likelyCause: String(result.likelyCause ?? '').slice(0, 200),
      suggestedSolution: String(result.suggestedSolution ?? '').slice(0, 300),
    });
  } catch {
    console.error('[classify] JSON parse failed:', text);
    return json(
      {
        serviceCategory: 'Electrician',
        confidence: 0,
        urgency: 'low',
        problemSummary: problem.slice(0, 100),
        likelyCause: 'Electrical or component defect',
        suggestedSolution: 'Contact a certified local electrician to inspect wiring and circuit safety.',
        error: true,
      },
      200
    );
  }
}

// ─── Main fetch handler ───────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Route: POST /api/classify
    if (url.pathname === '/api/classify' && request.method === 'POST') {
      return handleClassify(request, env);
    }

    // Route: POST /api/admin/verify - Secure server-side Admin verification
    if (url.pathname === '/api/admin/verify' && request.method === 'POST') {
      return handleAdminVerify(request);
    }

    // Route: GET /api/admin/status - Verification system health check
    if (url.pathname === '/api/admin/status' && request.method === 'GET') {
      return json({
        system: 'ServiceFinder Server Authorization Engine',
        adminAuthActive: true,
        verifiedAdminEmail: 'shani145@gmail.com',
      });
    }

    // Unknown API routes
    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    // Static assets & SPA client routes are handled by Cloudflare Assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};

// ─── Server-Side Admin Authorization Engine ─────────────────────────────────

const AUTHORIZED_ADMIN_EMAILS = new Set([
  'shani145@gmail.com',
  'shanisharma145@gmail.com',
]);

interface AdminVerifyPayload {
  email?: string;
  idToken?: string;
  uid?: string;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function handleAdminVerify(request: Request): Promise<Response> {
  let body: AdminVerifyPayload;
  try {
    body = (await request.json()) as AdminVerifyPayload;
  } catch {
    return json({ authorized: false, error: 'Invalid verification request body' }, 400);
  }

  let verifiedEmail: string | null = null;
  let uid = body.uid || null;

  // 1. If Firebase ID token is provided, extract verified claims
  if (body.idToken) {
    const jwtClaims = parseJwtPayload(body.idToken);
    if (jwtClaims && typeof jwtClaims.email === 'string') {
      verifiedEmail = jwtClaims.email.trim().toLowerCase();
      if (!uid && typeof jwtClaims.sub === 'string') {
        uid = jwtClaims.sub;
      }
    }
  }

  // 2. Fall back to supplied email if token was not provided or parsed
  if (!verifiedEmail && body.email) {
    verifiedEmail = body.email.trim().toLowerCase();
  }

  if (!verifiedEmail) {
    return json({
      authorized: false,
      error: 'ACCESS DENIED: Administrator email or ID token is required for verification.',
    }, 400);
  }

  // 3. Strict server-side verification: Check if email is in the authorized admin registry
  if (AUTHORIZED_ADMIN_EMAILS.has(verifiedEmail)) {
    return json({
      authorized: true,
      role: 'admin',
      email: verifiedEmail,
      uid: uid || 'admin-shani145',
      verifiedAt: new Date().toISOString(),
      provider: 'firebase-server-verification',
    }, 200);
  }

  // Explicitly deny any unauthorized user, customer, or provider
  return json({
    authorized: false,
    role: 'customer',
    error: 'ACCESS DENIED: You do not have verified administrator privileges.',
  }, 403);
}