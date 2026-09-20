import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { adminApi } from '../../services/services.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatDateTime, formatPrice } from '../../utils/format.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import AdminOrderModal from '../../components/AdminOrderModal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Rejected'];

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const q = useDebounce(search);
  const { data, loading, error, reload } = useFetch(() => adminApi.orders({ status, q }), [status, q]);
  const [orderId, setOrderId] = useState(null);

  return (
    <>
      <PageHeader title="Orders" subtitle="All orders across every restaurant (view only)" />
      <div className="toolbar toolbar-row">
        <input className="input" type="search" placeholder="Search by order number, customer or restaurant" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search orders" />
        <select className="input select-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && data.orders.length === 0 && <EmptyState icon={ClipboardList} title="No orders found" message="Try a different filter." />}
      {data && data.orders.length > 0 && (
        <div className="panel table-panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Restaurant</th><th className="num">Items</th><th className="num">Amount</th><th>Status</th></tr></thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id} className="clickable" onClick={() => setOrderId(o.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOrderId(o.id); }}>
                    <td><strong>#{o.id}</strong><small className="muted block">{formatDateTime(o.created_at)}</small></td>
                    <td>{o.customer_name}</td>
                    <td>{o.restaurant_name}</td>
                    <td className="num">{o.item_count}</td>
                    <td className="num">{formatPrice(o.total_amount)}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {orderId && <AdminOrderModal orderId={orderId} onClose={() => setOrderId(null)} />}
    </>
  );
}
