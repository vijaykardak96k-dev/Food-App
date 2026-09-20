import { useState } from 'react';
import { addressApi } from '../services/services.js';
import Field from './Field.jsx';

// Used on the checkout page and in the account page.
export default function AddressForm({ onSaved, onCancel, defaultPhone = '' }) {
  const [form, setForm] = useState({ full_address: '', city: '', pincode: '', phone: defaultPhone });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (form.full_address.trim().length < 5) next.full_address = 'Enter the full address (house, street, area)';
    if (form.city.trim().length < 2) next.city = 'Enter your city';
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = 'Pincode must be 6 digits';
    if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim())) next.phone = 'Phone number must be 10 digits';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSaving(true);
    try {
      const data = await addressApi.create(form);
      onSaved(data.address);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="form" noValidate>
      {formError && <div className="alert alert-error" role="alert">{formError}</div>}
      <Field label="Full address" htmlFor="addr-full" error={errors.full_address}>
        <textarea id="addr-full" className="input" rows={3} value={form.full_address} onChange={set('full_address')} placeholder="Flat / house no., building, street, area" />
      </Field>
      <div className="form-grid">
        <Field label="City" htmlFor="addr-city" error={errors.city}>
          <input id="addr-city" className="input" value={form.city} onChange={set('city')} />
        </Field>
        <Field label="Pincode" htmlFor="addr-pin" error={errors.pincode}>
          <input id="addr-pin" className="input" inputMode="numeric" maxLength={6} value={form.pincode} onChange={set('pincode')} />
        </Field>
      </div>
      <Field label="Phone number (optional)" htmlFor="addr-phone" error={errors.phone} hint="We use your account phone if you leave this empty">
        <input id="addr-phone" className="input" inputMode="numeric" maxLength={10} value={form.phone} onChange={set('phone')} />
      </Field>
      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save address'}</button>
      </div>
    </form>
  );
}
