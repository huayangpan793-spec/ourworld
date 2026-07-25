import { createClient } from '@supabase/supabase-js';
import { Memory } from './types';

const SUPABASE_URL = 'https://uzjkxhfkqrpqfulgjmnj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_szaYS7qm3TDwrcfkQlQbpw_-egb5RgF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// ─── CamelCase ↔ Snake_Case mapper ───
// JS 字段 → SQL 列名映射
const FIELD_MAP: Record<string, string> = {
  locationName: 'location_name',
  coverPhoto: 'cover_photo',
  photoCaptions: 'photo_captions',
  memoryType: 'memory_type',
  visitedStatus: 'visited_status',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  unlockDate: 'unlock_date',
  isHidden: 'is_hidden',
  voiceRecord: 'voice_record',
};

const REVERSE_MAP: Record<string, string> = {};
for (const [k, v] of Object.entries(FIELD_MAP)) REVERSE_MAP[v] = k;

export function toSnake(memory: Memory): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(memory)) {
    out[FIELD_MAP[key] || key] = value;
  }
  return out;
}

export function toCamel(row: Record<string, any>): Memory {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    out[REVERSE_MAP[key] || key] = value;
  }
  return out as Memory;
}
