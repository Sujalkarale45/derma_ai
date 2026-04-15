import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import FindDoctor from './pages/public/FindDoctor';
import About from './pages/public/About';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import UploadScan from './pages/patient/UploadScan';
import PatientAppointments from './pages/patient/Appointments';
import BookAppointment from './pages/patient/BookAppointment';
import Records from './pages/patient/Records';
import Locator from './pages/patient/Locator';
import PatientProfile from './pages/patient/Profile';
import Consult from './pages/patient/Consult';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import PatientView from './pages/doctor/PatientView';
import Availability from './pages/doctor/Availability';
import Consultation from './pages/doctor/Consultation';
import DoctorProfile from './pages/doctor/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminDoctors from './pages/admin/Doctors';
import AdminAppointments from './pages/admin/Appointments';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

// Theme init
function initTheme() {
  const stored = localStorage.getItem('dermaai_theme');
  if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

// Protected Route wrapper
function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
          },
          success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
          error: { iconTheme: { primary: '#E24B4A', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* ── Public Routes ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/find-doctor" element={<FindDoctor />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Patient Routes ── */}
        <Route
          element={
            <ProtectedRoute role="patient">
              <PatientLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/upload-scan" element={<UploadScan />} />
          <Route path="/patient/appointments" element={<PatientAppointments />} />
          <Route path="/patient/book" element={<BookAppointment />} />
          <Route path="/patient/records" element={<Records />} />
          <Route path="/patient/locator" element={<Locator />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/consult" element={<Consult />} />
        </Route>

        {/* ── Doctor Routes ── */}
        <Route
          element={
            <ProtectedRoute role="doctor">
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/patient/:id" element={<PatientView />} />
          <Route path="/doctor/availability" element={<Availability />} />
          <Route path="/doctor/consultation/:appointmentId" element={<Consultation />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
        </Route>

        {/* ── Admin Routes ── */}
        <Route
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/doctors" element={<AdminDoctors />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>

        {/* ── Catch all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );

  const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    "https://SujalCodes-derma-ai.hf.space/run/predict",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  console.log(data);
};

}
