import { useState, useRef, useEffect, cloneElement, type ReactElement } from 'react';

interface ContextTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: ReactElement;
}

export default function ContextTooltip({
  content,
  position = 'top',
  delay = 500,
  children,
}: ContextTooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const positionStyles: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white/10 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white/10 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white/10 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white/10 border-t-transparent border-b-transparent border-l-transparent',
  };

  const childWithEvents = cloneElement(children, {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });

  return (
    <div className="relative inline-flex">
      {childWithEvents}
      {visible && (
        <div
          className={`absolute z-[250] ${positionStyles[position]} animate-toast-enter pointer-events-none`}
        >
          <div className="bg-[#0a0e27]/95 border border-white/10 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
            <span className="text-[11px] text-white/70">{content}</span>
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowStyles[position]}`} />
        </div>
      )}
    </div>
  );
}