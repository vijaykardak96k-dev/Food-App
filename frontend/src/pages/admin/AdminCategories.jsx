import { useState } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { adminApi, catalogApi } from '../../services/services.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Modal from '../../components/Modal.jsx';
import Field from '../../components/Field.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';

function CategoryForm({ category, onClose, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState(category?.name || '');
  const [emoji, setEmoji] = useState(category?.emoji || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) { setError('Category name must be at least 2 characters'); return; }
    setSaving(true);
    try {
      const data = { name: name.trim(), emoji: emoji.trim() };
      if (category) await adminApi.updateCategory(category.id, data);
      else await adminApi.createCategory(data);
      toast.success(category ? 'Category updated' : 'Category added');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={category ? 'Edit category' : 'Add category'}
      size="sm"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="category-form" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save category'}</button>
        </>
      )}
    >
      <form id="category-form" onSubmit={submit} className="form" noValidate>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <Field label="Name" htmlFor="cat-name">
          <input id="cat-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
        </Field>
        <Field label="Emoji (optional)" htmlFor="cat-emoji" hint="A small decoration shown in this list">
          <input id="cat-emoji" className="input" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
        </Field>
      </form>
    </Modal>
  );
}

export default function AdminCategories() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => catalogApi.categories(), []);
  const [editing, setEditing] = useState(undefined); // undefined closed, null new, object edit
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await adminApi.deleteCategory(toDelete.id);
      toast.success(`${toDelete.name} deleted`);
      setToDelete(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
      setToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Food categories customers can browse"
        actions={<button type="button" className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={18} /> Add category</button>}
      />
      {loading && <LoadingSpinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && data.categories.length === 0 && <EmptyState icon={Tags} title="No categories yet" message="Add a category so restaurants can organise their menus." />}
      {data && data.categories.length > 0 && (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Category</th><th className="num">Food items</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {data.categories.map((c) => (
                  <tr key={c.id}>
                    <td><span className="cat-emoji">{c.emoji || '-'}</span> <strong>{c.name}</strong></td>
                    <td className="num">{c.total_foods}</td>
                    <td className="num actions">
                      <button type="button" className="icon-btn" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><Pencil size={18} /></button>
                      <button type="button" className="icon-btn danger" onClick={() => setToDelete(c)} aria-label={`Delete ${c.name}`}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing !== undefined && <CategoryForm category={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); reload({ silent: true }); }} />}
      {toDelete && (
        <ConfirmDialog
          title={`Delete ${toDelete.name}?`}
          message={toDelete.total_foods > 0 ? `This category still has ${toDelete.total_foods} food item(s), so it cannot be deleted until they are moved or removed.` : 'This category will be removed permanently.'}
          confirmLabel="Delete"
          danger
          busy={busy}
          onConfirm={remove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
