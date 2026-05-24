import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AnalyticsPage from './pages/AnalyticsPage';
import CertificatePage from './pages/CertificatePage';
import DashboardPage from './pages/DashboardPage';
import ExpensePage from './pages/ExpensePage';
import IncomePage from './pages/IncomePage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import RegisterPage from './pages/RegisterPage';
import TaxPage from './pages/TaxPage';

const Shell = ({ children }) => (
  <ProtectedRoute>
    <Navbar />
    <div className="min-h-screen bg-slate-50 md:pl-64">{children}</div>
  </ProtectedRoute>
);

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/', element: <Shell><Navigate to="/dashboard" replace /></Shell> },
  { path: '/onboarding', element: <ProtectedRoute><OnboardingPage /></ProtectedRoute> },
  { path: '/dashboard', element: <Shell><DashboardPage /></Shell> },
  { path: '/income', element: <Shell><IncomePage /></Shell> },
  { path: '/expenses', element: <Shell><ExpensePage /></Shell> },
  { path: '/analytics', element: <Shell><AnalyticsPage /></Shell> },
  { path: '/tax', element: <Shell><TaxPage /></Shell> },
  { path: '/certificate', element: <Shell><CertificatePage /></Shell> }
]);

const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

export default App;
