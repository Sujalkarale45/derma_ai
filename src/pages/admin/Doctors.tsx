import { useState, useEffect } from 'react';
import { CheckCircle, X, Loader, UserX, Wifi } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';
import { subscribeToAllDoctors, approveDoctor, rejectDoctor } from '../../services/doctorProfileService';
import type { DoctorProfile } from '../../types';

type DoctorRow = DoctorProfile & { docRef: string };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending'>('pending');
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  useEffect(() => {
    // Real-time Firestore listener — updates instantly when admin approves/rejects
    const unsub = subscribeToAllDoctors(docs => {
      setDoctors(docs);
      setLoading(false);
    });
    return unsub; // cleanup on unmount
  }, []);

  async function approve(docRef: string, name: string) {
    setApproving(docRef);
    try {
      await approveDoctor(docRef);
      // State updates automatically via onSnapshot — no manual setState needed
      toast.success(`✅ ${name} approved! Now visible to patients.`);
    } catch {
      toast.error('Failed to approve. Check Firestore permissions.');
    } finally {
      setApproving(null);
    }
  }

  async function reject(docRef: string, name: string) {
    setRejecting(docRef);
    try {
      await rejectDoctor(docRef);
      toast.error(`${name} registration rejected.`);
    } catch {
      toast.error('Failed to reject. Check Firestore permissions.');
    } finally {
      setRejecting(null);
    }
  }

  const filtered = tab === 'pending' ? doctors.filter(d => !d.verified) : doctors;
  const pendingCount = doctors.filter(d => !d.verified).length;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <h2 style={{ margin: 0 }}>Doctor Management</h2>
            {/* LIVE indicator */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              background: 'rgba(29,158,117,0.12)', color: 'var(--primary)',
              border: '0.5px solid rgba(29,158,117,0.3)',
              borderRadius: 'var(--radius-full)', padding: '0.2rem 0.625rem',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--primary)',
                display: 'inline-block',
                animation: 'livePulse 1.5s ease-in-out infinite',
              }} />
              LIVE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Approve registrations and manage verified dermatologists
          </p>
        </div>

        {pendingCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(245,158,11,0.1)', border: '0.5px solid rgba(245,158,11,0.3)',
            borderRadius: 'var(--radius-sm)', padding: '0.625rem 1rem',
          }}>
            <Wifi size={15} color="var(--warning)" />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--warning)' }}>
              {pendingCount} pending review{pendingCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
        {[
          { value: 'pending', label: `Pending (${pendingCount})` },
          { value: 'all',     label: `All Doctors (${doctors.length})` },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setTab(value as 'all' | 'pending')} style={{
            padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
            background: tab === value ? 'var(--primary)' : 'var(--bg-card)',
            color: tab === value ? 'white' : 'var(--text-secondary)',
            fontWeight: tab === value ? 600 : 500,
            fontSize: 'var(--font-size-sm)',
            transition: 'all var(--transition-fast)',
            position: 'relative',
          }}>
            {label}
            {value === 'pending' && pendingCount > 0 && tab !== 'pending' && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--warning)', display: 'block',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)' }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Connecting to live feed…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <UserX size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, marginBottom: '0.375rem' }}>
              {tab === 'pending' ? 'No pending approvals' : 'No doctors registered yet'}
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              {tab === 'pending'
                ? 'All doctors have been reviewed. New registrations appear here instantly.'
                : 'Doctors will appear here after they register through the website.'}
            </p>
          </div>
        </Card>
      )}

      {/* Doctor list */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(doc => (
            <Card key={doc.docRef} style={{
              padding: '1.25rem',
              border: !doc.verified
                ? '0.5px solid rgba(245,158,11,0.5)'
                : '0.5px solid var(--border)',
              transition: 'border-color 0.4s ease',
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Avatar name={doc.name} size={48} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <h5 style={{ fontSize: 'var(--font-size-base)', margin: 0 }}>{doc.name}</h5>
                    {doc.verified
                      ? <Badge variant="verified" dot>Verified</Badge>
                      : <Badge variant="pending" dot>Pending Review</Badge>}
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    {doc.specialisation || 'General Dermatology'}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {doc.reg_number ? `Reg: ${doc.reg_number} · ` : ''}
                    {doc.hospital ? `${doc.hospital}, ` : ''}
                    {doc.city ? `${doc.city}` : ''}
                    {doc.state ? `, ${doc.state}` : ''}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {doc.email} · Registered: {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {!doc.verified && (
                    <>
                      <Button
                        size="sm"
                        icon={<CheckCircle size={13} />}
                        loading={approving === doc.docRef}
                        onClick={() => approve(doc.docRef, doc.name)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<X size={13} />}
                        loading={rejecting === doc.docRef}
                        onClick={() => reject(doc.docRef, doc.name)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {doc.verified && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      fontSize: '0.75rem', fontWeight: 600,
                      color: 'var(--primary)', background: 'var(--accent)',
                      padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                    }}>
                      <CheckCircle size={12} /> Active
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
