import React from 'react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  variant?: 'default' | 'accent' | 'gold';
  className?: string;
  title?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  active = false,
  variant = 'default',
  className = '',
  title,
}) => {
  const base =
    'rounded-lg px-3 py-2 text-sm transition-all duration-150 backdrop-blur-md border flex items-center gap-1.5 whitespace-nowrap ripple-btn active:scale-[0.97]';

  const variantStyles: Record<string, string> = {
    default: 'bg-white/5 hover:bg-white/15 border-white/10 text-white/80 hover:text-white',
    accent: 'bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border-[#00d4ff]/30 text-[#00d4ff] hover:text-[#00d4ff]',
    gold: 'bg-[#f0c060]/10 hover:bg-[#f0c060]/20 border-[#f0c060]/30 text-[#f0c060] hover:text-[#f0c060]',
  };

  const activeOverlay = active
    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
    : '';

  const disabledStyles = onClick ? '' : 'opacity-40 cursor-not-allowed';

  const combined = [base, variantStyles[variant] ?? variantStyles.default, activeOverlay, disabledStyles, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={combined} onClick={onClick} title={title}>
      {children}
    </button>
  );
};

export default GlassButton;