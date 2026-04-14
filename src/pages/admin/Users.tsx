import { useState } from 'react';
import { Search, UserCheck, UserX, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

const ALL_USERS = [
  {id:'p-001',name:'Priya Sharma',email:'patient@demo.com',role:'patient',location:'Satara, MH',active:true,joined:'2026-01-15'},
  {id:'p-002',name:'Ramesh Jadhav',email:'ramesh@demo.com',role:'patient',location:'Solapur, MH',active:true,joined:'2026-02-10'},
  {id:'d-001',name:'Dr. Rajesh Kulkarni',email:'doctor@demo.com',role:'doctor',location:'Pune, MH',active:true,joined:'2026-01-10'},
  {id:'d-002',name:'Dr. Priyanka Desai',email:'priyanka@demo.com',role:'doctor',location:'Mumbai, MH',active:true,joined:'2026-01-18'},
  {id:'p-003',name:'Kavitha Nair',email:'kavitha@demo.com',role:'patient',location:'Nashik, MH',active:false,joined:'2026-03-01'},
];

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'patient'|'doctor'>('all');
  const [users, setUsers] = useState(ALL_USERS);

  function toggleActive(id: string) {
    setUsers(u => u.map(usr => usr.id===id ? {...usr,active:!usr.active} : usr));
    toast.success('User status updated.');
  }

  const filtered = users.filter(u => {
    const matchRole = filter==='all' || u.role===filter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>User Management</h2>
        <p style={{color:'var(--text-muted)'}}>Manage all patients and doctors on the platform</p>
      </div>

      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:'200px'}}>
          <Search size={15} color="var(--text-muted)" style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)'}}/>
          <input className="form-input" style={{paddingLeft:'2.25rem'}} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:'0.375rem'}}>
          {(['all','patient','doctor'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{padding:'0.5rem 0.875rem',borderRadius:'var(--radius-sm)',border:'0.5px solid var(--border)',background:filter===f?'var(--primary)':'var(--bg-card)',color:filter===f?'white':'var(--text-secondary)',cursor:'pointer',fontWeight:500,fontSize:'var(--font-size-sm)',textTransform:'capitalize'}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--neutral)',borderBottom:'0.5px solid var(--border)'}}>
                {['User','Role','Location','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{textAlign:'left',padding:'0.75rem 1rem',fontSize:'var(--font-size-xs)',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-muted)',fontWeight:600,whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={{borderBottom:'0.5px solid var(--border)',transition:'background var(--transition-fast)'}}
                  onMouseEnter={e => (e.currentTarget.style.background='var(--neutral)')}
                  onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                  <td style={{padding:'0.875rem 1rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
                      <Avatar name={user.name} size={32}/>
                      <div>
                        <p style={{fontWeight:600,fontSize:'var(--font-size-sm)'}}>{user.name}</p>
                        <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'0.875rem 1rem'}}>
                    <Badge variant={user.active?'confirmed':'cancelled'}>{user.role}</Badge>
                  </td>
                  <td style={{padding:'0.875rem 1rem',fontSize:'var(--font-size-sm)',color:'var(--text-muted)'}}>{user.location}</td>
                  <td style={{padding:'0.875rem 1rem'}}>
                    <Badge variant={user.active?'confirmed':'cancelled'} dot>{user.active?'Active':'Inactive'}</Badge>
                  </td>
                  <td style={{padding:'0.875rem 1rem',fontSize:'var(--font-size-xs)',color:'var(--text-muted)',whiteSpace:'nowrap'}}>{user.joined}</td>
                  <td style={{padding:'0.875rem 1rem'}}>
                    <div style={{display:'flex',gap:'0.375rem'}}>
                      <Button size="sm" variant="ghost" icon={<Eye size={12}/>}>View</Button>
                      <button onClick={() => toggleActive(user.id)} style={{
                        padding:'0.3rem 0.625rem',borderRadius:'var(--radius-sm)',border:'0.5px solid var(--border)',
                        background:user.active?'var(--danger-light)':'var(--accent)',
                        color:user.active?'var(--danger)':'var(--primary)',
                        cursor:'pointer',fontSize:'var(--font-size-xs)',fontWeight:600,
                      }}>
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <p style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No users found.</p>}
        </div>
      </Card>
    </div>
  );
}
