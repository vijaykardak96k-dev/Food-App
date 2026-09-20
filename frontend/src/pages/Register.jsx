import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth, homePathFor } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homePathFor(user)} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name';
    if (!EMAIL_PATTERN.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!/^\d{10}$/.test(form.phone.trim())) next.phone = 'Phone number must be 10 digits';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const created = await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      toast.success(`Welcome to Cravo, ${created.name.split(' ')[0]}!`);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={<>Already have an account? <Link to="/login" className="text-link">Log in</Link></>}
    >
      <form onSubmit={submit} className="form" noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <Field label="Full name" htmlFor="reg-name" error={errors.name}>
          <input id="reg-name" className="input" autoComplete="name" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Email" htmlFor="reg-email" error={errors.email}>
          <input id="reg-email" type="email" className="input" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </Field>
        <Field label="Phone number" htmlFor="reg-phone" error={errors.phone}>
          <input id="reg-phone" className="input" inputMode="numeric" maxLength={10} autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile number" />
        </Field>
        <Field label="Password" htmlFor="reg-password" error={errors.password} hint="At least 6 characters">
          <div className="input-wrap">
            <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input" autoComplete="new-password" value={form.password} onChange={set('password')} />
            <button type="button" className="input-toggle" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        <p className="auth-alt">Own a restaurant? <Link to="/register-restaurant" className="text-link">Register it here</Link></p>
      </form>
    </AuthShell>
  );
}
