import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Checkout from './pages/Checkout';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentMyCourses from './pages/student/MyCourses';
import StudentAssignments from './pages/student/Assignments';
import StudentAITutor from './pages/student/AITutor';
import StudentChat from './pages/student/Chat';
import StudentLiveClass from './pages/student/LiveClass';
import StudentPayments from './pages/student/Payments';
import ProfileSettings from './pages/student/Profile';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyCreateCourse from './pages/faculty/CreateCourse';
import FacultyMyCourses from './pages/faculty/MyCourses';
import FacultyStudents from './pages/faculty/Students';
import FacultyAssignments from './pages/faculty/Assignments';
import FacultyLiveClass from './pages/faculty/LiveClass';
import FacultyAnalytics from './pages/faculty/Analytics';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminFacultyApproval from './pages/admin/FacultyApproval';
import AdminRevenue from './pages/admin/Revenue';
import AdminReports from './pages/admin/Reports';
import AdminCMS from './pages/admin/CMS';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
      <Route path="/courses/:id" element={<PublicLayout><CourseDetail /></PublicLayout>} />
      <Route path="/login" element={<><Navbar /><Login /></>} />
      <Route path="/register" element={<><Navbar /><Register /></>} />
      <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />

      {/* Protected Checkout Route */}
      <Route path="/checkout/:id" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Navbar />
          <Checkout />
        </ProtectedRoute>
      } />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Navbar />
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<StudentMyCourses />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="ai-tutor" element={<StudentAITutor />} />
        <Route path="chat" element={<StudentChat />} />
        <Route path="live-class" element={<StudentLiveClass />} />
        <Route path="payments" element={<StudentPayments />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Navbar />
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="courses" element={<FacultyMyCourses />} />
        <Route path="create-course" element={<FacultyCreateCourse />} />
        <Route path="students" element={<FacultyStudents />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="live-class" element={<FacultyLiveClass />} />
        <Route path="analytics" element={<FacultyAnalytics />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Navbar />
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="faculty-approval" element={<AdminFacultyApproval />} />
        <Route path="revenue" element={<AdminRevenue />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="cms" element={<AdminCMS />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-surface text-text-primary transition-colors duration-300">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
