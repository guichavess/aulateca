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
  type?: ResourceType;
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
  profiles: { name: string } | null;
};

function toResource(row: ResourceRow): Resource {
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
    author: row.profiles?.name ?? 'Aulateca',
    fileUrl: row.file_url ?? null,
  };
}

export const resourcesService = {
  async fetchAll(params: FetchResourcesParams = {}): Promise<ResourcesResponse> {
    const { category, type, ageRange, search, page = 1, limit = 12 } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('resources')
      .select('*, profiles(name)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') query = query.eq('category', category);
    if (type) query = query.eq('type', type);
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
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from('resources')
      .select('*, profiles(name)')
      .in('id', ids);
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
        author_id: authorId,
      })
      .select('*, profiles(name)')
      .single();
    if (error) throw new Error(error.message);
    return toResource(data);
  },

  async registerDownload(id: string): Promise<void> {
    await supabase.rpc('increment_downloads', { resource_id: id });
  },
};
