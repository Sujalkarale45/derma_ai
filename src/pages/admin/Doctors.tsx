import { useState } from 'react';
import { CheckCircle, X, Eye, ShieldCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

const DOCTORS = [
  {id:'d-001',name:'Dr. Rajesh Kulkarni',reg:'MH-DRM-20145',specialisation:'Dermatology & Venereology',city:'Pune',verified:true,applied:'2026-01-10',rating:4.8,patients:48},
  {id:'d-002',name:'Dr. Priyanka Desai',reg:'MH-DRM-18932',specialisation:'Cosmetic Dermatology',city:'Mumbai',verified:true,applied:'2026-01-18',rating:4.6,patients:31},
  {id:'d-003',name:'Dr. Amol Patil',reg:'MH-DRM-21067',specialisation:'Pediatric Dermatology',city:'Nagpur',verified:true,applied:'2026-02-05',rating:4.5,patients:22},
  {id:'pending-1',name:'Dr. Arjun Mehta',reg:'MH-DRM-22890',specialisation:'General Dermatology',city:'Aurangabad',verified:false,applied:'2026-04-12',rating:0,patients:0},
  {id:'pending-2',name:'Dr. Lalitha Reddy',reg:'KA-DRM-19234',specialisation:'Dermato-Oncology',city:'Pune',verified:false,applied:'2026-04-13',rating:0,patients:0},
];

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState(DOCTORS);
  const [tab, setTab] = useState<'all'|'pending'>('all');

  function approve(id: string) {
    setDoctors(d => d.map(doc => doc.id===id ? {...doc,verified:true} : doc));
    toast.success('Doctor approved and notified via email!');
  }
  function reject(id: string) {
    setDoctors(d => d.filter(doc => doc.id!==id));
    toast.error('Doctor registration rejected.');
  }

  const filtered = tab==='pending' ? doctors.filter(d => !d.verified) : doctors;

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>Doctor Management</h2>
        <p style={{color:'var(--text-muted)'}}>Approve registrations and manage verified dermatologists</p>
      </div>

      <div style={{display:'flex',gap:'0',marginBottom:'1.5rem',border:'0.5px solid var(--border)',borderRadius:'var(--radius-sm)',overflow:'hidden',width:'fit-content'}}>
        {[{value:'all',label:'All Doctors'},{value:'pending',label:`Pending (${doctors.filter(d=>!d.verified).length})`}].map(({value,label}) => (
          <button key={value} onClick={() => setTab(value as any)} style={{
            padding:'0.5rem 1.25rem',border:'none',cursor:'pointer',
            background:tab===value?'var(--primary)':'var(--bg-card)',
            color:tab===value?'white':'var(--text-secondary)',
            fontWeight:tab===value?600:500,fontSize:'var(--font-size-sm)',
            transition:'all var(--transition-fast)',
          }}>{label}</button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {filtered.map(doc => (
          <Card key={doc.id} style={{padding:'1.25rem',border:!doc.verified?'0.5px solid var(--warning)':'0.5px solid var(--border)'}}>
            <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
              <Avatar name={doc.name} size={48}/>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.25rem',flexWrap:'wrap'}}>
                  <h5 style={{fontSize:'var(--font-size-base)'}}>{doc.name}</h5>
                  {doc.verified ? <Badge variant="verified" dot>Verified</Badge> : <Badge variant="pending" dot>Pending</Badge>}
                </div>
                <p style={{fontSize:'var(--font-size-sm)',color:'var(--primary)',marginBottom:'0.25rem'}}>{doc.specialisation}</p>
                <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>Reg: {doc.reg} · {doc.city} · Applied: {doc.applied}</p>
                {doc.verified && <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)',marginTop:'0.25rem'}}>Rating: {doc.rating} · {doc.patients} patients</p>}
              </div>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <Button size="sm" variant="ghost" icon={<Eye size={13}/>}>View</Button>
                {!doc.verified && (
                  <>
                    <Button size="sm" icon={<CheckCircle size={13}/>} onClick={() => approve(doc.id)}>Approve</Button>
                    <Button size="sm" variant="danger" icon={<X size={13}/>} onClick={() => reject(doc.id)}>Reject</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length===0 && <p style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No pending approvals.</p>}
      </div>
    </div>
  );
}
