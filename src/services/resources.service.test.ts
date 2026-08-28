import { describe, it, expect, vi, beforeEach } from 'vitest';

const inSpy = vi.fn();

// Query builder mínimo: .select() encadeia, .in() resolve a promise.
const from = vi.fn((_table: string) => ({
  select: () => ({
    in: (col: string, ids: string[]) => {
      inSpy(col, ids);
      return Promise.resolve({ data: [], error: null });
    },
  }),
}));

const createSignedUrl = vi.fn();
const storageFrom = vi.fn((_bucket: string) => ({
  createSignedUrl: (path: string, ttl: number) => createSignedUrl(path, ttl),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (t: string) => from(t), storage: { from: (b: string) => storageFrom(b) } },
}));

import {
  resourcesService,
  isUuid,
  toResource,
  isBucketPath,
  ATIVIDADES_BUCKET,
  SIGNED_URL_TTL_SECONDS,
} from '@/services/resources.service';

beforeEach(() => {
  inSpy.mockClear();
  from.mockClear();
  createSignedUrl.mockReset();
  storageFrom.mockClear();
});

describe('isUuid', () => {
  it('aceita UUID e rejeita id de mock', () => {
    expect(isUuid('8f14e45f-ceea-467a-9575-1f0c9e2a1c1d')).toBe(true);
    expect(isUuid('1')).toBe(false);
    expect(isUuid('')).toBe(false);
  });
});

describe('fetchByIds', () => {
  it('não consulta o Supabase quando todos os ids são de mock', async () => {
    await expect(resourcesService.fetchByIds(['1', '2'])).resolves.toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });

  it('envia apenas ids em formato UUID (id de mock quebraria a coluna uuid)', async () => {
    const uuid = '8f14e45f-ceea-467a-9575-1f0c9e2a1c1d';
    await resourcesService.fetchByIds(['1', uuid]);
    expect(inSpy).toHaveBeenCalledWith('id', [uuid]);
  });

  it('retorna vazio para lista vazia', async () => {
    await expect(resourcesService.fetchByIds([])).resolves.toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });
});

// A arte dos cards e a autoria do acervo curado vivem em colunas próprias
// (009). Sem mapeá-las, todo card vindo do banco perde a imagem e assina
// "Aulateca", ficando visivelmente pior que o mock que ele substitui.
describe('toResource', () => {
  const row = {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'T', description: 'D', category: 'ludica', type: 'pdf',
    age_range: '6-8', duration: '10min', downloads: 1, rating: 4.5,
    is_new: true, file_url: null, image_url: '/catalog/x.png',
    author_name: 'Profa. Ana Lima', profiles: null,
  };

  it('mapeia image_url para imageUrl', () => {
    expect(toResource(row).imageUrl).toBe('/catalog/x.png');
  });

  it('usa author_name quando não há perfil vinculado', () => {
    expect(toResource(row).author).toBe('Profa. Ana Lima');
  });

  it('dá preferência ao nome do perfil sobre author_name', () => {
    expect(toResource({ ...row, profiles: { name: 'Perfil Real' } }).author).toBe('Perfil Real');
  });

  it('cai em Aulateca quando não há nem perfil nem author_name', () => {
    expect(toResource({ ...row, author_name: null }).author).toBe('Aulateca');
  });
});

// ── Paywall no arquivo ───────────────────────────────────────────────────────
// Até a Fase 5 o PDF morava em public/ e o link era eterno e anônimo. Estes
// testes cobrem a fronteira que substituiu isso: o que é caminho de bucket
// (assina, e a policy decide) e o que é URL pronta (abre direto).
describe('isBucketPath', () => {
  it('reconhece o caminho do acervo pago', () => {
    expect(isBucketPath('ludica/x/x.pdf')).toBe(true);
  });

  it('não assina o que já é URL ou caminho público', () => {
    expect(isBucketPath('https://exemplo.com/a.pdf')).toBe(false);
    expect(isBucketPath('http://exemplo.com/a.pdf')).toBe(false);
    expect(isBucketPath('//cdn.exemplo.com/a.pdf')).toBe(false);
    // Formato antigo, de antes da migration 016: se sobrar alguma linha assim
    // no banco, ela abre como sempre abriu em vez de virar erro na tela.
    expect(isBucketPath('/atividades/ludica/x/x.pdf')).toBe(false);
  });
});

describe('resolveDownloadUrl', () => {
  it('assina o caminho do bucket com validade curta', async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://sb/storage/assinado?token=abc' },
      error: null,
    });

    const url = await resourcesService.resolveDownloadUrl('ludica/x/x.pdf');

    expect(storageFrom).toHaveBeenCalledWith(ATIVIDADES_BUCKET);
    expect(createSignedUrl).toHaveBeenCalledWith('ludica/x/x.pdf', SIGNED_URL_TTL_SECONDS);
    expect(url).toBe('https://sb/storage/assinado?token=abc');
  });

  it('devolve URL absoluta sem tocar no storage', async () => {
    await expect(resourcesService.resolveDownloadUrl('https://exemplo.com/a.pdf')).resolves.toBe(
      'https://exemplo.com/a.pdf',
    );
    expect(storageFrom).not.toHaveBeenCalled();
  });

  it('lança quando o storage recusa — é assim que o paywall aparece', async () => {
    // Sem acesso pago a policy da 015 não deixa assinar. O erro precisa subir
    // para a tela mostrar recado; engolir aqui devolveria um link quebrado.
    createSignedUrl.mockResolvedValue({ data: null, error: { message: 'Object not found' } });
    await expect(resourcesService.resolveDownloadUrl('ludica/x/x.pdf')).rejects.toThrow(
      'Object not found',
    );
  });
});
