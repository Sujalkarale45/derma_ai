import type { CSSProperties } from 'react';

type BadgeVariant = 'default' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'verified' | 'high' | 'moderate' | 'low';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  style?: CSSProperties;
}

const variantClass: Record<BadgeVariant, string> = {
  default: '',
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  'no-show': 'badge-no-show',
  verified: 'badge-verified',
  high: 'badge-cancelled',
  moderate: 'badge-pending',
  low: 'badge-confirmed',
};

export default function Badge({ variant = 'default', children, dot = false, style }: BadgeProps) {
  return (
    <span
      className={variantClass[variant]}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.625rem',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {dot && (
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'currentColor',
          display: 'inline-block',
        }} />
      )}
      {children}
    </span>
  );
}
