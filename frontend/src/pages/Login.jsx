import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth, homePathFor } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // customers return to the page they came from; restaurant owners and admins go to their panel
  const targetFor = (u) => (u.role === 'customer' ? from || '/' : homePathFor(u));
  if (user) return <Navigate to={targetFor(user)} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const next = {};
    if (!form.email.trim()) next.email = 'Enter your email address';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const loggedIn = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`);
      navigate(targetFor(loggedIn), { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to order food, track orders or manage your restaurant."
      footer={<>New to Cravo? <Link to="/register" className="text-link">Create an account</Link></>}
    >
      <form onSubmit={submit} className="form" noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <Field label="Email" htmlFor="login-email" error={errors.email}>
          <input id="login-email" type="email" className="input" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </Field>
        <Field label="Password" htmlFor="login-password" error={errors.password}>
          <div className="input-wrap">
            <input id="login-password" type={showPassword ? 'text' : 'password'} className="input" autoComplete="current-password" value={form.password} onChange={set('password')} />
            <button type="button" className="input-toggle" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      </form>
    </AuthShell>
  );
}
