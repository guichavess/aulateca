import { supabase } from '@/integrations/supabase/client';

export const favoritesService = {
  async fetchAll(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('favorites')
      .select('resource_id')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    return (data ?? []).map((f: any) => f.resource_id);
  },

  async add(resourceId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, resource_id: resourceId });

    if (error && error.code !== '23505') throw new Error(error.message);
  },

  async remove(resourceId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_id', resourceId);

    if (error) throw new Error(error.message);
  },
};
