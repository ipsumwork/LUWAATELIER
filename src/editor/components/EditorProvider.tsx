'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEditorStore } from '../hooks/useEditorStore';
import { LoginModal } from './LoginModal';
import { EditorToolbar } from './EditorToolbar';

interface EditorProviderProps {
  children: React.ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const hasCheckedAuth = useRef(false);

  const isAuthenticated = useEditorStore((state) => state.isAuthenticated);
  const isEditMode = useEditorStore((state) => state.isEditMode);
  const isDirty = useEditorStore((state) => state.isDirty);
  const setAuthenticated = useEditorStore((state) => state.setAuthenticated);
  const setEditMode = useEditorStore((state) => state.setEditMode);
  const discardChanges = useEditorStore((state) => state.discardChanges);

  // Check for edit mode URL param
  const editParam = searchParams.get('edit');
  const wantsEditMode = editParam === 'true';

  // Check authentication status on mount - only once
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/editor/auth');
        if (response.ok) {
          setAuthenticated(true);
          // If URL has ?edit=true OR we were already in edit mode, stay in edit mode
          if (wantsEditMode || isEditMode) {
            setEditMode(true);
          }
        } else {
          setAuthenticated(false);
          // Only show login if URL explicitly requests edit mode
          if (wantsEditMode) {
            setShowLoginModal(true);
          }
          // If not authenticated but was in edit mode, exit edit mode
          if (isEditMode) {
            setEditMode(false);
          }
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [wantsEditMode, isEditMode, setAuthenticated, setEditMode]);

  // Show login modal when ?edit=true but not authenticated
  useEffect(() => {
    if (!isCheckingAuth && wantsEditMode && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [wantsEditMode, isAuthenticated, isCheckingAuth]);

  // Handle closing login modal
  const handleCloseLoginModal = useCallback(() => {
    setShowLoginModal(false);
    // Remove edit param from URL if not authenticated
    if (!isAuthenticated) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('edit');
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newUrl);
    }
  }, [isAuthenticated, searchParams, router]);

  // Handle exit edit mode
  const handleExitEditMode = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to exit edit mode?'
      );
      if (!confirm) return;
      discardChanges();
    }
    setEditMode(false);
    // Remove edit param from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('edit');
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  }, [isDirty, discardChanges, setEditMode, searchParams, router]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <>
      {children}

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={handleCloseLoginModal} />}

      {/* Editor Toolbar */}
      {isEditMode && isAuthenticated && (
        <EditorToolbar onExitEditMode={handleExitEditMode} />
      )}
    </>
  );
}
