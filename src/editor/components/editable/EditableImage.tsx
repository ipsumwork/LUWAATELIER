'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { SanityImage } from '@/components/SanityImage';
import { useEditorStore, usePendingValue } from '../../hooks/useEditorStore';
import type { SanityImageExpanded } from '@/sanity/lib/types';

interface ImageConfig {
  width: number;
  aspectRatio: string;
}

interface EditableImageProps {
  documentId: string;
  documentType: 'project' | 'about' | 'siteConfig';
  fieldPath: string;
  image: SanityImageExpanded;
  alt?: string;
  className?: string;
  containerClassName?: string;
  defaultConfig?: ImageConfig;
  fill?: boolean;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

export function EditableImage({
  documentId,
  documentType,
  fieldPath,
  image,
  alt,
  className = '',
  containerClassName = '',
  defaultConfig = { width: 100, aspectRatio: '16/9' },
  fill = false,
}: EditableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });

  const isEditMode = useEditorStore((state) => state.isEditMode);
  const updateField = useEditorStore((state) => state.updateField);

  // Get pending config or use default
  const configFieldPath = `${fieldPath}Config`;
  const currentConfig = usePendingValue<ImageConfig>(
    documentId,
    configFieldPath,
    defaultConfig
  );

  const handleClick = useCallback(() => {
    if (!isEditMode) return;
    setIsSelected(true);
  }, [isEditMode]);

  // Handle click outside to deselect
  useEffect(() => {
    if (!isSelected) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSelected]);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setActiveHandle(handle);
      setDragStart({ x: e.clientX, y: e.clientY });

      if (containerRef.current) {
        setStartDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    },
    []
  );

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDragging || !containerRef.current || !activeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const parentWidth = container.parentElement?.offsetWidth || 1;
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newWidth = currentConfig.width;
      let newAspectRatio = currentConfig.aspectRatio;

      // Calculate based on handle position
      if (activeHandle.includes('e')) {
        const newPixelWidth = startDimensions.width + deltaX;
        newWidth = Math.max(20, Math.min(100, (newPixelWidth / parentWidth) * 100));
      } else if (activeHandle.includes('w')) {
        const newPixelWidth = startDimensions.width - deltaX;
        newWidth = Math.max(20, Math.min(100, (newPixelWidth / parentWidth) * 100));
      }

      // For corner handles, also adjust aspect ratio
      if (activeHandle === 'se' || activeHandle === 'sw' || activeHandle === 'ne' || activeHandle === 'nw') {
        const newPixelWidth = activeHandle.includes('e')
          ? startDimensions.width + deltaX
          : startDimensions.width - deltaX;
        const newPixelHeight = activeHandle.includes('s')
          ? startDimensions.height + deltaY
          : startDimensions.height - deltaY;

        if (newPixelWidth > 0 && newPixelHeight > 0) {
          const ratio = newPixelWidth / newPixelHeight;
          // Round to nearest common ratio or keep custom
          if (Math.abs(ratio - 16/9) < 0.15) newAspectRatio = '16/9';
          else if (Math.abs(ratio - 4/3) < 0.15) newAspectRatio = '4/3';
          else if (Math.abs(ratio - 1) < 0.15) newAspectRatio = '1/1';
          else if (Math.abs(ratio - 3/4) < 0.15) newAspectRatio = '3/4';
          else newAspectRatio = `${Math.round(ratio * 100) / 100}`;
        }
      }

      updateField(documentId, documentType, configFieldPath, {
        width: Math.round(newWidth),
        aspectRatio: newAspectRatio,
      }, defaultConfig);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeHandle, dragStart, startDimensions, documentId, documentType, configFieldPath, currentConfig, defaultConfig, updateField]);

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback(
    (newAspectRatio: string) => {
      updateField(documentId, documentType, configFieldPath, {
        ...currentConfig,
        aspectRatio: newAspectRatio,
      }, defaultConfig);
    },
    [documentId, documentType, configFieldPath, currentConfig, defaultConfig, updateField]
  );

  // Get cursor for handle
  const getCursor = (handle: ResizeHandle) => {
    const cursors: Record<ResizeHandle, string> = {
      nw: 'nwse-resize',
      ne: 'nesw-resize',
      sw: 'nesw-resize',
      se: 'nwse-resize',
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
    };
    return cursors[handle];
  };

  // Non-edit mode: render plain image
  if (!isEditMode) {
    if (fill) {
      return (
        <div className={containerClassName}>
          <SanityImage image={image} alt={alt || ''} fill className={className} />
        </div>
      );
    }
    return (
      <div className={containerClassName} style={{ aspectRatio: currentConfig.aspectRatio }}>
        <SanityImage image={image} alt={alt || ''} fill className={className} />
      </div>
    );
  }

  // Edit mode: render editable image
  return (
    <div
      ref={containerRef}
      className={`
        relative
        ${containerClassName}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? '' : 'cursor-pointer'}
        hover:ring-2 hover:ring-blue-500/50
        transition-shadow
      `}
      style={{
        width: `${currentConfig.width}%`,
        aspectRatio: currentConfig.aspectRatio,
      }}
      onClick={handleClick}
      data-editor-field={fieldPath}
      data-editor-document={documentId}
    >
      <SanityImage image={image} alt={alt || ''} fill className={className} />

      {/* Resize Handles - only show when selected */}
      {isSelected && (
        <>
          {/* Corner Handles */}
          {(['nw', 'ne', 'sw', 'se'] as ResizeHandle[]).map((handle) => (
            <div
              key={handle}
              className={`
                absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-sm
                ${handle.includes('n') ? '-top-2' : '-bottom-2'}
                ${handle.includes('w') ? '-left-2' : '-right-2'}
                hover:bg-blue-100 transition-colors z-10
              `}
              style={{ cursor: getCursor(handle) }}
              onMouseDown={(e) => handleMouseDown(e, handle)}
            />
          ))}

          {/* Edge Handles */}
          {(['n', 's', 'e', 'w'] as ResizeHandle[]).map((handle) => {
            const isVertical = handle === 'n' || handle === 's';
            return (
              <div
                key={handle}
                className={`
                  absolute bg-white border-2 border-blue-500 rounded-sm
                  ${isVertical ? 'w-8 h-3 left-1/2 -translate-x-1/2' : 'w-3 h-8 top-1/2 -translate-y-1/2'}
                  ${handle === 'n' ? '-top-1.5' : ''}
                  ${handle === 's' ? '-bottom-1.5' : ''}
                  ${handle === 'e' ? '-right-1.5' : ''}
                  ${handle === 'w' ? '-left-1.5' : ''}
                  hover:bg-blue-100 transition-colors z-10
                `}
                style={{ cursor: getCursor(handle) }}
                onMouseDown={(e) => handleMouseDown(e, handle)}
              />
            );
          })}

          {/* Aspect ratio controls */}
          <div className="absolute -bottom-12 left-0 flex gap-1 bg-black/90 rounded-lg p-1 z-20">
            {['16/9', '4/3', '1/1', '3/4'].map((ratio) => (
              <button
                key={ratio}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAspectRatioChange(ratio);
                }}
                className={`
                  px-2 py-1 text-xs font-medium rounded
                  ${currentConfig.aspectRatio === ratio ? 'bg-white text-black' : 'text-white hover:bg-white/20'}
                  transition-colors
                `}
              >
                {ratio.replace('/', ':')}
              </button>
            ))}
          </div>

          {/* Size indicator */}
          <div className="absolute -top-8 left-0 bg-black/90 text-white text-xs px-2 py-1 rounded z-20">
            {currentConfig.width}% • {currentConfig.aspectRatio.replace('/', ':')}
          </div>
        </>
      )}
    </div>
  );
}
