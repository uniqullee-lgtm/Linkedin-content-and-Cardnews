'use client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SlideContent } from '@/types/cardnews'

interface SlideListProps {
  slides: SlideContent[]
  selectedId: string
  onSelect: (id: string) => void
  onReorder: (slides: SlideContent[]) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

function SortableSlideItem({ slide, isSelected, onSelect, onRemove }: {
  slide: SlideContent
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-all select-none',
        isSelected ? 'bg-brand-blue-light border-brand-blue text-brand-navy' : 'bg-white border-gray-100 hover:border-gray-200',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={onSelect}
    >
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {slide.type === 'cover' ? '📌 커버' : slide.type === 'closing' ? '🏁 클로징' : `${slide.slideNumber}. 내용`}
        </p>
        <p className="text-xs text-gray-400 truncate">{slide.title}</p>
      </div>
      {slide.type === 'content' && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export function SlideList({ slides, selectedId, onSelect, onReorder, onAdd, onRemove }: SlideListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex(s => s.id === active.id)
      const newIndex = slides.findIndex(s => s.id === over.id)
      onReorder(arrayMove(slides, oldIndex, newIndex))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {slides.map(slide => (
            <SortableSlideItem
              key={slide.id}
              slide={slide}
              isSelected={slide.id === selectedId}
              onSelect={() => onSelect(slide.id)}
              onRemove={() => onRemove(slide.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-brand-blue hover:text-brand-navy mt-1"
      >
        <Plus className="w-3.5 h-3.5" /> 슬라이드 추가
      </button>
    </div>
  )
}
