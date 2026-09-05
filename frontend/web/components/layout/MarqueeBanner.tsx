'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

const SLOGAN_TEXT =
  '🔥 QUYẾT TÂM!!!!! • Có tiền ít thì từ thiện ít, nhiều thì từ thiện nhiều nha!!! • Học cái hiểu biết nhiều để biết ơn • Lấy tham thiền làm niềm vui • English learner! (chuẩn bị về các cơ chế management và cách thu âm) • Bản vẽ • PHẢI OBSERVATION NHIỀU HƠN NỮA!!!!! • PHẢI BIẾT LƯỢNG SỨC MÌNH!!!';

export function MarqueeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  const handleWrap = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const oneThirdWidth = container.scrollWidth / 3;
    if (oneThirdWidth <= 0) return;

    if (container.scrollLeft >= oneThirdWidth * 2) {
      container.scrollLeft -= oneThirdWidth;
    } else if (container.scrollLeft <= 2) {
      container.scrollLeft += oneThirdWidth;
    }
  }, []);

  // Handle auto-scroll loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial position to 1/3 so user can scroll left or right freely
    if (container.scrollLeft === 0 && container.scrollWidth > 0) {
      container.scrollLeft = container.scrollWidth / 3;
    }

    let animationFrameId: number;

    const autoScroll = () => {
      if (!isDragging && !isHovered && container) {
        container.scrollLeft += 0.8;
        handleWrap();
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging, isHovered, handleWrap]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    startXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    const dx = e.clientX - startXRef.current;
    container.scrollLeft = startScrollLeftRef.current - dx;
    handleWrap();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full bg-blue-600 text-white py-2 px-2 flex-shrink-0 z-30 relative shadow-[0_-2px_10px_rgba(0,0,0,0.15)] select-none border-t border-blue-500">
      <div
        ref={containerRef}
        className={`w-full overflow-x-auto no-scrollbar flex items-center whitespace-nowrap leading-normal ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onScroll={handleWrap}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={() => {
          handleMouseUpOrLeave();
          setIsHovered(false);
        }}
        onMouseEnter={() => setIsHovered(true)}
      >
        <div className="flex shrink-0 items-center space-x-6 px-4 text-sm font-semibold tracking-wide">
          <span>{SLOGAN_TEXT}</span>
        </div>
        <div className="flex shrink-0 items-center space-x-6 px-4 text-sm font-semibold tracking-wide" aria-hidden="true">
          <span>{SLOGAN_TEXT}</span>
        </div>
        <div className="flex shrink-0 items-center space-x-6 px-4 text-sm font-semibold tracking-wide" aria-hidden="true">
          <span>{SLOGAN_TEXT}</span>
        </div>
      </div>
    </div>
  );
}
