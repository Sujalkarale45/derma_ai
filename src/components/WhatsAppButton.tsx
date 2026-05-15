import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

const WA_NUMBER = '917499919976'; // country code + number
const WA_MESSAGE = encodeURIComponent(
  'Hi! I have a question about DERMA AI. Can you help me?'
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      {/* ── Tooltip Card ──────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.5rem',
            zIndex: 9999,
            width: 300,
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: '0.5px solid var(--border)',
            overflow: 'hidden',
            animation: 'fadeInUp 0.22s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#25D366',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {/* WhatsApp SVG logo */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#25D366" />
              <path
                d="M23.472 8.516A10.42 10.42 0 0 0 16.02 5.6C10.784 5.6 6.52 9.864 6.52 15.1c0 1.68.44 3.32 1.28 4.76L6.4 26.4l6.72-1.76a10.56 10.56 0 0 0 4.9 1.24h.004c5.236 0 9.496-4.264 9.496-9.5a9.44 9.44 0 0 0-4.048-7.868Zm-7.452 14.62h-.004a8.776 8.776 0 0 1-4.472-1.224l-.32-.192-3.328.872.888-3.244-.208-.332a8.7 8.7 0 0 1-1.336-4.716c0-4.8 3.908-8.708 8.712-8.708a8.66 8.66 0 0 1 6.16 2.552 8.65 8.65 0 0 1 2.548 6.16c-.004 4.804-3.912 8.832-8.64 8.832Zm4.772-6.528c-.26-.132-1.548-.764-1.788-.852-.24-.088-.416-.132-.592.132-.176.26-.684.852-.836 1.028-.152.18-.308.2-.568.068-.26-.132-1.1-.404-2.096-1.292-.776-.692-1.3-1.544-1.452-1.804-.152-.26-.016-.4.116-.528.12-.116.26-.304.392-.456.132-.152.176-.26.264-.432.088-.176.044-.328-.02-.46-.068-.132-.592-1.428-.812-1.956-.212-.512-.428-.444-.592-.452-.152-.008-.328-.008-.504-.008a.97.97 0 0 0-.7.328c-.24.26-.916.896-.916 2.184 0 1.288.94 2.532 1.072 2.708.132.176 1.848 2.824 4.476 3.96.628.272 1.116.432 1.496.556.628.2 1.2.172 1.652.104.504-.076 1.548-.632 1.768-1.244.22-.612.22-1.136.152-1.244-.064-.112-.24-.176-.5-.308Z"
                fill="white"
              />
            </svg>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>
                DERMA AI Support
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem', margin: 0 }}>
                Typically replies within minutes
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 'auto',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={14} color="white" />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.25rem' }}>
            <div
              style={{
                background: 'var(--neutral)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.875rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                borderLeft: '3px solid #25D366',
              }}
            >
              👋 Hi there! Have questions about skin scans, appointments, or how DERMA AI works?
              Chat with us on WhatsApp!
            </div>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: '#25D366',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                transition: 'background 0.15s',
                boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1ebd5a')}
              onMouseLeave={e => (e.currentTarget.style.background = '#25D366')}
            >
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path
                  d="M23.472 8.516A10.42 10.42 0 0 0 16.02 5.6C10.784 5.6 6.52 9.864 6.52 15.1c0 1.68.44 3.32 1.28 4.76L6.4 26.4l6.72-1.76a10.56 10.56 0 0 0 4.9 1.24h.004c5.236 0 9.496-4.264 9.496-9.5a9.44 9.44 0 0 0-4.048-7.868Zm-7.452 14.62h-.004a8.776 8.776 0 0 1-4.472-1.224l-.32-.192-3.328.872.888-3.244-.208-.332a8.7 8.7 0 0 1-1.336-4.716c0-4.8 3.908-8.708 8.712-8.708a8.66 8.66 0 0 1 6.16 2.552 8.65 8.65 0 0 1 2.548 6.16c-.004 4.804-3.912 8.832-8.64 8.832Zm4.772-6.528c-.26-.132-1.548-.764-1.788-.852-.24-.088-.416-.132-.592.132-.176.26-.684.852-.836 1.028-.152.18-.308.2-.568.068-.26-.132-1.1-.404-2.096-1.292-.776-.692-1.3-1.544-1.452-1.804-.152-.26-.016-.4.116-.528.12-.116.26-.304.392-.456.132-.152.176-.26.264-.432.088-.176.044-.328-.02-.46-.068-.132-.592-1.428-.812-1.956-.212-.512-.428-.444-.592-.452-.152-.008-.328-.008-.504-.008a.97.97 0 0 0-.7.328c-.24.26-.916.896-.916 2.184 0 1.288.94 2.532 1.072 2.708.132.176 1.848 2.824 4.476 3.96.628.272 1.116.432 1.496.556.628.2 1.2.172 1.652.104.504-.076 1.548-.632 1.768-1.244.22-.612.22-1.136.152-1.244-.064-.112-.24-.176-.5-.308Z"
                  fill="white"
                />
              </svg>
              Chat on WhatsApp
            </a>

            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.625rem' }}>
              +91 74999 19976 · Available Mon–Sat, 9am–6pm IST
            </p>
          </div>
        </div>
      )}

      {/* ── Floating Button ───────────────────────────────────────────── */}
      <button
        id="whatsapp-support-btn"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Chat with us on WhatsApp"
        aria-label="Open WhatsApp chat"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9998,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#25D366',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hovered
            ? '0 8px 28px rgba(37,211,102,0.55)'
            : '0 4px 16px rgba(37,211,102,0.4)',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        {open ? (
          <MessageCircle size={26} color="white" fill="white" />
        ) : (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path
              d="M23.472 8.516A10.42 10.42 0 0 0 16.02 5.6C10.784 5.6 6.52 9.864 6.52 15.1c0 1.68.44 3.32 1.28 4.76L6.4 26.4l6.72-1.76a10.56 10.56 0 0 0 4.9 1.24h.004c5.236 0 9.496-4.264 9.496-9.5a9.44 9.44 0 0 0-4.048-7.868Zm-7.452 14.62h-.004a8.776 8.776 0 0 1-4.472-1.224l-.32-.192-3.328.872.888-3.244-.208-.332a8.7 8.7 0 0 1-1.336-4.716c0-4.8 3.908-8.708 8.712-8.708a8.66 8.66 0 0 1 6.16 2.552 8.65 8.65 0 0 1 2.548 6.16c-.004 4.804-3.912 8.832-8.64 8.832Zm4.772-6.528c-.26-.132-1.548-.764-1.788-.852-.24-.088-.416-.132-.592.132-.176.26-.684.852-.836 1.028-.152.18-.308.2-.568.068-.26-.132-1.1-.404-2.096-1.292-.776-.692-1.3-1.544-1.452-1.804-.152-.26-.016-.4.116-.528.12-.116.26-.304.392-.456.132-.152.176-.26.264-.432.088-.176.044-.328-.02-.46-.068-.132-.592-1.428-.812-1.956-.212-.512-.428-.444-.592-.452-.152-.008-.328-.008-.504-.008a.97.97 0 0 0-.7.328c-.24.26-.916.896-.916 2.184 0 1.288.94 2.532 1.072 2.708.132.176 1.848 2.824 4.476 3.96.628.272 1.116.432 1.496.556.628.2 1.2.172 1.652.104.504-.076 1.548-.632 1.768-1.244.22-.612.22-1.136.152-1.244-.064-.112-.24-.176-.5-.308Z"
              fill="white"
            />
          </svg>
        )}

        {/* Pulse ring animation */}
        {!open && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid #25D366',
              animation: 'waPulse 2s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </button>

      {/* ── Keyframe styles ───────────────────────────────────────────── */}
      <style>{`
        @keyframes waPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
