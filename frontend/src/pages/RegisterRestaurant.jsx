import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useAuth, homePathFor } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterRestaurant() {
  const { user, registerRestaurant } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', restaurantName: '', cuisine: '', location: '', description: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homePathFor(user)} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter the owner name';
    if (!EMAIL_PATTERN.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!/^\d{10}$/.test(form.phone.trim())) next.phone = 'Phone number must be 10 digits';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (form.restaurantName.trim().length < 2) next.restaurantName = 'Enter the restaurant name';
    if (!form.cuisine.trim()) next.cuisine = 'Enter the cuisine, for example "North Indian"';
    if (!form.location.trim()) next.location = 'Enter the area and city';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setBusy(true);
    try {
      await registerRestaurant(form);
      toast.success('Restaurant registered. It will appear to customers once an admin approves it.');
      navigate('/partner', { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Register your restaurant"
      subtitle="Create an owner account and add your restaurant details."
      footer={<>Already registered? <Link to="/login" className="text-link">Log in</Link></>}
    >
      <form onSubmit={submit} className="form" noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <div className="alert alert-info"><Info size={18} /> New restaurants are reviewed by an admin before customers can see them.</div>
        <h2 className="form-section">Owner details</h2>
        <Field label="Your name" htmlFor="rr-name" error={errors.name}>
          <input id="rr-name" className="input" value={form.name} onChange={set('name')} />
        </Field>
        <div className="form-grid">
          <Field label="Email" htmlFor="rr-email" error={errors.email}>
            <input id="rr-email" type="email" className="input" value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Phone number" htmlFor="rr-phone" error={errors.phone}>
            <input id="rr-phone" className="input" inputMode="numeric" maxLength={10} value={form.phone} onChange={set('phone')} />
          </Field>
        </div>
        <Field label="Password" htmlFor="rr-password" error={errors.password} hint="At least 6 characters">
          <input id="rr-password" type="password" className="input" autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <h2 className="form-section">Restaurant details</h2>
        <Field label="Restaurant name" htmlFor="rr-rname" error={errors.restaurantName}>
          <input id="rr-rname" className="input" value={form.restaurantName} onChange={set('restaurantName')} />
        </Field>
        <div className="form-grid">
          <Field label="Cuisine" htmlFor="rr-cuisine" error={errors.cuisine}>
            <input id="rr-cuisine" className="input" value={form.cuisine} onChange={set('cuisine')} placeholder="e.g. South Indian" />
          </Field>
          <Field label="Location" htmlFor="rr-location" error={errors.location}>
            <input id="rr-location" className="input" value={form.location} onChange={set('location')} placeholder="Area, City" />
          </Field>
        </div>
        <Field label="Short description (optional)" htmlFor="rr-desc">
          <textarea id="rr-desc" className="input" rows={3} maxLength={500} value={form.description} onChange={set('description')} />
        </Field>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Registering...' : 'Register restaurant'}</button>
      </form>
    </AuthShell>
  );
}
