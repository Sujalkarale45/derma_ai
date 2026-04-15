import { format } from 'date-fns';
import { Users, Calendar, Scan, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

const TODAY_SCHEDULE = [
  { id:'a1', time:'10:00', patient:'Riya Sharma', type:'Follow-up', status:'confirmed' as const },
  { id:'a2', time:'11:30', patient:'Ramesh Jadhav', type:'First Visit', status:'confirmed' as const },
  { id:'a3', time:'14:00', patient:'Kavitha Nair', type:'AI Review', status:'pending' as const },
  { id:'a4', time:'15:30', patient:'Sunil Patil', type:'Consultation', status:'confirmed' as const },
];

const AI_QUEUE = [
  { id:'s1', patient:'Riya Sharma', predictedClass:'mel', confidence:0.62, image:'https://picsum.photos/seed/sq1/60/60', submittedAt:'2026-04-13T18:00:00' },
  { id:'s2', patient:'Sonal Kulkarni', predictedClass:'bcc', confidence:0.78, image:'https://picsum.photos/seed/sq2/60/60', submittedAt:'2026-04-14T08:00:00' },
];

const RISK_COLORS: Record<string,string> = { mel:'var(--danger)', bcc:'var(--danger)', akiec:'var(--warning)', bkl:'var(--primary)', df:'var(--primary)', nv:'var(--primary)', vasc:'var(--warning)' };

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const today = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <div>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, var(--secondary), var(--primary))', borderRadius:'var(--radius-lg)', padding:'1.75rem 2rem', marginBottom:'1.75rem', color:'white', position:'relative', overflow:'hidden' }}>
        <div style={{position:'absolute',right:'-20px',top:'-20px',width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}} />
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <Avatar name={user?.name||''} src={user?.avatar_url} size={52} />
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <h3 style={{color:'white',margin:0}}>{user?.name}</h3>
              <ShieldCheck size={18} color="#6befc0" />
            </div>
            <p style={{color:'rgba(255,255,255,0.7)',fontSize:'var(--font-size-sm)'}}>Verified Dermatologist · {today}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'1rem', marginBottom:'1.75rem' }}>
        <StatCard title="Today's Appointments" value={TODAY_SCHEDULE.length} icon={<Calendar size={20} color="var(--primary)"/>} iconBg="var(--accent)" trend={20} trendLabel="vs yesterday"/>
        <StatCard title="Pending AI Reviews" value={AI_QUEUE.length} icon={<Scan size={20} color="var(--warning)"/>} iconBg="var(--warning-light)" subtitle="Need your attention"/>
        <StatCard title="Total Patients" value="48" icon={<Users size={20} color="var(--primary)"/>} iconBg="var(--accent)" trend={8} trendLabel="this month"/>
      </div>

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>

        {/* Today schedule */}
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h5>Today's Schedule</h5>
            <Link to="/doctor/appointments" style={{fontSize:'var(--font-size-xs)',color:'var(--primary)',display:'flex',alignItems:'center',gap:'0.25rem'}}>
              Full Calendar <ArrowRight size={12}/>
            </Link>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.625rem'}}>
            {TODAY_SCHEDULE.map(appt => (
              <div key={appt.id} style={{display:'flex',gap:'0.75rem',padding:'0.75rem',background:'var(--neutral)',borderRadius:'var(--radius-sm)',alignItems:'center'}}>
                <div style={{width:42,height:42,borderRadius:'var(--radius-sm)',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Clock size={16} color="var(--primary)"/>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:600,fontSize:'var(--font-size-sm)',color:'var(--text-primary)'}}>{appt.patient}</p>
                  <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>{appt.time} · {appt.type}</p>
                </div>
                <Badge variant={appt.status} dot>{appt.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Scan queue */}
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h5>AI Scan Review Queue</h5>
            <span style={{fontSize:'var(--font-size-xs)',background:'var(--danger-light)',color:'var(--danger)',padding:'2px 8px',borderRadius:'var(--radius-full)',fontWeight:700}}>{AI_QUEUE.length} pending</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {AI_QUEUE.map(scan => (
              <div key={scan.id} style={{display:'flex',gap:'0.75rem',padding:'0.875rem',background:'var(--danger-light)',borderRadius:'var(--radius-sm)',alignItems:'center',border:'0.5px solid rgba(226,75,74,0.2)'}}>
                <img src={scan.image} alt="scan" style={{width:48,height:48,borderRadius:'var(--radius-sm)',objectFit:'cover',flexShrink:0}}/>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:'var(--font-size-sm)',color:'var(--text-primary)'}}>{scan.patient}</p>
                  <p style={{fontSize:'var(--font-size-xs)',fontWeight:600,color:RISK_COLORS[scan.predictedClass]}}>
                    {scan.predictedClass.toUpperCase()} · {(scan.confidence*100).toFixed(0)}% confidence
                  </p>
                  <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>{format(new Date(scan.submittedAt),'dd MMM · hh:mm a')}</p>
                </div>
                <Link to="/doctor/patient/p-001">
                  <button style={{padding:'0.375rem 0.625rem',border:'none',background:'var(--danger)',color:'white',borderRadius:'var(--radius-sm)',cursor:'pointer',fontSize:'var(--font-size-xs)',fontWeight:700}}>
                    Review
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
