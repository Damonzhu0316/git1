import { useEffect, useRef, useState } from 'react';

interface AnimatedValueProps {
  value: string | number;
  className?: string;
  flashOnChange?: boolean;
}

export default function AnimatedValue({ value, className = '', flashOnChange = true }: AnimatedValueProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flashing, setFlashing] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (String(prevValue.current) !== String(value)) {
      prevValue.current = value;
      setDisplayValue(value);
      if (flashOnChange) {
        setFlashing(true);
        const timer = setTimeout(() => setFlashing(false), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [value, flashOnChange]);

  return (
    <span className={`${className} ${flashing ? 'animate-value-flash' : ''}`}>
      {displayValue}
    </span>
  );
}