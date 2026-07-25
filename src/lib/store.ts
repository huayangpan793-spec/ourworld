'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Memory, AppSettings, DEFAULT_SETTINGS, PendingLocation, Importance, MemoryType, VisitedStatus } from './types';
import { generateId } from './utils';
import { DEMO_MEMORIES } from './demo-data';
import { supabase } from './supabase';

interface MemoryState {
  // Data
  memories: Memory[];
  settings: AppSettings;
  demoLoaded: boolean;

  // UI state
  selectedMemoryId: string | null;
  isAddingMode: boolean;
  pendingLocation: PendingLocation | null;
  showDetailPanel: boolean;
  toast: { message: string; visible: boolean } | null;

  // Actions — CRUD
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;

  // Actions — UI
  selectMemory: (id: string | null) => void;
  startAddMode: () => void;
  cancelAddMode: () => void;
  setPendingLocation: (location: PendingLocation | null) => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;

  // Actions — Settings
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Actions — Demo data
  loadDemoData: () => void;

  // Actions — Supabase sync
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;

  // Selectors (computed via functions)
  getMemory: (id: string) => Memory | undefined;
  getFutureMemories: () => Memory[];
  getVisitedMemories: () => Memory[];
  getMemoriesByYearMonth: () => Map<string, Map<string, Memory[]>>;
  getAnniversaries: () => Memory[];
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      // State
      memories: [],
      settings: { ...DEFAULT_SETTINGS },
      demoLoaded: false,
      selectedMemoryId: null,
      isAddingMode: false,
      pendingLocation: null,
      showDetailPanel: false,
      toast: null,

      // CRUD
      addMemory: (data) => {
        const id = generateId();
        const now = new Date().toISOString();
        const memory: Memory = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          memories: [...state.memories, memory],
          isAddingMode: false,
          pendingLocation: null,
          selectedMemoryId: id,
          showDetailPanel: true,
        }));
        // Auto-sync to Supabase (fire and forget)
        (async () => { await supabase.from('memories').insert(memory); })();
        return id;
      },

      updateMemory: (id, updates) => {
        const updatedData = { ...updates, updatedAt: new Date().toISOString() };
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, ...updatedData } : m
          ),
        }));
        (async () => { await supabase.from('memories').update(updatedData).eq('id', id); })();
      },

      deleteMemory: (id) => {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
          selectedMemoryId:
            state.selectedMemoryId === id ? null : state.selectedMemoryId,
          showDetailPanel:
            state.selectedMemoryId === id ? false : state.showDetailPanel,
        }));
        (async () => { await supabase.from('memories').delete().eq('id', id); })();
      },

      // Supabase sync
      syncToSupabase: async () => {
        const { memories } = get();
        for (const m of memories) {
          try {
            const { data: existing } = await supabase.from('memories').select('id').eq('id', m.id).single();
            if (existing) {
              await supabase.from('memories').update(m).eq('id', m.id);
            } else {
              await supabase.from('memories').insert(m);
            }
          } catch (err) {
            console.warn('Sync failed for', m.id, err);
          }
        }
      },
      loadFromSupabase: async () => {
        try {
          const { data } = await supabase.from('memories').select('*');
          if (data && data.length > 0) {
            set({ memories: data as Memory[], demoLoaded: true });
          }
        } catch (err) {
          console.warn('Load from Supabase failed, using local data', err);
        }
      },

      // UI
      selectMemory: (id) => {
        set({
          selectedMemoryId: id,
          showDetailPanel: id !== null,
        });
      },

      startAddMode: () => set({ isAddingMode: true, pendingLocation: null }),
      cancelAddMode: () => set({ isAddingMode: false, pendingLocation: null }),
      setPendingLocation: (location) => set({ pendingLocation: location }),

      openDetailPanel: () => set({ showDetailPanel: true }),
      closeDetailPanel: () => set({ showDetailPanel: false }),

      showToast: (message) => {
        set({ toast: { message, visible: true } });
        setTimeout(() => {
          set((s) => (s.toast?.message === message ? { toast: null } : {}));
        }, 3000);
      },

      hideToast: () => set({ toast: null }),

      // Settings
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // Demo data
      loadDemoData: () => {
        const { demoLoaded } = get();
        if (demoLoaded) return;
        set({ memories: [...DEMO_MEMORIES], demoLoaded: true });
      },

      // Selectors
      getMemory: (id) => get().memories.find((m) => m.id === id),

      getFutureMemories: () =>
        get().memories.filter((m) => m.visitedStatus === 'future' && !m.isHidden),

      getVisitedMemories: () =>
        get().memories.filter((m) => m.visitedStatus === 'visited' && !m.isHidden),

      getAnniversaries: () =>
        get().memories.filter((m) => m.anniversary && !m.isHidden),

      getMemoriesByYearMonth: () => {
        const groups = new Map<string, Map<string, Memory[]>>();
        const visible = get().memories
          .filter((m) => !m.isHidden && m.visitedStatus === 'visited')
          .sort((a, b) => b.date.localeCompare(a.date));

        for (const memory of visible) {
          const [year, month] = memory.date.split('-');
          if (!groups.has(year)) groups.set(year, new Map());
          const monthMap = groups.get(year)!;
          if (!monthMap.has(month)) monthMap.set(month, []);
          monthMap.get(month)!.push(memory);
        }
        return groups;
      },
    }),
    {
      name: 'memory-planet-storage',
      version: 1,
      partialize: (state) => ({
        memories: state.memories,
        settings: state.settings,
        demoLoaded: state.demoLoaded,
      }),
      migrate: (persisted: any, version) => {
        // v0 → v1: ensure sitePassword and isUnlocked exist
        if (version < 1) {
          return {
            ...persisted,
            settings: {
              ...persisted.settings,
              sitePassword: persisted.settings?.sitePassword || 'ourworld',
              isUnlocked: false,
            },
          };
        }
        return persisted;
      },
    }
  )
);
