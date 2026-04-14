import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import Card from '../../components/ui/Card';

const MONTHLY = [
  {month:'Oct',scans:45,appointments:32,patients:28},{month:'Nov',scans:62,appointments:48,patients:39},
  {month:'Dec',scans:55,appointments:41,patients:35},{month:'Jan',scans:89,appointments:67,patients:56},
  {month:'Feb',scans:120,appointments:85,patients:72},{month:'Mar',scans:145,appointments:102,patients:89},{month:'Apr',scans:134,appointments:89,patients:76},
];

const CLASS_DIST = [
  {cls:'MEL',count:240,fill:'#E24B4A'},{cls:'NV',count:470,fill:'#1D9E75'},
  {cls:'BKL',count:295,fill:'#4ade80'},{cls:'BCC',count:134,fill:'#EF9F27'},
  {cls:'AKIEC',count:107,fill:'#f97316'},{cls:'DF',count:54,fill:'#8b5cf6'},{cls:'VASC',count:40,fill:'#06b6d4'},
];

const CITY_DATA = [
  {city:'Pune',patients:1240},{city:'Mumbai',patients:980},{city:'Nagpur',patients:540},
  {city:'Aurangabad',patients:320},{city:'Nashik',patients:280},{city:'Satara',patients:190},
];

export default function Analytics() {
  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>Analytics</h2>
        <p style={{color:'var(--text-muted)'}}>Platform-wide usage statistics and AI model insights</p>
      </div>

      {/* Growth chart */}
      <Card style={{marginBottom:'1.5rem'}}>
        <h5 style={{marginBottom:'1.25rem'}}>Monthly Platform Growth</h5>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={MONTHLY}>
            <defs>
              <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="month" tick={{fontSize:12,fill:'var(--text-muted)'}}/>
            <YAxis tick={{fontSize:12,fill:'var(--text-muted)'}}/>
            <Tooltip contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:12}}/>
            <Legend/>
            <Area type="monotone" dataKey="scans" stroke="var(--primary)" fill="url(#scansGrad)" strokeWidth={2.5} name="AI Scans"/>
            <Area type="monotone" dataKey="appointments" stroke="var(--warning)" fill="url(#apptGrad)" strokeWidth={2.5} name="Appointments"/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
        {/* Scan classes */}
        <Card>
          <h5 style={{marginBottom:'1.25rem'}}>AI Scans by Diagnosis Class</h5>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CLASS_DIST} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis type="number" tick={{fontSize:11,fill:'var(--text-muted)'}}/>
              <YAxis type="category" dataKey="cls" tick={{fontSize:11,fill:'var(--text-muted)'}} width={40}/>
              <Tooltip contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:12}}/>
              <Bar dataKey="count" name="Scans" radius={[0,4,4,0]}>
                {CLASS_DIST.map((entry,i) => (
                  <rect key={i} fill={entry.fill}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* City distribution */}
        <Card>
          <h5 style={{marginBottom:'1.25rem'}}>Patients by City</h5>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="city" tick={{fontSize:11,fill:'var(--text-muted)'}}/>
              <YAxis tick={{fontSize:11,fill:'var(--text-muted)'}}/>
              <Tooltip contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:12}}/>
              <Bar dataKey="patients" fill="var(--primary)" radius={[4,4,0,0]} name="Patients"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
