'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore, usePendingValue } from '../../hooks/useEditorStore';
import { useDebouncedCallback } from 'use-debounce';

interface TextStyles {
  color?: string;
  fontWeight?: number;
}

interface EditableTextProps {
  documentId: string;
  documentType: 'project' | 'about' | 'siteConfig';
  fieldPath: string;
  value: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  placeholder?: string;
  allowStyles?: boolean;
  defaultStyles?: TextStyles;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#C0C0C0',
];

const FONT_WEIGHTS = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra' },
];

export function EditableText({
  documentId,
  documentType,
  fieldPath,
  value,
  className = '',
  as: Tag = 'p',
  placeholder = 'Click to edit...',
  allowStyles = true,
  defaultStyles = {},
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isEditMode = useEditorStore((state) => state.isEditMode);
  const updateField = useEditorStore((state) => state.updateField);

  // Get pending value if exists, otherwise use current value
  const displayValue = usePendingValue(documentId, fieldPath, value);

  // Get pending styles if exists
  const stylesFieldPath = `${fieldPath}Styles`;
  const currentStyles = usePendingValue<TextStyles>(
    documentId,
    stylesFieldPath,
    defaultStyles
  );

  // Debounced update handler - updates store after 300ms of inactivity
  const debouncedUpdate = useDebouncedCallback((newValue: string) => {
    updateField(documentId, documentType, fieldPath, newValue, value);
  }, 300);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      const newValue = (e.target as HTMLElement).textContent || '';
      debouncedUpdate(newValue);
    },
    [debouncedUpdate]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (allowStyles && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top - 50,
        left: rect.left,
      });
      setShowToolbar(true);
    }
  }, [allowStyles]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't blur if clicking on toolbar
    if (toolbarRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
    // Flush any pending debounced updates
    debouncedUpdate.flush();
    // Delay hiding toolbar to allow button clicks
    setTimeout(() => {
      if (!ref.current?.contains(document.activeElement)) {
        setShowToolbar(false);
        setShowColorPicker(false);
      }
    }, 150);
  }, [debouncedUpdate]);

  // Handle paste - strip formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Prevent enter key from creating new lines (for single-line fields)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, []);

  // Update styles
  const handleStyleChange = useCallback(
    (newStyles: Partial<TextStyles>) => {
      const updatedStyles = { ...currentStyles, ...newStyles };
      updateField(documentId, documentType, stylesFieldPath, updatedStyles, defaultStyles);
    },
    [documentId, documentType, stylesFieldPath, currentStyles, defaultStyles, updateField]
  );

  // Sync content when value changes externally (but not while focused)
  useEffect(() => {
    if (ref.current && !isFocused) {
      ref.current.textContent = displayValue || '';
    }
  }, [displayValue, isFocused]);

  // Handle click outside to close toolbar
  useEffect(() => {
    if (!showToolbar) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(target)
      ) {
        setShowToolbar(false);
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showToolbar]);

  // Non-edit mode: render plain element
  if (!isEditMode) {
    return (
      <Tag
        className={className}
        style={{
          color: currentStyles.color,
          fontWeight: currentStyles.fontWeight,
        }}
      >
        {value || placeholder}
      </Tag>
    );
  }

  // Edit mode: render editable element with toolbar
  return (
    <>
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        className={`
          ${className}
          cursor-text outline-none
          ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2 rounded-sm' : ''}
          hover:ring-2 hover:ring-blue-500/50 hover:ring-offset-2 hover:rounded-sm
          transition-shadow
        `}
        style={{
          color: currentStyles.color,
          fontWeight: currentStyles.fontWeight,
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-editor-field={fieldPath}
        data-editor-document={documentId}
      >
        {displayValue || placeholder}
      </Tag>

      {/* Styling Toolbar */}
      {showToolbar && allowStyles && (
        <div
          ref={toolbarRef}
          className="fixed z-50 bg-black/90 rounded-lg shadow-xl p-2 flex items-center gap-2"
          style={{
            top: Math.max(10, toolbarPosition.top),
            left: toolbarPosition.left,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Color Picker Button */}
          <div className="relative">
            <button
              type="button"
              className="w-8 h-8 rounded border-2 border-white/30 hover:border-white/60 transition-colors"
              style={{ backgroundColor: currentStyles.color || '#000000' }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text color"
            />

            {/* Color Picker Dropdown */}
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 bg-black/95 rounded-lg p-2 shadow-xl">
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded border ${
                        currentStyles.color === color
                          ? 'border-white scale-110'
                          : 'border-white/30 hover:border-white/60'
                      } transition-all`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleStyleChange({ color });
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentStyles.color || '#000000'}
                  onChange={(e) => handleStyleChange({ color: e.target.value })}
                  className="w-full h-8 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20" />

          {/* Font Weight Buttons */}
          <div className="flex gap-1">
            {FONT_WEIGHTS.map(({ value: weight, label }) => (
              <button
                key={weight}
                type="button"
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentStyles.fontWeight === weight
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-white/20'
                }`}
                style={{ fontWeight: weight }}
                onClick={() => handleStyleChange({ fontWeight: weight })}
                title={label}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
