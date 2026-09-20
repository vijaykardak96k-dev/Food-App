import { useState } from 'react';
import { Pencil, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { catalogApi, partnerApi } from '../../services/services.js';
import { imageUrl } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/format.js';
import PageHeader from '../../components/PageHeader.jsx';
import VegMark from '../../components/VegMark.jsx';
import Switch from '../../components/Switch.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FoodFormModal from './FoodFormModal.jsx';

export default function PartnerMenu() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(async () => {
    const [foods, categories] = await Promise.all([partnerApi.foods(), catalogApi.categories()]);
    return { foods: foods.foods, categories: categories.categories };
  }, []);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new item, object = edit
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const foods = data.foods.filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase()));

  const toggle = async (food, value) => {
    try {
      await partnerApi.setAvailability(food.id, value);
      toast.success(`${food.name} is now ${value ? 'available' : 'unavailable'}`);
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await partnerApi.deleteFood(toDelete.id);
      toast.success(`${toDelete.name} deleted`);
      setToDelete(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Menu"
        subtitle={`${data.foods.length} items on your menu`}
        actions={<button type="button" className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={18} /> Add food</button>}
      />

      {data.foods.length > 0 && (
        <div className="toolbar">
          <input className="input" type="search" placeholder="Search your menu" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search your menu" />
        </div>
      )}

      {data.foods.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Your menu is empty" message="Add your first dish so customers can start ordering." action={<button type="button" className="btn btn-primary" onClick={() => setEditing(null)}>Add food</button>} />
      ) : foods.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No items match your search" />
      ) : (
        <div className="menu-grid">
          {foods.map((f) => (
            <article key={f.id} className={`menu-card ${f.is_available ? '' : 'off'}`}>
              <div className="menu-card-media">
                <img src={imageUrl(f.image)} alt={f.name} loading="lazy" />
                <span className="food-veg"><VegMark veg={f.is_veg} /></span>
              </div>
              <div className="menu-card-body">
                <div className="menu-card-title">
                  <h3>{f.name}</h3>
                  <strong>{formatPrice(f.price)}</strong>
                </div>
                <span className="chip">{f.category_name}</span>
                <p className="food-desc">{f.description}</p>
                <div className="menu-card-actions">
                  <label className="switch-label">
                    <Switch checked={Boolean(f.is_available)} onChange={(v) => toggle(f, v)} label={`${f.name} available`} />
                    <span>{f.is_available ? 'Available' : 'Unavailable'}</span>
                  </label>
                  <div>
                    <button type="button" className="icon-btn" onClick={() => setEditing(f)} aria-label={`Edit ${f.name}`}><Pencil size={18} /></button>
                    <button type="button" className="icon-btn danger" onClick={() => setToDelete(f)} aria-label={`Delete ${f.name}`}><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <FoodFormModal
          food={editing}
          categories={data.categories}
          onClose={() => setEditing(undefined)}
          onSaved={() => { setEditing(undefined); reload({ silent: true }); }}
        />
      )}
      {toDelete && (
        <ConfirmDialog
          title="Delete this item?"
          message={`"${toDelete.name}" will be removed from your menu. Past orders are not affected.`}
          confirmLabel="Delete"
          danger
          busy={deleting}
          onConfirm={remove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
