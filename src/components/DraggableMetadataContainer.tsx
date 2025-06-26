import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableMetadataContainerProps {
  id: string;
  index: number;
  children: React.ReactNode;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDragOver: (index: number) => void;
  isDragging: boolean;
  isOver: boolean;
}

const DraggableMetadataContainer: React.FC<DraggableMetadataContainerProps> = ({
  id,
  index,
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  isDragging,
  isOver
}) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    onDragStart(index);
  };

  const handleDragEnd = () => {
    onDragEnd();
    setIsDraggedOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggedOver(true);
    onDragOver(index);
  };

  const handleDragLeave = () => {
    setIsDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
  };

  // Prevent dragging when starting from text content
  const handleMouseDown = (e: React.MouseEvent) => {
    // If the mousedown is on text content (not the drag handle), prevent container dragging
    const target = e.target as HTMLElement;
    if (target.closest('.drag-handle')) {
      return; // Allow dragging from the handle
    }
    // For text content, ensure normal text selection behavior
    e.stopPropagation();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      className={`
        relative bg-white rounded-lg border border-gray-200 transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95 shadow-lg' : ''}
        ${isDraggedOver ? 'border-blue-400 shadow-md' : ''}
        ${isOver ? 'transform translate-y-1' : ''}
        hover:shadow-md
      `}
    >
      {/* Dedicated Drag Handle */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`
          drag-handle absolute top-2 right-2 p-2 rounded cursor-grab active:cursor-grabbing
          transition-all duration-200 hover:bg-gray-100
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-gray-500" />
      </div>
      
      {/* Drop indicator */}
      {isDraggedOver && (
        <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded-lg pointer-events-none" />
      )}
      
      {/* Content area - allows normal text selection */}
      <div className="p-4 pr-12 select-text">
        {children}
      </div>
    </div>
  );
};

export default DraggableMetadataContainer;