import OpenAI from 'openai';

const toneInstructions = {
  professional:
    'Respond in a professional, structured and formal manner. Use clear explanations and appropriate terminology.',
  casual:
    'Respond in a friendly, natural and conversational manner. Make explanations approachable and easy to understand.',
  concise:
    'Respond briefly and directly. Focus on essential information and avoid unnecessary explanations.'
};

const baseSystemPrompt =
  'You are Nexus AI, a helpful and reliable AI assistant. Be accurate, transparent about uncertainty, and use Markdown when it improves readability.';

export function getToneInstruction(tone) {
  return toneInstructions[tone] || toneInstructions.professional;
}

export async function createChatStream(messages, tone, signal) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client.chat.completions.create(
    {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${baseSystemPrompt}\n${getToneInstruction(tone)}` },
        ...messages.map(({ role, content }) => ({ role, content }))
      ],
      stream: true
    },
    { signal }
  );
}

