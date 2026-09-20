'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DEFAULT_SLOGAN =
  '🔥 QUYẾT TÂM!!!!! • Có tiền ít thì từ thiện ít, nhiều thì từ thiện nhiều nha!!! • Học cái hiểu biết nhiều để biết ơn • Lấy tham thiền làm niềm vui • English learner! (chuẩn bị về các cơ chế management và cách thu âm) • Bản vẽ • PHẢI OBSERVATION NHIỀU HƠN NỮA!!!!! • PHẢI BIẾT LƯỢNG SỨC MÌNH!!!';

export function MarqueeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const [marqueeText, setMarqueeText] = useState<string>(DEFAULT_SLOGAN);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [marqueeSpeed, setMarqueeSpeed] = useState<number>(1.0);
  const [marqueeDirection, setMarqueeDirection] = useState<string>('left'); // 'left' = Right-to-Left, 'right' = Left-to-Right

  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  const loadSettings = useCallback(() => {
    const cachedText = localStorage.getItem('marquee_text');
    const cachedEnabled = localStorage.getItem('marquee_enabled');
    const cachedSpeed = localStorage.getItem('marquee_speed');
    const cachedDirection = localStorage.getItem('marquee_direction');

    if (cachedText !== null) setMarqueeText(cachedText);
    if (cachedEnabled !== null) setIsEnabled(cachedEnabled === 'true');
    if (cachedSpeed !== null) setMarqueeSpeed(parseFloat(cachedSpeed) || 1.0);
    if (cachedDirection !== null) setMarqueeDirection(cachedDirection);

    axios
      .get('http://localhost:3000/api/settings')
      .then((res) => {
        if (res.data) {
          if (res.data.marqueeText !== undefined) {
            setMarqueeText(res.data.marqueeText);
            localStorage.setItem('marquee_text', res.data.marqueeText);
          }
          if (res.data.marqueeEnabled !== undefined) {
            setIsEnabled(res.data.marqueeEnabled);
            localStorage.setItem('marquee_enabled', String(res.data.marqueeEnabled));
          }
          if (res.data.marqueeSpeed !== undefined) {
            setMarqueeSpeed(Number(res.data.marqueeSpeed) || 1.0);
            localStorage.setItem('marquee_speed', String(res.data.marqueeSpeed));
          }
          if (res.data.marqueeDirection !== undefined) {
            setMarqueeDirection(res.data.marqueeDirection);
            localStorage.setItem('marquee_direction', res.data.marqueeDirection);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch marquee settings from backend:', err);
      });
  }, []);

  useEffect(() => {
    loadSettings();

    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        marqueeText?: string;
        marqueeEnabled?: boolean;
        marqueeSpeed?: number;
        marqueeDirection?: string;
      }>;

      if (customEvent.detail) {
        if (customEvent.detail.marqueeText !== undefined) setMarqueeText(customEvent.detail.marqueeText);
        if (customEvent.detail.marqueeEnabled !== undefined) setIsEnabled(customEvent.detail.marqueeEnabled);
        if (customEvent.detail.marqueeSpeed !== undefined) setMarqueeSpeed(customEvent.detail.marqueeSpeed);
        if (customEvent.detail.marqueeDirection !== undefined) setMarqueeDirection(customEvent.detail.marqueeDirection);
      } else {
        loadSettings();
      }
    };

    window.addEventListener('marquee-updated', handleCustomUpdate);
    window.addEventListener('storage', loadSettings);

    return () => {
      window.removeEventListener('marquee-updated', handleCustomUpdate);
      window.removeEventListener('storage', loadSettings);
    };
  }, [loadSettings]);

  const handleWrap = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const halfWidth = container.scrollWidth / 2;
    if (halfWidth <= 0) return;

    if (container.scrollLeft >= halfWidth * 1.5) {
      container.scrollLeft -= halfWidth / 2;
    } else if (container.scrollLeft <= 2) {
      container.scrollLeft += halfWidth / 2;
    }
  }, []);

  // Auto-scroll animation loop
  useEffect(() => {
    if (!isEnabled) return;

    const container = containerRef.current;
    if (!container) return;

    if (container.scrollLeft === 0 && container.scrollWidth > 0) {
      container.scrollLeft = container.scrollWidth / 4;
    }

    let animationFrameId: number;

    const autoScroll = () => {
      if (!isDragging && !isHovered && container) {
        const step = marqueeSpeed * 0.8;
        if (marqueeDirection === 'right') {
          // Left to Right (->)
          container.scrollLeft -= step;
        } else {
          // Right to Left (<-)
          container.scrollLeft += step;
        }
        handleWrap();
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging, isHovered, handleWrap, isEnabled, marqueeSpeed, marqueeDirection]);

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

  if (!isEnabled) {
    return null;
  }

  const textToDisplay = marqueeText || DEFAULT_SLOGAN;
  // Repeat items 8 times to guarantee horizontal overflow even for short slogans
  const repeatCount = 8;
  const items = Array.from({ length: repeatCount });

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
        {items.map((_, index) => (
          <div
            key={index}
            className="flex shrink-0 items-center space-x-6 px-4 text-sm font-semibold tracking-wide"
            aria-hidden={index > 0 ? 'true' : undefined}
          >
            <span>{textToDisplay}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
