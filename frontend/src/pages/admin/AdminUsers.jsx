import { useState } from 'react';
import { Eye, Users } from 'lucide-react';
import { adminApi } from '../../services/services.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/format.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const ROLE_LABELS = { customer: 'Customer', restaurant: 'Restaurant owner', admin: 'Admin' };

function UserDetailsModal({ userId, onClose }) {
  const { data, loading, error } = useFetch(() => adminApi.user(userId), [userId]);
  return (
    <Modal title="User details" onClose={onClose}>
      {loading && <LoadingSpinner />}
      {error && !data && <ErrorState message={error} />}
      {data && (
        <div className="user-details">
          <div className="user-details-head">
            <span className="avatar avatar-xl">{data.user.name.charAt(0).toUpperCase()}</span>
            <div>
              <h3>{data.user.name}</h3>
              <p className="muted">{ROLE_LABELS[data.user.role]}</p>
              <StatusBadge status={data.user.is_active ? 'Active' : 'Inactive'} />
            </div>
          </div>
          <dl className="detail-grid">
            <div><dt>Email</dt><dd>{data.user.email}</dd></div>
            <div><dt>Phone</dt><dd>{data.user.phone}</dd></div>
            <div><dt>Joined</dt><dd>{formatDate(data.user.created_at)}</dd></div>
            <div><dt>Orders placed</dt><dd>{data.order_count}</dd></div>
            {data.restaurant && <div><dt>Restaurant</dt><dd>{data.restaurant.name} ({data.restaurant.status})</dd></div>}
          </dl>
          {data.user.role === 'customer' && (
            <>
              <h4>Saved addresses</h4>
              {data.addresses.length === 0 ? <p className="muted">No saved addresses.</p> : (
                <ul className="plain-list">
                  {data.addresses.map((a) => <li key={a.id}>{a.full_address}, {a.city} - {a.pincode}</li>)}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function AdminUsers() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const q = useDebounce(search);
  const { data, loading, error, reload } = useFetch(() => adminApi.users({ q, role }), [q, role]);
  const [viewId, setViewId] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [busy, setBusy] = useState(false);

  const applyToggle = async () => {
    setBusy(true);
    try {
      await adminApi.setUserStatus(toggling.id, !toggling.is_active);
      toast.success(`${toggling.name} is now ${toggling.is_active ? 'inactive' : 'active'}`);
      setToggling(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Customers and restaurant owners" />
      <div className="toolbar toolbar-row">
        <input className="input" type="search" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
        <select className="input select-sm" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="restaurant">Restaurant owners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && data.users.length === 0 && <EmptyState icon={Users} title="No users found" message="Try a different search or role." />}
      {data && data.users.length > 0 && (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Role</th><th>Joined</th><th className="num">Orders</th><th>Status</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong><small className="muted block">{u.email}</small></td>
                    <td>{ROLE_LABELS[u.role]}</td>
                    <td>{formatDate(u.created_at)}</td>
                    <td className="num">{u.order_count}</td>
                    <td><StatusBadge status={u.is_active ? 'Active' : 'Inactive'} /></td>
                    <td className="num actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewId(u.id)}><Eye size={16} /> View</button>
                      {u.role !== 'admin' && (
                        <button type="button" className={`btn btn-sm ${u.is_active ? 'btn-soft-danger' : 'btn-soft'}`} onClick={() => setToggling(u)}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewId && <UserDetailsModal userId={viewId} onClose={() => setViewId(null)} />}
      {toggling && (
        <ConfirmDialog
          title={toggling.is_active ? `Deactivate ${toggling.name}?` : `Activate ${toggling.name}?`}
          message={toggling.is_active ? 'They will be logged out and will not be able to log in until you activate the account again.' : 'They will be able to log in again.'}
          confirmLabel={toggling.is_active ? 'Deactivate' : 'Activate'}
          danger={toggling.is_active}
          busy={busy}
          onConfirm={applyToggle}
          onCancel={() => setToggling(null)}
        />
      )}
    </>
  );
}
