import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    boxShadow: 'var(--shadow-primary)',
  },
  secondary: {
    background: 'var(--accent)',
    color: 'var(--primary)',
    border: '1px solid transparent',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '0.5px solid var(--border)',
  },
  danger: {
    background: 'var(--danger)',
    color: 'white',
    border: 'none',
  },
  warning: {
    background: 'var(--warning)',
    color: 'white',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: 'var(--primary)',
    border: '1.5px solid var(--primary)',
  },
};

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { padding: '0.375rem 0.75rem', fontSize: 'var(--font-size-xs)', gap: '0.375rem' },
  md: { padding: '0.5rem 1.125rem', fontSize: 'var(--font-size-sm)', gap: '0.5rem' },
  lg: { padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-base)', gap: '0.625rem' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      {loading ? (
        <span style={{
          width: 14, height: 14, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : icon}
      <span>{loading ? 'Loading...' : children}</span>
      {!loading && iconRight}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
