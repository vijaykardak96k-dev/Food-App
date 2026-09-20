import { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { partnerApi } from '../../services/services.js';
import { imageUrl } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/Modal.jsx';
import Field from '../../components/Field.jsx';
import Switch from '../../components/Switch.jsx';

// Add food (food is null) or edit food.
export default function FoodFormModal({ food, categories, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: food?.name || '',
    description: food?.description || '',
    price: food ? String(food.price) : '',
    category_id: food ? String(food.category_id) : String(categories[0]?.id || ''),
    is_veg: food ? Boolean(food.is_veg) : true,
    is_available: food ? Boolean(food.is_available) : true,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(food ? imageUrl(food.image) : null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // free the temporary preview URL
  useEffect(() => () => { if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(picked.type)) { setErrors((er) => ({ ...er, image: 'Choose a JPG, PNG or WebP image' })); return; }
    if (picked.size > 2 * 1024 * 1024) { setErrors((er) => ({ ...er, image: 'Image must be smaller than 2 MB' })); return; }
    setErrors((er) => ({ ...er, image: undefined }));
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter the food name';
    if (!(Number(form.price) > 0)) next.price = 'Enter a price greater than 0';
    if (!form.category_id) next.category_id = 'Choose a category';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('description', form.description.trim());
    body.append('price', form.price);
    body.append('category_id', form.category_id);
    body.append('is_veg', form.is_veg);
    body.append('is_available', form.is_available);
    if (file) body.append('image', file);

    setSaving(true);
    try {
      if (food) await partnerApi.updateFood(food.id, body);
      else await partnerApi.createFood(body);
      toast.success(food ? 'Food item updated' : 'Food item added to your menu');
      onSaved();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={food ? 'Edit food item' : 'Add food item'}
      onClose={onClose}
      size="lg"
      footer={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="food-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : food ? 'Save changes' : 'Add to menu'}</button>
        </>
      )}
    >
      <form id="food-form" onSubmit={submit} className="form food-form" noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <div className="food-form-grid">
          <div className="food-form-fields">
            <Field label="Name" htmlFor="ff-name" error={errors.name}>
              <input id="ff-name" className="input" value={form.name} onChange={set('name')} maxLength={120} />
            </Field>
            <Field label="Description" htmlFor="ff-desc">
              <textarea id="ff-desc" className="input" rows={3} value={form.description} onChange={set('description')} maxLength={500} />
            </Field>
            <div className="form-grid">
              <Field label="Price (INR)" htmlFor="ff-price" error={errors.price}>
                <input id="ff-price" type="number" min="1" step="1" className="input" value={form.price} onChange={set('price')} />
              </Field>
              <Field label="Category" htmlFor="ff-cat" error={errors.category_id}>
                <select id="ff-cat" className="input" value={form.category_id} onChange={set('category_id')}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Type">
              <div className="segmented" role="group" aria-label="Food type">
                <button type="button" className={form.is_veg ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, is_veg: true }))}>Veg</button>
                <button type="button" className={!form.is_veg ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, is_veg: false }))}>Non-veg</button>
              </div>
            </Field>
            <div className="switch-row">
              <div><strong>Available to order</strong><p className="muted">Turn off when the item is sold out</p></div>
              <Switch checked={form.is_available} onChange={(v) => setForm((f) => ({ ...f, is_available: v }))} label="Available to order" />
            </div>
          </div>

          <Field label="Image" htmlFor="ff-image" error={errors.image} hint="JPG, PNG or WebP, up to 2 MB. If you skip it, a picture of the category is used.">
            <label className="image-drop" htmlFor="ff-image">
              {preview ? <img src={preview} alt="Food preview" /> : <span><ImagePlus size={28} /> Choose image</span>}
            </label>
            <input id="ff-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="sr-only" />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
