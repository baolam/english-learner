'use client';

import { Library, LayoutDashboard, Calendar, Settings, GripVertical, CheckSquare, Sparkles, Image, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const INITIAL_NAV_ITEMS = [
  { id: 'dashboard', href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'library', href: '/library', icon: Library, label: 'Library' },
  { id: 'schedules', href: '/schedules', icon: Calendar, label: 'Schedules' },
  { id: 'todos', href: '/todos', icon: CheckSquare, label: 'Todos' },
  { id: 'screenshots', href: '/screenshots', icon: Image, label: 'Screenshots' },
  { id: 'audios', href: '/audios', icon: Headphones, label: 'Audios' },
  { id: 'copilot', href: '/copilot', icon: Sparkles, label: 'AI Copilot' },
];

export function Sidebar() {
  const [navItems, setNavItems] = useState(INITIAL_NAV_ITEMS);
  const [isMounted, setIsMounted] = useState(false);
  
  // Resizing state
  const [width, setWidth] = useState(224); // 224px is equivalent to w-56
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      let newWidth = e.clientX;
      if (newWidth < 70) newWidth = 70; // min width
      if (newWidth > 450) newWidth = 450; // max width
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Optional: save width to localStorage here if you want it to persist
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(navItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNavItems(items);
  };

  return (
    <aside 
      className="relative bg-slate-900 text-slate-300 flex flex-col h-full flex-shrink-0 transition-[width] duration-75"
      style={{ width: `${width}px` }}
    >
      <div className="p-4 flex items-center gap-2 border-b border-slate-700 text-white overflow-hidden">
        <span className="font-bold text-xl truncate">Assistant</span>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        {isMounted ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="nav-items">
              {(provided) => (
                <ul 
                  className="space-y-1 px-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {navItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative ${snapshot.isDragging ? 'z-50 bg-slate-800 rounded-md shadow-lg' : ''}`}
                        >
                          <div className="flex items-center">
                            {/* Drag Handle */}
                            <div 
                              {...provided.dragHandleProps} 
                              className="p-1.5 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing"
                              title="Drag to reorder"
                            >
                              <GripVertical size={16} />
                            </div>
                            
                            <Link 
                              href={item.href} 
                              className="flex-1 flex items-center gap-3 px-2 py-2 rounded-md hover:bg-slate-800 hover:text-white transition overflow-hidden whitespace-nowrap"
                            >
                              <item.icon size={20} className="flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <div className="flex items-center">
                  <div className="p-1.5 text-slate-500">
                    <GripVertical size={16} />
                  </div>
                  <Link 
                    href={item.href} 
                    className="flex-1 flex items-center gap-3 px-2 py-2 rounded-md hover:bg-slate-800 hover:text-white transition overflow-hidden whitespace-nowrap"
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700 mt-auto">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md hover:bg-slate-800 hover:text-white transition overflow-hidden whitespace-nowrap">
          <Settings size={20} className="flex-shrink-0" />
          <span className="truncate">Settings</span>
        </button>
      </div>

      {/* Resizer Handle */}
      <div 
        className="absolute top-0 right-0 w-[4px] h-full cursor-col-resize hover:bg-slate-500 transition-colors z-50 group"
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent text selection
          setIsResizing(true);
        }}
      >
        <div className={`absolute top-0 right-0 w-[4px] h-full ${isResizing ? 'bg-slate-500' : 'bg-transparent group-hover:bg-slate-600'} transition-colors`} />
      </div>
    </aside>
  );
}
