import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const store = useStore();

  useEffect(() => {
    const shortcuts: ShortcutMap = {
      '1': () => navigate('/heliocentric'),
      '2': () => navigate('/geocentric'),
      '3': () => navigate('/surface'),
      'r': () => {
        store.resetScene();
        store.addToast({ type: 'info', message: '场景已重置' });
      },
      'e': () => {
        store.setExamDrawerOpen(!store.isExamDrawerOpen);
      },
      'k': () => {
        store.setKnowledgePanelOpen(!store.isKnowledgePanelOpen);
      },
      'Escape': () => {
        store.setExamDrawerOpen(false);
        store.setKnowledgePanelOpen(false);
        store.setMobileRightPanelOpen(false);
      },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in input fields
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Space toggles play/pause
      if (e.key === ' ') {
        e.preventDefault();
        store.togglePlay();
        return;
      }

      // Arrow keys for date/time navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentDate = useStore.getState().currentDate;
        const newDate = new Date(currentDate);

        if (e.key === 'ArrowLeft') {
          if (e.shiftKey) {
            newDate.setDate(newDate.getDate() - 7);
          } else {
            newDate.setDate(newDate.getDate() - 1);
          }
        } else if (e.key === 'ArrowRight') {
          if (e.shiftKey) {
            newDate.setDate(newDate.getDate() + 7);
          } else {
            newDate.setDate(newDate.getDate() + 1);
          }
        } else if (e.key === 'ArrowUp') {
          newDate.setHours(newDate.getHours() + 1);
        } else if (e.key === 'ArrowDown') {
          newDate.setHours(newDate.getHours() - 1);
        }

        store.setDate(newDate);
        return;
      }

      // Single key shortcuts
      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, store]);
}