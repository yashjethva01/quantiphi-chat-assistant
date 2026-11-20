import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

export async function getConversations(query = '') {
  const { data } = await api.get(query ? `/conversations/search?q=${encodeURIComponent(query)}` : '/conversations');
  return data;
}

export async function getConversation(id) {
  const { data } = await api.get(`/conversations/${id}`);
  return data;
}

export async function deleteConversation(id) {
  await api.delete(`/conversations/${id}`);
}

export async function updateTone(id, tone) {
  const { data } = await api.patch(`/conversations/${id}/tone`, { tone });
  return data;
}

export async function streamChat({ conversationId, message, tone, messageId, onToken, onComplete, onError }) {
  const response = await fetch(`${api.defaults.baseURL}${messageId ? '/chat/regenerate' : '/chat'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, message, tone, messageId })
  });
  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'Unable to start the chat request.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const processEventBlock = (raw) => {
    const event = raw.match(/(?:^|\n)event: ([^\n]+)\n(?:^|\n)?data: ([\s\S]+)/);
    if (!event) return;
    try {
      const data = JSON.parse(event[2]);
      if (event[1] === 'token') onToken(data.text);
      if (event[1] === 'complete') onComplete(data.conversation);
      if (event[1] === 'error') onError(new Error(data.message));
    } catch {
      onError(new Error('Received an invalid response from the server.'));
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    events.forEach(processEventBlock);
    if (done) {
      if (buffer.trim()) processEventBlock(buffer);
      break;
    }
  }
}

