import type { CSSProperties, ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export default function Card({ children, padding = '1.25rem', hover = false, style, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`card ${hover ? 'card-hover' : ''} ${className || ''}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}
