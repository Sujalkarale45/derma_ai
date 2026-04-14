import { format, isAfter } from 'date-fns';
import { Video, User, CheckCircle, X, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import type { AppointmentStatus } from '../../types';
import toast from 'react-hot-toast';

const MOCK = [
  { id:'a1', patient_name:'Priya Sharma', patient_id:'p-001', slot_datetime:'2026-04-16T10:00:00', status:'confirmed' as AppointmentStatus, meet_link:'https://meet.google.com/abc-defg-hij', has_scan:true },
  { id:'a2', patient_name:'Ramesh Jadhav', patient_id:'p-002', slot_datetime:'2026-04-16T11:30:00', status:'confirmed' as AppointmentStatus, meet_link:'https://meet.google.com/def', has_scan:false },
  { id:'a3', patient_name:'Kavitha Nair', patient_id:'p-003', slot_datetime:'2026-04-14T14:00:00', status:'completed' as AppointmentStatus, meet_link:'', has_scan:true },
  { id:'a4', patient_name:'Sunil Patil', patient_id:'p-004', slot_datetime:'2026-04-10T15:00:00', status:'no-show' as AppointmentStatus, meet_link:'', has_scan:false },
];

export default function DoctorAppointments() {
  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>Appointments</h2>
        <p style={{color:'var(--text-muted)'}}>Manage your scheduled consultations and patient interactions</p>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {MOCK.map(appt => (
          <Card key={appt.id} style={{padding:'1.25rem'}}>
            <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
              <div style={{width:50,height:50,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--secondary))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <User size={22} color="white"/>
              </div>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.625rem',marginBottom:'0.25rem',flexWrap:'wrap'}}>
                  <h5 style={{fontSize:'var(--font-size-base)'}}>{appt.patient_name}</h5>
                  <Badge variant={appt.status} dot>{appt.status.replace('-',' ')}</Badge>
                  {appt.has_scan && <span style={{fontSize:'0.7rem',background:'var(--accent)',color:'var(--primary)',padding:'2px 8px',borderRadius:'var(--radius-full)',fontWeight:700}}>AI Scan</span>}
                </div>
                <p style={{fontSize:'var(--font-size-sm)',color:'var(--text-muted)'}}>
                  📅 {format(new Date(appt.slot_datetime),'EEEE, dd MMM yyyy')} at {format(new Date(appt.slot_datetime),'hh:mm a')}
                </p>
              </div>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                <Link to={`/doctor/patient/${appt.patient_id}`}>
                  <Button size="sm" variant="secondary" icon={<User size={13}/>}>View Patient</Button>
                </Link>
                {appt.meet_link && appt.status !== 'completed' && (
                  <a href={`/doctor/consultation/${appt.id}`}>
                    <Button size="sm" icon={<Video size={13}/>}>Start Consultation</Button>
                  </a>
                )}
                {appt.status === 'confirmed' && (
                  <>
                    <Button size="sm" variant="ghost" icon={<CheckCircle size={13}/>} onClick={() => toast.success('Marked as completed')}>Complete</Button>
                    <Button size="sm" variant="ghost" style={{color:'var(--danger)'}} icon={<X size={13}/>} onClick={() => toast.success('Marked as no-show')}>No-Show</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
