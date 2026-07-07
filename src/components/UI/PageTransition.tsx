import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'idle' | 'exit'>('enter');

  useEffect(() => {
    if (location.pathname) {
      setTransitionStage('enter');
      setDisplayChildren(children);
      const timer = setTimeout(() => setTransitionStage('idle'), 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, children]);

  return (
    <div
      className={`page-transition-wrapper ${transitionStage === 'enter' ? 'page-enter' : transitionStage === 'exit' ? 'page-exit' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {displayChildren}
    </div>
  );
}