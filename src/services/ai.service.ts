import { FASTAPI_URL, getToken } from './api';

type Msg = { role: 'user' | 'assistant'; content: string };

interface StreamChatOptions {
  messages: Msg[];
  grade?: string;
  duration?: string;
  bnccAligned?: boolean;
  useAulateca?: boolean;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function streamTecaChat({
  messages,
  grade,
  duration,
  bnccAligned = true,
  useAulateca = false,
  onDelta,
  onDone,
  onError,
}: StreamChatOptions) {
  try {
    // A Teca consome as chaves pagas de IA — o endpoint exige usuário autenticado.
    const token = await getToken();
    if (!token) {
      onError('Faça login para conversar com a Teca 🐙');
      return;
    }

    const resp = await fetch(`${FASTAPI_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages,
        grade: grade ?? null,
        duration: duration ?? null,
        bncc_aligned: bnccAligned,
        use_aulateca: useAulateca,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        onError('Ops, meus tentáculos se enrolaram 🐙 Muitas requisições! Tente novamente em alguns segundos.');
        return;
      }
      // 403: autenticado, mas sem compra viva. O backend confere o acesso pago
      // a cada conversa — o token continuar válido não basta.
      if (resp.status === 403) {
        onError('Seu acesso ao Aulateca não está ativo 🐙 Dá uma olhada em /acesso para voltar a conversar comigo.');
        return;
      }
      // 422: os tetos de tamanho do /chat (mensagens demais, ou conversa longa
      // demais no total). Sem mensagem própria o usuário não sabe o que fazer.
      if (resp.status === 422) {
        onError('Essa conversa ficou longa demais para os meus tentáculos 🐙 Comece uma nova que eu te acompanho.');
        return;
      }
      // 503: não deu para confirmar o acesso — o backend falha fechado de
      // propósito, então é instabilidade, não bloqueio.
      if (resp.status === 503) {
        onError('Não consegui confirmar seu acesso agora 🐙 Tente de novo em instantes.');
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
        const line = buffer.slice(0, newline).replace(/\r$/, '');
        buffer = buffer.slice(newline + 1);

        if (line === '' || !line.startsWith('data: ')) continue;

        const payload = line.slice(6);
        if (payload === '[DONE]') {
          done = true;
          break;
        }

        try {
          const text = JSON.parse(payload);
          if (typeof text === 'string') onDelta(text);
        } catch {
          // payload malformado — ignora este frame
        }
      }
    }

    onDone();
  } catch (e) {
    console.error('Teca stream error:', e);
    onError('Ops, meus tentáculos se enrolaram 🐙 Tente novamente em alguns segundos!');
  }
}
