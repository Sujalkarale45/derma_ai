import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Users, Calendar, Scan, UserCheck, CheckCircle, X, Loader, Radio } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { subscribeToAllDoctors, approveDoctor, rejectDoctor } from '../../services/doctorProfileService';
import { countAllScans } from '../../services/scanService';
import { supabase, isConfigured } from '../../services/supabase';
import type { DoctorProfile } from '../../types';

// Illustrative trend chart — real historical aggregation out of scope
const LINE_DATA = [
  {month:'Oct',appointments:0,scans:0},{month:'Nov',appointments:0,scans:0},{month:'Dec',appointments:0,scans:0},
  {month:'Jan',appointments:0,scans:0},{month:'Feb',appointments:0,scans:0},{month:'Mar',appointments:0,scans:0},
  {month:'Apr',appointments:0,scans:0},
];
const PIE_DATA = [
  {name:'Melanoma (MEL)',value:18,color:'#E24B4A'},{name:'Nevi (NV)',value:35,color:'#1D9E75'},
  {name:'BKL',value:22,color:'#4ade80'},{name:'BCC',value:10,color:'#EF9F27'},
  {name:'AKIEC',value:8,color:'#f97316'},{name:'DF',value:4,color:'#8b5cf6'},{name:'VASC',value:3,color:'#06b6d4'},
];

interface AdminStats { totalUsers: number; totalDoctors: number; totalScans: number; totalAppointments: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalDoctors: 0, totalScans: 0, totalAppointments: 0 });
  const [pendingDoctors, setPendingDoctors] = useState<(DoctorProfile & { docRef: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubDoctorsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // ── Load Supabase counts once ─────────────────────────────────────────
    async function loadSupabaseStats(scanCount: number, verifiedCount: number) {
      let userCount = verifiedCount;
      let apptCount = 0;
      if (isConfigured) {
        const [usersRes, apptsRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('appointments').select('id', { count: 'exact', head: true }),
        ]);
        userCount = usersRes.count ?? verifiedCount;
        apptCount = apptsRes.count ?? 0;
      }
      setStats(prev => ({
        ...prev,
        totalUsers: userCount,
        totalAppointments: apptCount,
      }));
    }

    // ── Kick off scan count (one-shot) ────────────────────────────────────
    countAllScans()
      .then(scanCount => {
        setStats(prev => ({ ...prev, totalScans: scanCount }));
      })
      .catch(console.error);

    // ── Live Firestore subscription for all doctors ───────────────────────
    unsubDoctorsRef.current = subscribeToAllDoctors(allDocs => {
      const verified = allDocs.filter(d => d.verified);
      const pending  = allDocs.filter(d => !d.verified);

      setPendingDoctors(pending);
      setStats(prev => ({ ...prev, totalDoctors: verified.length }));

      // First emission: also load Supabase stats
      if (loading) {
        loadSupabaseStats(0, allDocs.length).catch(console.error);
        setLoading(false);
      }
    });

    return () => {
      unsubDoctorsRef.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(docRef: string, name: string) {
    try {
      await approveDoctor(docRef);
      setPendingDoctors(p => p.filter(d => d.docRef !== docRef));
      setStats(s => ({ ...s, totalDoctors: s.totalDoctors + 1 }));
      toast.success(`${name} approved and is now visible to patients!`);
    } catch {
      toast.error('Failed to approve doctor.');
    }
  }

  async function handleReject(docRef: string, name: string) {
    try {
      await rejectDoctor(docRef);
      setPendingDoctors(p => p.filter(d => d.docRef !== docRef));
      toast.error(`${name} registration rejected.`);
    } catch {
      toast.error('Failed to reject doctor.');
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Platform-wide overview for {format(new Date(), 'MMMM yyyy')}</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Total Users"       value={loading ? '…' : String(stats.totalUsers)}       icon={<Users size={20} color="var(--primary)" />}  iconBg="var(--accent)" />
        <StatCard title="Verified Doctors"  value={loading ? '…' : String(stats.totalDoctors)}      icon={<UserCheck size={20} color="var(--primary)" />} iconBg="var(--accent)" />
        <StatCard title="Total AI Scans"    value={loading ? '…' : String(stats.totalScans)}        icon={<Scan size={20} color="var(--warning)" />}  iconBg="var(--warning-light)" />
        <StatCard title="Appointments"      value={loading ? '…' : String(stats.totalAppointments)} icon={<Calendar size={20} color="var(--primary)" />} iconBg="var(--accent)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <h5 style={{ marginBottom: '0.5rem' }}>Appointments &amp; Scans Over Time</h5>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Historical aggregation will populate as the platform grows
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={LINE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="appointments" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} name="Appointments" />
              <Line type="monotone" dataKey="scans" stroke="var(--warning)" strokeWidth={2.5} dot={{ r: 4 }} name="AI Scans" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h5 style={{ marginBottom: '1.25rem' }}>Scan Class Distribution</h5>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name">
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
            {PIE_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending Doctor Approvals */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h5 style={{ margin: 0 }}>Pending Doctor Approvals</h5>
            {/* Realtime LIVE indicator */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(29,158,117,0.1)', color: 'var(--primary)',
              border: '0.5px solid rgba(29,158,117,0.3)',
              borderRadius: 'var(--radius-full)', padding: '0.15rem 0.5rem',
              fontSize: '0.68rem', fontWeight: 700,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--primary)', display: 'inline-block',
                animation: 'livePulse 1.5s ease-in-out infinite',
              }} />
              LIVE
            </span>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)' }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 'var(--font-size-xs)' }}>Connecting…</span>
            </div>
          ) : (
            <Badge variant={pendingDoctors.length > 0 ? 'pending' : 'confirmed'} dot>
              {pendingDoctors.length} pending
            </Badge>
          )}
        </div>

        {!loading && pendingDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
            <p>No pending approvals — all caught up!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                  {['Doctor', 'Specialisation', 'Reg. Number', 'City', 'Applied', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.625rem 0.75rem', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingDoctors.map(doc => (
                  <tr key={doc.docRef} style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <td style={{ padding: '0.875rem 0.75rem', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{doc.name}</td>
                    <td style={{ padding: '0.875rem 0.75rem', fontSize: 'var(--font-size-sm)', color: 'var(--primary)' }}>{doc.specialisation}</td>
                    <td style={{ padding: '0.875rem 0.75rem', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{doc.reg_number || '—'}</td>
                    <td style={{ padding: '0.875rem 0.75rem', fontSize: 'var(--font-size-sm)' }}>{doc.city || '—'}</td>
                    <td style={{ padding: '0.875rem 0.75rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {format(new Date(doc.created_at), 'dd MMM yyyy')}
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <Button size="sm" icon={<CheckCircle size={12} />} onClick={() => handleApprove(doc.docRef, doc.name)}>Approve</Button>
                        <Button size="sm" variant="danger" icon={<X size={12} />} onClick={() => handleReject(doc.docRef, doc.name)}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
