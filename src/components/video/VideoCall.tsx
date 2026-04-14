import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import type { AIScan } from '../../types';
import { CLASS_INFO, RISK_COLORS } from '../../utils/classDescriptions';
import {
  PhoneOff, Mic, MicOff, Video, VideoOff,
  AlertTriangle, Copy, CheckCircle, Wifi, WifiOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoCallProps {
  roomId: string;          // patient's Peer ID (= room code)
  role: 'patient' | 'doctor';
  patientName?: string;
  doctorName?: string;
  scanResult?: AIScan | null;
  onEnd?: () => void;
}

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended' | 'error';

export default function VideoCall({
  roomId,
  role,
  patientName = 'Patient',
  doctorName = 'Doctor',
  scanResult,
  onEnd,
}: VideoCallProps) {
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef        = useRef<Peer | null>(null);
  const callRef        = useRef<MediaConnection | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);

  const [status, setStatus]       = useState<CallStatus>('idle');
  const [muted, setMuted]         = useState(false);
  const [camOff, setCamOff]       = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [copied, setCopied]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── helpers ── */
  const attachStream = (ref: React.RefObject<HTMLVideoElement | null>, stream: MediaStream) => {
    if (ref.current) {
      ref.current.srcObject = stream;
      ref.current.play().catch(() => {/* autoplay policy */});
    }
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* ── Get local camera stream ── */
  const getLocalStream = useCallback(async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    attachStream(localVideoRef, stream);
    return stream;
  }, []);

  /* ── End call cleanup ── */
  const endCall = useCallback(() => {
    callRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    peerRef.current?.destroy();
    stopTimer();
    setStatus('ended');
    onEnd?.();
  }, [onEnd, stopTimer]);

  /* ── PATIENT: create peer with fixed ID = roomId, then wait ── */
  const startPatientCall = useCallback(async () => {
    setStatus('connecting');
    try {
      const stream = await getLocalStream();

      const peer = new Peer(roomId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });
      peerRef.current = peer;

      peer.on('error', (err) => {
        // ID taken (already open in another tab) → destroy & retry once with suffix
        if (err.type === 'unavailable-id') {
          toast.error('Room code already in use. Regenerate and try again.');
        } else {
          toast.error('Peer error: ' + err.message);
        }
        setStatus('error');
      });

      // Doctor will call us
      peer.on('call', (incomingCall) => {
        callRef.current = incomingCall;
        incomingCall.answer(stream);
        incomingCall.on('stream', (remoteStream) => {
          attachStream(remoteVideoRef, remoteStream);
          setStatus('connected');
          startTimer();
        });
        incomingCall.on('close', endCall);
      });

      // Peer is open — we're ready and waiting
      peer.on('open', () => {
        setStatus('connecting'); // waiting for doctor
        toast.success('Ready! Share the room code with the doctor.');
      });

    } catch (err) {
      toast.error('Camera/mic access denied. Please allow permissions.');
      setStatus('error');
    }
  }, [roomId, getLocalStream, startTimer, endCall]);

  /* ── DOCTOR: connect to patient's peer ID = roomId ── */
  const startDoctorCall = useCallback(async () => {
    setStatus('connecting');
    try {
      const stream = await getLocalStream();

      const peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });
      peerRef.current = peer;

      peer.on('error', () => {
        toast.error('Could not connect. Check the room code and try again.');
        setStatus('error');
      });

      peer.on('open', () => {
        const call = peer.call(roomId, stream);
        callRef.current = call;

        call.on('stream', (remoteStream) => {
          attachStream(remoteVideoRef, remoteStream);
          setStatus('connected');
          startTimer();
          toast.success('Connected to patient!');
        });

        call.on('error', () => {
          toast.error('Call failed. Is the patient online?');
          setStatus('error');
        });

        call.on('close', endCall);
      });

    } catch (err) {
      toast.error('Camera/mic access denied. Please allow permissions.');
      setStatus('error');
    }
  }, [roomId, getLocalStream, startTimer, endCall]);

  /* ── Auto-start on mount ── */
  useEffect(() => {
    if (role === 'patient') startPatientCall();
    else startDoctorCall();

    return () => {
      callRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
      peerRef.current?.destroy();
      stopTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Toggle mic ── */
  const toggleMic = () => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach(t => { t.enabled = muted; });
    setMuted(m => !m);
  };

  /* ── Toggle camera ── */
  const toggleCam = () => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach(t => { t.enabled = camOff; });
    setCamOff(c => !c);
  };

  /* ── Copy room code ── */
  const copyCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Room code copied!');
    });
  };

  const remoteName = role === 'patient' ? doctorName : patientName;

  /* ── Status badge ── */
  const StatusBadge = () => {
    const cfg = {
      idle:       { label: 'Idle',        bg: 'var(--neutral)',       color: 'var(--text-muted)',   icon: <WifiOff size={12} /> },
      connecting: { label: role === 'patient' ? 'Waiting for doctor…' : 'Connecting…',
                                           bg: 'rgba(239,159,39,0.15)', color: 'var(--warning)',    icon: <Wifi size={12} /> },
      connected:  { label: `Connected · ${formatTime(elapsed)}`, bg: 'var(--accent)', color: 'var(--primary)', icon: <Wifi size={12} /> },
      ended:      { label: 'Call Ended',  bg: 'var(--danger-light)',  color: 'var(--danger)',       icon: <WifiOff size={12} /> },
      error:      { label: 'Error',       bg: 'var(--danger-light)',  color: 'var(--danger)',       icon: <WifiOff size={12} /> },
    }[status];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        background: cfg.bg, color: cfg.color,
        padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)', fontWeight: 600,
      }}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  /* ── AI scan card (shown to doctor) ── */
  const ScanCard = () => {
    if (!scanResult) return null;
    const info = CLASS_INFO[scanResult.predicted_class];
    const color = RISK_COLORS[scanResult.risk_level];
    return (
      <div style={{
        background: `${color}12`, border: `1.5px solid ${color}38`,
        borderRadius: 'var(--radius-md)', padding: '1rem',
        marginTop: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
          <AlertTriangle size={14} color={color} />
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color }}>
            Patient AI Scan Report
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
          {scanResult.image_url && (
            <img
              src={scanResult.image_url}
              alt="scan"
              style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div>
            <p style={{ fontWeight: 700, color, marginBottom: '0.25rem', fontSize: 'var(--font-size-sm)' }}>
              {info?.name ?? scanResult.predicted_class}
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Confidence: <strong>{(scanResult.confidence * 100).toFixed(1)}%</strong>
              &ensp;·&ensp;Risk: <strong style={{ color }}>{scanResult.risk_level.toUpperCase()}</strong>
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {info?.description?.slice(0, 120)}…
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--primary),var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Video size={18} color="white" />
          </div>
          <div>
            <h5 style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Live Consultation</h5>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
              with {remoteName}
            </p>
          </div>
        </div>
        <StatusBadge />
      </div>

      {/* ── Room code (patient only) ── */}
      {role === 'patient' && status !== 'ended' && (
        <div style={{
          background: 'var(--accent)', border: '1px solid rgba(29,158,117,0.3)',
          borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        }}>
          <div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Room Code — Share with Doctor
            </p>
            <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.25em', color: 'var(--primary)' }}>
              {roomId}
            </p>
          </div>
          <button
            onClick={copyCode}
            style={{
              background: copied ? 'var(--primary)' : 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.875rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: 'var(--font-size-xs)', fontWeight: 600,
              color: copied ? 'white' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* ── Video grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: status === 'connected' ? '1fr 1fr' : '1fr',
        gap: '0.875rem',
        minHeight: 220,
      }}>
        {/* Local video */}
        <div style={{ position: 'relative' }}>
          <video
            ref={localVideoRef}
            autoPlay muted playsInline
            style={{
              width: '100%', borderRadius: 'var(--radius-md)',
              background: '#111', objectFit: 'cover',
              minHeight: 200, display: 'block',
              border: '1px solid var(--border)',
              transform: 'scaleX(-1)', // mirror effect
            }}
          />
          <span style={{
            position: 'absolute', bottom: 8, left: 10,
            background: 'rgba(0,0,0,0.55)', color: 'white',
            fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
            borderRadius: 'var(--radius-full)', backdropFilter: 'blur(4px)',
          }}>
            You {camOff ? '(Cam off)' : ''}
          </span>
          {camOff && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)', borderRadius: 'var(--radius-md)',
            }}>
              <VideoOff size={32} color="rgba(255,255,255,0.5)" />
            </div>
          )}
        </div>

        {/* Remote video */}
        {status === 'connected' && (
          <div style={{ position: 'relative' }}>
            <video
              ref={remoteVideoRef}
              autoPlay playsInline
              style={{
                width: '100%', borderRadius: 'var(--radius-md)',
                background: '#111', objectFit: 'cover',
                minHeight: 200, display: 'block',
                border: '1px solid var(--border)',
              }}
            />
            <span style={{
              position: 'absolute', bottom: 8, left: 10,
              background: 'rgba(0,0,0,0.55)', color: 'white',
              fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
              borderRadius: 'var(--radius-full)', backdropFilter: 'blur(4px)',
            }}>
              {remoteName}
            </span>
          </div>
        )}

        {/* Waiting placeholder (patient waiting for doctor) */}
        {status === 'connecting' && role === 'patient' && (
          <div style={{
            background: 'var(--neutral)', borderRadius: 'var(--radius-md)',
            minHeight: 200, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            border: '1.5px dashed var(--border-strong)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '3px solid var(--primary)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Waiting for {doctorName}…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>

      {/* ── Call controls ── */}
      {status !== 'ended' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          padding: '0.75rem', background: 'var(--neutral)', borderRadius: 'var(--radius-md)',
        }}>
          {/* Mic */}
          <button
            onClick={toggleMic}
            title={muted ? 'Unmute' : 'Mute'}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: muted ? 'var(--danger-light)' : 'var(--bg-card)',
              border: `1.5px solid ${muted ? 'var(--danger)' : 'var(--border-strong)'}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            {muted ? <MicOff size={18} color="var(--danger)" /> : <Mic size={18} color="var(--text-secondary)" />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleCam}
            title={camOff ? 'Turn camera on' : 'Turn camera off'}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: camOff ? 'var(--danger-light)' : 'var(--bg-card)',
              border: `1.5px solid ${camOff ? 'var(--danger)' : 'var(--border-strong)'}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            {camOff ? <VideoOff size={18} color="var(--danger)" /> : <Video size={18} color="var(--text-secondary)" />}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            title="End call"
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--danger)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(226,75,74,0.35)',
              transition: 'all var(--transition-fast)',
              transform: 'scale(1)',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <PhoneOff size={20} color="white" />
          </button>
        </div>
      )}

      {/* ── Call ended banner ── */}
      {status === 'ended' && (
        <div style={{
          background: 'var(--danger-light)', border: '1px solid rgba(226,75,74,0.3)',
          borderRadius: 'var(--radius-md)', padding: '1rem',
          textAlign: 'center', animation: 'fadeInUp 0.3s ease',
        }}>
          <p style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: '0.25rem' }}>Call Ended</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Duration: {formatTime(elapsed)}
          </p>
        </div>
      )}

      {/* ── AI scan card (visible to both but most useful for doctor) ── */}
      {scanResult && status !== 'ended' && <ScanCard />}
    </div>
  );
}
