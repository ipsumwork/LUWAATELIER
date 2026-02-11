import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// Enable Map/Set support in Immer
enableMapSet();

export interface PendingChange {
  documentId: string;
  documentType: 'project' | 'about' | 'siteConfig';
  fieldPath: string;
  value: unknown;
  originalValue: unknown;
  timestamp: number;
}

interface EditorState {
  // Auth state
  isAuthenticated: boolean;

  // Edit mode state
  isEditMode: boolean;

  // Changes tracking
  pendingChanges: Map<string, PendingChange>;
  isDirty: boolean;

  // Publishing state
  isPublishing: boolean;
  publishError: string | null;

  // Actions
  setAuthenticated: (authenticated: boolean) => void;
  setEditMode: (enabled: boolean) => void;
  updateField: (
    documentId: string,
    documentType: 'project' | 'about' | 'siteConfig',
    fieldPath: string,
    value: unknown,
    originalValue: unknown
  ) => void;
  discardChanges: () => void;
  setPublishing: (publishing: boolean) => void;
  setPublishError: (error: string | null) => void;
  clearChangesAfterPublish: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    immer((set) => ({
      // Initial state
      isAuthenticated: false,
      isEditMode: false,
      pendingChanges: new Map(),
      isDirty: false,
      isPublishing: false,
      publishError: null,

      // Actions
      setAuthenticated: (authenticated) =>
        set((state) => {
          state.isAuthenticated = authenticated;
          if (!authenticated) {
            state.isEditMode = false;
            state.pendingChanges.clear();
            state.isDirty = false;
          }
        }),

      setEditMode: (enabled) =>
        set((state) => {
          state.isEditMode = enabled;
          if (!enabled) {
            // Don't clear changes when exiting - user might want to come back
          }
        }),

      updateField: (documentId, documentType, fieldPath, value, originalValue) =>
        set((state) => {
          const key = `${documentId}:${fieldPath}`;

          // Check if value is same as original - if so, remove the change
          if (JSON.stringify(value) === JSON.stringify(originalValue)) {
            state.pendingChanges.delete(key);
          } else {
            state.pendingChanges.set(key, {
              documentId,
              documentType,
              fieldPath,
              value,
              originalValue,
              timestamp: Date.now(),
            });
          }

          state.isDirty = state.pendingChanges.size > 0;
        }),

      discardChanges: () =>
        set((state) => {
          state.pendingChanges.clear();
          state.isDirty = false;
          state.publishError = null;
        }),

      setPublishing: (publishing) =>
        set((state) => {
          state.isPublishing = publishing;
        }),

      setPublishError: (error) =>
        set((state) => {
          state.publishError = error;
        }),

      clearChangesAfterPublish: () =>
        set((state) => {
          state.pendingChanges.clear();
          state.isDirty = false;
          state.isPublishing = false;
          state.publishError = null;
        }),
    })),
    {
      name: 'luwa-editor-storage',
      // Persist edit mode state and pending changes
      partialize: (state) => ({
        isEditMode: state.isEditMode,
        pendingChanges: state.pendingChanges,
        isDirty: state.isDirty,
      }),
      // Custom serialization for Map
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            // Convert array back to Map
            if (parsed.state?.pendingChanges) {
              parsed.state.pendingChanges = new Map(parsed.state.pendingChanges);
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          // Convert Map to array for JSON serialization
          const toStore = {
            ...value,
            state: {
              ...value.state,
              pendingChanges: value.state.pendingChanges
                ? Array.from(value.state.pendingChanges.entries())
                : [],
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Helper hook to get pending value for a field
export function usePendingValue<T>(
  documentId: string,
  fieldPath: string,
  currentValue: T
): T {
  const pendingChanges = useEditorStore((state) => state.pendingChanges);
  const key = `${documentId}:${fieldPath}`;
  const pending = pendingChanges.get(key);
  return pending ? (pending.value as T) : currentValue;
}
