import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import Footer from '../components/Footer.jsx';

// Sidebar layout for the restaurant panel (variant "partner") and the admin panel (variant "admin").
export default function DashboardLayout({ variant, title, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`dash dash-${variant}`}>
      <aside className={`dash-side ${open ? 'open' : ''}`}>
        <div className="dash-brand">
          <Logo to="/" light={variant === 'admin'} />
          <span className="dash-role">{title}</span>
        </div>
        <nav className="dash-nav" aria-label={title}>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `dash-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="dash-side-bottom">
          <NavLink to="/" className="dash-link"><ExternalLink size={18} /> View website</NavLink>
          <button type="button" className="dash-link" onClick={handleLogout}><LogOut size={18} /> Log out</button>
        </div>
      </aside>
      {open && <div className="dash-scrim" onClick={() => setOpen(false)} />}

      <div className="dash-main">
        <header className="dash-top">
          <button type="button" className="icon-btn dash-burger" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <div className="dash-user">
            <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role === 'admin' ? 'Administrator' : user.restaurant?.name || 'Restaurant owner'}</span>
            </div>
          </div>
        </header>
        <main className="dash-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
