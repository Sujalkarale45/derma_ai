import type { DoctorProfile } from '../types';

export const MOCK_DOCTORS: DoctorProfile[] = [
  {
    id: 'd-001', name: 'Dr. Rajesh Kulkarni', email: 'rajesh@demo.com',
    phone: '+91 9876543210', role: 'doctor',
    specialisation: 'Dermatology & Venereology',
    reg_number: 'MH-DRM-20145', experience_years: 14,
    hospital: 'Government Medical College, Nagpur', city: 'Nagpur', state: 'Maharashtra',
    bio: 'Expert in clinical and dermoscopic diagnosis. Trained at KEM Hospital Mumbai with 14 years of dermatological practice.',
    avatar_url: 'https://i.pravatar.cc/150?img=11',
    lat: 21.1458, lng: 79.0882, verified: true, rating: 4.8, total_ratings: 128,
    available_days: [1, 2, 3, 4, 5], languages: ['en', 'hi', 'mr'],
    created_at: '2026-01-10T08:00:00', updated_at: '2026-04-01T08:00:00',
  },
  {
    id: 'd-002', name: 'Dr. Priyanka Desai', email: 'priyanka@demo.com',
    phone: '+91 9765432100', role: 'doctor',
    specialisation: 'Cosmetic Dermatology',
    reg_number: 'MH-DRM-18932', experience_years: 9,
    hospital: 'Lilavati Hospital', city: 'Mumbai', state: 'Maharashtra',
    bio: 'Specialises in aesthetic procedures, laser therapy, and skin rejuvenation. Trained at JIPMER Puducherry.',
    avatar_url: 'https://i.pravatar.cc/150?img=47',
    lat: 19.0760, lng: 72.8777, verified: true, rating: 4.6, total_ratings: 92,
    available_days: [1, 2, 4, 5], languages: ['en', 'hi'],
    created_at: '2026-01-18T08:00:00', updated_at: '2026-03-15T08:00:00',
  },
  {
    id: 'd-003', name: 'Dr. Amol Patil', email: 'amol@demo.com',
    phone: '+91 9654321000', role: 'doctor',
    specialisation: 'Pediatric Dermatology',
    reg_number: 'MH-DRM-21067', experience_years: 7,
    hospital: 'AIIMS Nagpur', city: 'Nagpur', state: 'Maharashtra',
    bio: 'Focused on childhood skin conditions, eczema, and psoriasis management in rural populations.',
    avatar_url: 'https://i.pravatar.cc/150?img=53',
    lat: 21.1458, lng: 79.0882, verified: true, rating: 4.5, total_ratings: 67,
    available_days: [1, 3, 5], languages: ['en', 'mr'],
    created_at: '2026-02-05T08:00:00', updated_at: '2026-03-20T08:00:00',
  },
  {
    id: 'd-004', name: 'Dr. Sunita Joshi', email: 'sunita@demo.com',
    phone: '+91 9543210008', role: 'doctor',
    specialisation: 'Dermato-Oncology',
    reg_number: 'MH-DRM-19501', experience_years: 18,
    hospital: 'Tata Memorial Hospital', city: 'Mumbai', state: 'Maharashtra',
    bio: 'Senior dermato-oncologist specialising in melanoma, BCC, and SCC. Over 18 years clinical experience at TMH.',
    avatar_url: 'https://i.pravatar.cc/150?img=46',
    lat: 19.0075, lng: 72.8430, verified: true, rating: 4.9, total_ratings: 214,
    available_days: [1, 2, 3, 4], languages: ['en', 'hi', 'mr'],
    created_at: '2025-11-01T08:00:00', updated_at: '2026-04-01T08:00:00',
  },
  {
    id: 'd-005', name: 'Dr. Vishal Nikam', email: 'vishal@demo.com',
    phone: '+91 9432100087', role: 'doctor',
    specialisation: 'General Dermatology',
    reg_number: 'MH-DRM-22198', experience_years: 5,
    hospital: 'Government Medical College', city: 'Aurangabad', state: 'Maharashtra',
    bio: 'Committed to making dermatological care accessible to semi-urban and rural patients in Marathwada.',
    avatar_url: 'https://i.pravatar.cc/150?img=60',
    lat: 19.8762, lng: 75.3433, verified: true, rating: 4.3, total_ratings: 41,
    available_days: [1, 2, 3, 4, 5, 6], languages: ['en', 'hi', 'mr'],
    created_at: '2026-02-20T08:00:00', updated_at: '2026-03-28T08:00:00',
  },
  {
    id: 'd-006', name: 'Dr. Meera Iyer', email: 'meera@demo.com',
    phone: '+91 9321000876', role: 'doctor',
    specialisation: 'Dermatology & Venereology',
    reg_number: 'KA-DRM-17890', experience_years: 11,
    hospital: 'Manipal Hospital', city: 'Kolhapur', state: 'Maharashtra',
    bio: 'South India trained dermatologist now serving western Maharashtra. Expert in tropical skin diseases and hair disorders.',
    avatar_url: 'https://i.pravatar.cc/150?img=48',
    lat: 16.7050, lng: 74.2433, verified: true, rating: 4.7, total_ratings: 88,
    available_days: [2, 3, 4, 5], languages: ['en', 'mr'],
    created_at: '2026-01-25T08:00:00', updated_at: '2026-04-05T08:00:00',
  },
];

export function getDoctorById(id: string): DoctorProfile | undefined {
  return MOCK_DOCTORS.find(d => d.id === id);
}

export function searchDoctors(query: string): DoctorProfile[] {
  const q = query.toLowerCase();
  return MOCK_DOCTORS.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.city.toLowerCase().includes(q) ||
    d.specialisation.toLowerCase().includes(q)
  );
}
