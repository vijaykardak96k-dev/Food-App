import { useState } from 'react';
import { Store } from 'lucide-react';
import { adminApi } from '../../services/services.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/format.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const TABS = ['All', 'Pending', 'Approved', 'Inactive'];

export default function AdminRestaurants() {
  const toast = useToast();
  const [tab, setTab] = useState('All');
  const { data, loading, error, reload } = useFetch(() => adminApi.restaurants({ status: tab === 'All' ? '' : tab }), [tab]);
  const [pendingChange, setPendingChange] = useState(null); // { restaurant, status }
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    setBusy(true);
    try {
      await adminApi.setRestaurantStatus(pendingChange.restaurant.id, pendingChange.status);
      toast.success(`${pendingChange.restaurant.name} is now ${pendingChange.status.toLowerCase()}`);
      setPendingChange(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Restaurants" subtitle="Only approved restaurants are visible to customers" />
      <div className="chip-row tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`chip chip-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && data.restaurants.length === 0 && <EmptyState icon={Store} title="No restaurants here" message="Nothing matches this filter." />}
      {data && data.restaurants.length > 0 && (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Restaurant</th><th>Owner</th><th>Registered</th><th className="num">Food</th><th className="num">Orders</th><th>Status</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {data.restaurants.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong><small className="muted block">{r.cuisine} - {r.location}</small></td>
                    <td>{r.owner_name}<small className="muted block">{r.owner_email}</small></td>
                    <td>{formatDate(r.created_at)}</td>
                    <td className="num">{r.food_count}</td>
                    <td className="num">{r.order_count}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="num actions">
                      {r.status !== 'Approved' && (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setPendingChange({ restaurant: r, status: 'Approved' })}>
                          {r.status === 'Pending' ? 'Approve' : 'Reactivate'}
                        </button>
                      )}
                      {r.status === 'Approved' && (
                        <button type="button" className="btn btn-soft-danger btn-sm" onClick={() => setPendingChange({ restaurant: r, status: 'Inactive' })}>Deactivate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingChange && (
        <ConfirmDialog
          title={`${pendingChange.status === 'Approved' ? 'Approve' : 'Deactivate'} ${pendingChange.restaurant.name}?`}
          message={pendingChange.status === 'Approved' ? 'Customers will be able to see this restaurant and order from it.' : 'The restaurant will be hidden from customers and cannot receive new orders.'}
          confirmLabel={pendingChange.status === 'Approved' ? 'Approve' : 'Deactivate'}
          danger={pendingChange.status !== 'Approved'}
          busy={busy}
          onConfirm={apply}
          onCancel={() => setPendingChange(null)}
        />
      )}
    </>
  );
}
