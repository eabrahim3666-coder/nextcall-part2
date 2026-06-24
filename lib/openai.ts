import OpenAI from 'openai';

// Prevents Vercel build crash if env var is missing during build phase
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is missing. Build might fail or API routes will error at runtime.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'missing-key',
});

export default openai;