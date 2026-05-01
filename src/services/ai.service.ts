import { FASTAPI_URL } from './api';

type Msg = { role: 'user' | 'assistant'; content: string };

interface StreamChatOptions {
  messages: Msg[];
  grade?: string;
  duration?: string;
  bnccAligned?: boolean;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function streamTecaChat({
  messages,
  grade,
  duration,
  bnccAligned = true,
  onDelta,
  onDone,
  onError,
}: StreamChatOptions) {
  try {
    const resp = await fetch(`${FASTAPI_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        grade: grade ?? null,
        duration: duration ?? null,
        bncc_aligned: bnccAligned,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        onError('Ops, meus tentáculos se enrolaram 🐙 Muitas requisições! Tente novamente em alguns segundos.');
        return;
      }
      onError('Ops, meus tentáculos se enrolaram 🐙 Tente novamente em alguns segundos!');
      return;
    }

    if (!resp.body) {
      onError('Ops, meus tentáculos se enrolaram 🐙 Tente novamente em alguns segundos!');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;

    while (!done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;

      buffer += decoder.decode(value, { stream: true });

      let newline: number;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newline).replace(/\r$/, '');
        buffer = buffer.slice(newline + 1);

        if (!line.startsWith('data: ') || line.trim() === '') continue;

        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          done = true;
          break;
        }

        onDelta(payload);
      }
    }

    onDone();
  } catch (e) {
    console.error('Teca stream error:', e);
    onError('Ops, meus tentáculos se enrolaram 🐙 Tente novamente em alguns segundos!');
  }
}
