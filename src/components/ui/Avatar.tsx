interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  style?: React.CSSProperties;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function colorFromName(name: string) {
  const colors = ['#1D9E75', '#085041', '#0077b6', '#7b2d8b', '#e76f51', '#2a9d8f'];
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ name = 'User', src, size = 36, style }: AvatarProps) {
  return src ? (
    <img
      src={src}
      alt={name}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1.5px solid var(--border)',
        flexShrink: 0,
        ...style,
      }}
    />
  ) : (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: colorFromName(name),
      color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36,
      fontWeight: 700,
      fontFamily: 'var(--font-sans)',
      flexShrink: 0,
      userSelect: 'none',
      ...style,
    }}>
      {getInitials(name)}
    </div>
  );
}
