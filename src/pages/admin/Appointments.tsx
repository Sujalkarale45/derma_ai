import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import type { AppointmentStatus } from '../../types';

const ALL = [
  {id:'a1',patient:'Riya Sharma',doctor:'Dr. Rajesh Kulkarni',slot:'2026-04-16T10:00:00',status:'confirmed' as AppointmentStatus},
  {id:'a2',patient:'Ramesh Jadhav',doctor:'Dr. Sunita Joshi',slot:'2026-04-16T11:30:00',status:'pending' as AppointmentStatus},
  {id:'a3',patient:'Kavitha Nair',doctor:'Dr. Priyanka Desai',slot:'2026-04-14T14:00:00',status:'completed' as AppointmentStatus},
  {id:'a4',patient:'Sunil Patil',doctor:'Dr. Amol Patil',slot:'2026-04-10T15:00:00',status:'no-show' as AppointmentStatus},
  {id:'a5',patient:'Anita Pawar',doctor:'Dr. Rajesh Kulkarni',slot:'2026-04-22T09:00:00',status:'confirmed' as AppointmentStatus},
];

export default function AdminAppointments() {
  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>All Appointments</h2>
        <p style={{color:'var(--text-muted)'}}>Platform-wide appointment history and management</p>
      </div>
      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--neutral)',borderBottom:'0.5px solid var(--border)'}}>
                {['Patient','Doctor','Date & Time','Status'].map(h => (
                  <th key={h} style={{textAlign:'left',padding:'0.75rem 1rem',fontSize:'var(--font-size-xs)',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-muted)',fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL.map(a => (
                <tr key={a.id} style={{borderBottom:'0.5px solid var(--border)'}}>
                  <td style={{padding:'1rem',fontWeight:600,fontSize:'var(--font-size-sm)'}}>{a.patient}</td>
                  <td style={{padding:'1rem',fontSize:'var(--font-size-sm)',color:'var(--primary)'}}>{a.doctor}</td>
                  <td style={{padding:'1rem',fontSize:'var(--font-size-sm)',color:'var(--text-muted)',whiteSpace:'nowrap'}}>
                    {format(new Date(a.slot),'dd MMM yyyy · hh:mm a')}
                  </td>
                  <td style={{padding:'1rem'}}><Badge variant={a.status} dot>{a.status.replace('-',' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
