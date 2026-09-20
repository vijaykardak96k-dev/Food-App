import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Plus, Trash2, Receipt } from 'lucide-react';
import { addressApi, orderApi } from '../services/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/format.js';
import OrderCard from '../components/OrderCard.jsx';
import OrderTracker from '../components/OrderTracker.jsx';
import AddressForm from '../components/AddressForm.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const ACTIVE = ['Pending', 'Accepted', 'Preparing', 'Ready'];

export default function Account() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(async () => {
    const [orders, addresses] = await Promise.all([orderApi.list(), addressApi.list()]);
    return { orders: orders.orders, addresses: addresses.addresses };
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const removeAddress = async () => {
    setDeleting(true);
    try {
      await addressApi.remove(toDelete.id);
      toast.success('Address deleted');
      setToDelete(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const current = data?.orders.find((o) => ACTIVE.includes(o.status));
  const recent = data ? data.orders.filter((o) => o !== current).slice(0, 3) : [];

  return (
    <div className="container page-section">
      <div className="account-layout">
        <aside className="profile-card">
          <span className="avatar avatar-xl">{user.name.charAt(0).toUpperCase()}</span>
          <h1>{user.name}</h1>
          <p className="muted">Customer since {formatDate(user.created_at)}</p>
          <ul className="profile-list">
            <li><Mail size={16} /> {user.email}</li>
            <li><Phone size={16} /> {user.phone}</li>
          </ul>
          <Link to="/orders" className="btn btn-soft btn-block"><Receipt size={16} /> All my orders</Link>
        </aside>

        <div className="account-main">
          {loading && <LoadingSpinner />}
          {error && !data && <ErrorState message={error} onRetry={reload} />}
          {data && (
            <>
              <section className="panel">
                <h2>Current order</h2>
                {current ? (
                  <div className="current-order">
                    <div className="current-order-head">
                      <div>
                        <strong>{current.restaurant_name}</strong>
                        <p className="muted">Order #{current.id}</p>
                      </div>
                      <StatusBadge status={current.status} />
                    </div>
                    <OrderTracker status={current.status} />
                    <Link to={`/orders/${current.id}`} className="btn btn-soft btn-sm">View order details</Link>
                  </div>
                ) : (
                  <p className="muted">You have no orders in progress. <Link to="/restaurants" className="text-link">Find something to eat</Link></p>
                )}
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h2>Recent orders</h2>
                  {data.orders.length > 3 && <Link to="/orders" className="text-link">See all</Link>}
                </div>
                {recent.length === 0 ? (
                  <p className="muted">{current ? 'Your earlier orders will appear here.' : 'You have not placed any orders yet.'}</p>
                ) : (
                  <div className="stack">{recent.map((o) => <OrderCard key={o.id} order={o} />)}</div>
                )}
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h2>Saved addresses</h2>
                  <button type="button" className="btn btn-soft btn-sm" onClick={() => setShowForm(true)}><Plus size={16} /> Add address</button>
                </div>
                {data.addresses.length === 0 ? (
                  <EmptyState icon={MapPin} title="No saved addresses" message="Add a delivery address to check out faster." />
                ) : (
                  <ul className="address-list">
                    {data.addresses.map((a) => (
                      <li key={a.id} className="address-item">
                        <MapPin size={18} className="option-icon" />
                        <div>
                          <strong>{a.full_address}</strong>
                          <p className="muted">{a.city} - {a.pincode}{a.phone ? ` - ${a.phone}` : ''}</p>
                        </div>
                        <button type="button" className="icon-btn" onClick={() => setToDelete(a)} aria-label="Delete address"><Trash2 size={18} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <Modal title="Add a delivery address" onClose={() => setShowForm(false)}>
          <AddressForm
            defaultPhone={user.phone}
            onCancel={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); toast.success('Address saved'); reload({ silent: true }); }}
          />
        </Modal>
      )}
      {toDelete && (
        <ConfirmDialog title="Delete this address?" message={toDelete.full_address} confirmLabel="Delete" danger busy={deleting} onConfirm={removeAddress} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}
