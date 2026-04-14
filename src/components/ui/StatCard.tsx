import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  trend?: number; // positive = up, negative = down, 0 = flat
  trendLabel?: string;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, iconBg = 'var(--accent)', trend, trendLabel, subtitle }: StatCardProps) {
  const trendColor = trend == null ? '' : trend > 0 ? 'var(--primary)' : trend < 0 ? 'var(--danger)' : 'var(--text-muted)';
  const TrendIcon = trend == null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
            {title}
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}
          </p>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-sm)',
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {(trend != null || subtitle) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {TrendIcon && <TrendIcon size={13} color={trendColor} />}
          {trend != null && (
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: trendColor }}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          {trendLabel && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {trendLabel}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
