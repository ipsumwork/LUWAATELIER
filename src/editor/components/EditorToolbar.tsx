'use client';

import { useState } from 'react';
import { useEditorStore } from '../hooks/useEditorStore';

interface EditorToolbarProps {
  onExitEditMode: () => void;
}

export function EditorToolbar({ onExitEditMode }: EditorToolbarProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const isDirty = useEditorStore((state) => state.isDirty);
  const isPublishing = useEditorStore((state) => state.isPublishing);
  const publishError = useEditorStore((state) => state.publishError);
  const pendingChanges = useEditorStore((state) => state.pendingChanges);
  const discardChanges = useEditorStore((state) => state.discardChanges);
  const setPublishing = useEditorStore((state) => state.setPublishing);
  const setPublishError = useEditorStore((state) => state.setPublishError);
  const clearChangesAfterPublish = useEditorStore((state) => state.clearChangesAfterPublish);

  const changeCount = pendingChanges.size;

  const handlePublish = async () => {
    if (!isDirty || isPublishing) return;

    setPublishing(true);
    setPublishError(null);

    try {
      // Convert Map to array for JSON
      const changes = Array.from(pendingChanges.values());

      const response = await fetch('/api/editor/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });

      if (response.ok) {
        clearChangesAfterPublish();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const data = await response.json();
        setPublishError(data.error || 'Failed to publish changes');
      }
    } catch {
      setPublishError('Connection error. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscard = () => {
    if (!isDirty) return;

    const confirm = window.confirm(
      'Are you sure you want to discard all changes? This cannot be undone.'
    );
    if (confirm) {
      discardChanges();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 bg-black text-white px-4 py-3 rounded-full shadow-2xl">
      {/* Edit Mode Indicator */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/20">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm font-medium">Edit Mode</span>
      </div>

      {/* Change Counter */}
      {isDirty && (
        <span className="text-sm text-white/70">
          {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}
        </span>
      )}

      {/* Success Message */}
      {showSuccess && (
        <span className="text-sm text-green-400 font-medium">
          Published successfully!
        </span>
      )}

      {/* Error Message */}
      {publishError && (
        <span className="text-sm text-red-400 font-medium">
          {publishError}
        </span>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pl-3 border-l border-white/20">
        {/* Discard Button */}
        <button
          onClick={handleDiscard}
          disabled={!isDirty || isPublishing}
          className="px-4 py-2 text-sm font-medium rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Discard
        </button>

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={!isDirty || isPublishing}
          className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </button>

        {/* Exit Button */}
        <button
          onClick={onExitEditMode}
          disabled={isPublishing}
          className="px-4 py-2 text-sm font-medium rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
