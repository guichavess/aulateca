import { supabase } from '@/integrations/supabase/client';
import type { Resource, CategoryId, ResourceType, AgeRange } from '@/lib/types';

interface ResourcesResponse {
  data: Resource[];
  total: number;
  page: number;
  pages: number;
}

interface FetchResourcesParams {
  category?: CategoryId;
  ageRange?: AgeRange;
  search?: string;
  page?: number;
  limit?: number;
}

// Escapa wildcards do ILIKE (% e _) e o próprio caractere de escape (\).
function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

// Envolve o valor em aspas duplas para que vírgulas/parênteses não sejam
// interpretados como separadores/agrupadores pelo PostgREST no .or().
// Aspas internas são duplicadas, conforme parser do PostgREST.
function quotePostgrestValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

type ResourceRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  age_range: string;
  duration: string;
  downloads: number | null;
  rating: number | null;
  is_new: boolean | null;
  file_url: string | null;
  image_url: string | null;
  author_name: string | null;
  profiles: { name: string } | null;
};

export function toResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as CategoryId,
    type: row.type as ResourceType,
    ageRange: row.age_range as AgeRange,
    duration: row.duration,
    downloads: row.downloads ?? 0,
    rating: row.rating ?? 0,
    isNew: row.is_new ?? false,
    // author_name cobre o acervo curado, que não tem dono em auth.users (009).
    author: row.profiles?.name ?? row.author_name ?? 'Aulateca',
    fileUrl: row.file_url ?? null,
    imageUrl: row.image_url ?? undefined,
  };
}

// ── Download do conteúdo pago ────────────────────────────────────────────────
// Desde a Fase 5 os PDFs não moram mais em public/: estão no bucket privado
// `atividades`. Por isso `file_url` deixou de ser URL e passou a ser o caminho
// dentro do bucket ("ludica/<slug>/<slug>.pdf"), que só vira link depois de
// assinado — e a policy de storage (migration 015) só assina para quem tem
// acesso pago.
export const ATIVIDADES_BUCKET = 'atividades';

// 60 s: tempo de sobra para o navegador iniciar o download e curto demais para
// o link virar moeda de troca em grupo de WhatsApp.
export const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Distingue caminho de bucket de URL pronta. Continua existindo link absoluto
 * no acervo — recurso cadastrado pelo /admin apontando para fora — e esse
 * abre direto, sem assinatura.
 */
export function isBucketPath(fileUrl: string): boolean {
  return !/^[a-z]+:/i.test(fileUrl) && !fileUrl.startsWith('//') && !fileUrl.startsWith('/');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A coluna `resources.id` é uuid: mandar um id de mock ('1', '2'…) faz o
// Postgres devolver erro 22P02 e derruba a tela inteira. Filtramos antes.
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export const resourcesService = {
  async fetchAll(params: FetchResourcesParams = {}): Promise<ResourcesResponse> {
    const { category, ageRange, search, page = 1, limit = 12 } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('resources')
      .select('*, profiles(name)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') query = query.eq('category', category);
    if (ageRange && ageRange !== 'all') query = query.eq('age_range', ageRange);
    if (search) {
      const pattern = quotePostgrestValue(`%${escapeIlikePattern(search)}%`);
      query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map(toResource),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  async fetchOne(id: string): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .select('*, profiles(name)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return toResource(data);
  },

  async fetchByIds(ids: string[]): Promise<Resource[]> {
    const validIds = ids.filter(isUuid);
    if (validIds.length === 0) return [];
    const { data, error } = await supabase
      .from('resources')
      .select('*, profiles(name)')
      .in('id', validIds);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toResource);
  },

  async create(resource: Omit<Resource, 'id' | 'downloads' | 'rating' | 'author'>, authorId: string): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: resource.title,
        description: resource.description,
        category: resource.category,
        type: resource.type,
        age_range: resource.ageRange,
        duration: resource.duration,
        is_new: resource.isNew ?? false,
        image_url: resource.imageUrl ?? null,
        author_id: authorId,
      })
      .select('*, profiles(name)')
      .single();
    if (error) throw new Error(error.message);
    return toResource(data);
  },

  async registerDownload(id: string): Promise<void> {
    if (!isUuid(id)) return;
    await supabase.rpc('increment_downloads', { resource_id: id });
  },

  // Devolve um link abrível para o arquivo do recurso. Lança quando o storage
  // recusa: sem acesso pago a policy não deixa assinar, e é isso que faz o
  // paywall valer no arquivo, não só na tela.
  async resolveDownloadUrl(fileUrl: string): Promise<string> {
    if (!isBucketPath(fileUrl)) return fileUrl;

    const { data, error } = await supabase.storage
      .from(ATIVIDADES_BUCKET)
      .createSignedUrl(fileUrl, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message ?? 'não foi possível gerar o link do arquivo');
    }
    return data.signedUrl;
  },
};
