import { format } from 'date-fns';
import { Users, Calendar, Scan, UserCheck, CheckCircle, X, TrendingUp } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const LINE_DATA = [
  {month:'Oct',appointments:32,scans:45},{month:'Nov',appointments:48,scans:62},{month:'Dec',appointments:41,scans:55},
  {month:'Jan',appointments:67,scans:89},{month:'Feb',appointments:85,scans:120},{month:'Mar',appointments:102,scans:145},{month:'Apr',appointments:89,scans:134},
];

const PIE_DATA = [
  {name:'Melanoma (MEL)',value:18,color:'#E24B4A'},{name:'Nevi (NV)',value:35,color:'#1D9E75'},
  {name:'BKL',value:22,color:'#4ade80'},{name:'BCC',value:10,color:'#EF9F27'},
  {name:'AKIEC',value:8,color:'#f97316'},{name:'DF',value:4,color:'#8b5cf6'},{name:'VASC',value:3,color:'#06b6d4'},
];

const PENDING_APPROVALS = [
  {id:'doc-pending-1', name:'Dr. Arjun Mehta', reg_number:'MH-DRM-22890', city:'Aurangabad', applied_at:'2026-04-12T08:00:00'},
  {id:'doc-pending-2', name:'Dr. Lalitha Reddy', reg_number:'KA-DRM-19234', city:'Pune', applied_at:'2026-04-13T14:00:00'},
];

export default function AdminDashboard() {
  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>Admin Dashboard</h2>
        <p style={{color:'var(--text-muted)'}}>Platform-wide overview and analytics for {format(new Date(),'MMMM yyyy')}</p>
      </div>

      {/* KPI Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        <StatCard title="Total Users" value="4,977" icon={<Users size={20} color="var(--primary)"/>} iconBg="var(--accent)" trend={12} trendLabel="this month"/>
        <StatCard title="Total Doctors" value="127" icon={<UserCheck size={20} color="var(--primary)"/>} iconBg="var(--accent)" trend={8} trendLabel="this month"/>
        <StatCard title="Scans This Month" value="1,340" icon={<Scan size={20} color="var(--warning)"/>} iconBg="var(--warning-light)" trend={21} trendLabel="vs last month"/>
        <StatCard title="Appointments" value="892" icon={<Calendar size={20} color="var(--primary)"/>} iconBg="var(--accent)" trend={15} trendLabel="this month"/>
      </div>

      {/* Charts Row */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.5rem',marginBottom:'2rem'}}>
        <Card>
          <h5 style={{marginBottom:'1.25rem'}}>Appointments & Scans Over Time</h5>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={LINE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" tick={{fontSize:12,fill:'var(--text-muted)'}}/>
              <YAxis tick={{fontSize:12,fill:'var(--text-muted)'}}/>
              <Tooltip contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:12}}/>
              <Legend/>
              <Line type="monotone" dataKey="appointments" stroke="var(--primary)" strokeWidth={2.5} dot={{r:4}} name="Appointments"/>
              <Line type="monotone" dataKey="scans" stroke="var(--warning)" strokeWidth={2.5} dot={{r:4}} name="AI Scans"/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h5 style={{marginBottom:'1.25rem'}}>Scan Distribution by Class</h5>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                {PIE_DATA.map((entry,i) => <Cell key={i} fill={entry.color}/>)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`,'Share']} contentStyle={{fontSize:11,borderRadius:8}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexWrap:'wrap',gap:'0.375rem',marginTop:'0.5rem'}}>
            {PIE_DATA.map(d => (
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:'0.25rem'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:d.color,flexShrink:0}}/>
                <span style={{fontSize:'0.65rem',color:'var(--text-muted)'}}>{d.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending Doctor Approvals */}
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h5>Pending Doctor Approvals</h5>
          <Badge variant="pending" dot>{PENDING_APPROVALS.length} pending</Badge>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'0.5px solid var(--border)'}}>
                {['Doctor','Reg. Number','City','Applied','Actions'].map(h => (
                  <th key={h} style={{textAlign:'left',padding:'0.625rem 0.75rem',fontSize:'var(--font-size-xs)',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-muted)',fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PENDING_APPROVALS.map(doc => (
                <tr key={doc.id} style={{borderBottom:'0.5px solid var(--border)'}}>
                  <td style={{padding:'0.875rem 0.75rem',fontWeight:600,fontSize:'var(--font-size-sm)'}}>{doc.name}</td>
                  <td style={{padding:'0.875rem 0.75rem',color:'var(--text-muted)',fontSize:'var(--font-size-sm)'}}>{doc.reg_number}</td>
                  <td style={{padding:'0.875rem 0.75rem',fontSize:'var(--font-size-sm)'}}>{doc.city}</td>
                  <td style={{padding:'0.875rem 0.75rem',fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>{format(new Date(doc.applied_at),'dd MMM yyyy')}</td>
                  <td style={{padding:'0.875rem 0.75rem'}}>
                    <div style={{display:'flex',gap:'0.375rem'}}>
                      <Button size="sm" icon={<CheckCircle size={12}/>} onClick={() => toast.success(`${doc.name} approved!`)}>Approve</Button>
                      <Button size="sm" variant="danger" icon={<X size={12}/>} onClick={() => toast.error(`${doc.name} rejected.`)}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
