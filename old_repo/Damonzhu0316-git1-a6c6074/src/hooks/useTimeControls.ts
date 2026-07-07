import { useStore } from '@/store/useStore';

export function useTimeControls() {
  const currentDate = useStore((s) => s.currentDate);
  const setDate = useStore((s) => s.setDate);

  const advanceDay = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  const advanceHours = (hours: number) => {
    const d = new Date(currentDate);
    d.setHours(d.getHours() + hours);
    setDate(d);
  };

  const advanceMinutes = (mins: number) => {
    const d = new Date(currentDate);
    d.setMinutes(d.getMinutes() + mins);
    setDate(d);
  };

  const setHour = (h: number) => {
    const d = new Date(currentDate);
    d.setHours(h, 0, 0, 0);
    setDate(d);
  };

  return { advanceDay, advanceHours, advanceMinutes, setHour };
}