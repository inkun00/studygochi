import type { SupabaseClient } from '@supabase/supabase-js';
import { MAX_STUDY_LOGS } from './constants';

/**
 * 노트가 최대 개수를 초과하면 가장 오래된 지식 1개를 삭제
 */
export async function ensureStudyLogsLimit(supabase: SupabaseClient, userId: string): Promise<void> {
  const { count } = await supabase
    .from('study_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (count != null && count >= MAX_STUDY_LOGS) {
    const { data: oldest } = await supabase
      .from('study_logs')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (oldest?.id) {
      await supabase.from('study_logs').delete().eq('id', oldest.id);
    }
  }
}
