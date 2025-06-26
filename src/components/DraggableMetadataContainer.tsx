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

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative bg-white rounded-lg border border-gray-200 transition-all duration-200 cursor-move
        ${isDragging ? 'opacity-50 scale-95 shadow-lg' : ''}
        ${isDraggedOver ? 'border-blue-400 shadow-md' : ''}
        ${isOver ? 'transform translate-y-1' : ''}
        hover:shadow-md
      `}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
      
      {/* Drop indicator */}
      {isDraggedOver && (
        <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded-lg pointer-events-none" />
      )}
      
      <div className="p-4 group">
        {children}
      </div>
    </div>
  );
};

export default DraggableMetadataContainer;