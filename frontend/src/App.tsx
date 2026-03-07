import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { StoreIcon, ShieldAlertIcon } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import AdminMode from './pages/AdminMode';
import Login from './pages/Login';
import CustomerAuth from './pages/CustomerAuth';
import { AdminApi, CustomerApi } from './api';

const Navigation = ({
  isAuthenticatedUser,
  setIsAuthenticatedUser,
}: {
  isAuthenticatedUser: boolean;
  setIsAuthenticatedUser: (v: boolean) => void;
}) => {
  const navigate = useNavigate();
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const [isAdminAuth, setIsAdminAuth] = React.useState(false);

  React.useEffect(() => {
    AdminApi.checkAuth()
      .then((res) => setIsAdminAuth(res.authenticated))
      .catch(() => setIsAdminAuth(false));
  }, [window.location.pathname]);

  const handleAdminLogout = async () => {
    await AdminApi.logout();
    setIsAdminAuth(false);
    navigate('/admin/login');
  };

  const handleUserLogout = async () => {
    await CustomerApi.logout();
    setIsAuthenticatedUser(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand text-primary-gradient">
          <StoreIcon className="icon-lg" />
          <span>DigitalVoucher</span>
        </Link>
        <div className="nav-links">
          {isAdminPath ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link
                to="/"
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Customer View
              </Link>
              {isAdminAuth && (
                <button
                  onClick={handleAdminLogout}
                  className="btn btn-outline"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    borderColor: 'var(--color-danger)',
                    color: 'var(--color-danger)',
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {isAuthenticatedUser ? (
                <button
                  onClick={handleUserLogout}
                  className="btn btn-outline"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Sign In
                </Link>
              )}
              <Link
                to="/admin"
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <ShieldAlertIcon size={16} /> Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [isAuthenticatedUser, setIsAuthenticatedUser] = React.useState(false);

  React.useEffect(() => {
    CustomerApi.checkAuth()
      .then((res) => setIsAuthenticatedUser(res.authenticated))
      .catch(() => setIsAuthenticatedUser(false));
  }, []);

  return (
    <BrowserRouter>
      <Navigation
        isAuthenticatedUser={isAuthenticatedUser}
        setIsAuthenticatedUser={setIsAuthenticatedUser}
      />
      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<LandingPage isAuthenticatedUser={isAuthenticatedUser} />} />
            <Route
              path="/auth"
              element={<CustomerAuth setIsAuthenticatedUser={setIsAuthenticatedUser} />}
            />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminMode />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
};

export default App;
