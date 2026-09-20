import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, Package, ShoppingBag, User, X } from 'lucide-react';
import { useAuth, homePathFor } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, isCustomer } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  // close menus when the page changes
  useEffect(() => { setMenuOpen(false); setAccountOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => { if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out');
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/restaurants" className={linkClass}>Restaurants</NavLink>
          <NavLink to="/categories" className={linkClass}>Categories</NavLink>
          {/* the account actions repeat inside the mobile menu */}
          <div className="nav-mobile-actions">
            {!user && (
              <>
                <Link to="/login" className="btn btn-ghost btn-block">Log in</Link>
                <Link to="/register" className="btn btn-primary btn-block">Sign up</Link>
              </>
            )}
            {user && <Link to={homePathFor(user) === '/' ? '/account' : homePathFor(user)} className="btn btn-ghost btn-block">{user.role === 'customer' ? 'My account' : 'Dashboard'}</Link>}
            {user && <button type="button" className="btn btn-soft btn-block" onClick={handleLogout}>Log out</button>}
          </div>
        </nav>

        <div className="navbar-actions">
          {(!user || isCustomer) && (
            <Link to="/cart" className="cart-btn" aria-label={`Cart, ${cart.count} items`}>
              <ShoppingBag size={20} />
              {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
            </Link>
          )}

          {user ? (
            <div className="account-menu" ref={accountRef}>
              <button type="button" className="account-btn" onClick={() => setAccountOpen((o) => !o)} aria-expanded={accountOpen}>
                <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="account-name">{user.name.split(' ')[0]}</span>
                <ChevronDown size={16} />
              </button>
              {accountOpen && (
                <div className="dropdown">
                  <div className="dropdown-head">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  {user.role === 'customer' && (
                    <>
                      <Link to="/account"><User size={16} /> My account</Link>
                      <Link to="/orders"><Package size={16} /> My orders</Link>
                    </>
                  )}
                  {user.role !== 'customer' && <Link to={homePathFor(user)}><LayoutDashboard size={16} /> Dashboard</Link>}
                  <button type="button" onClick={handleLogout}><LogOut size={16} /> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}

          <button type="button" className="icon-btn nav-toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
