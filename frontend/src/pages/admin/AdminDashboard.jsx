import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Store, UtensilsCrossed, Users } from 'lucide-react';
import { adminApi } from '../../services/services.js';
import { useFetch } from '../../hooks/useFetch.js';
import { formatDateTime, formatPrice } from '../../utils/format.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import AdminOrderModal from '../../components/AdminOrderModal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';

const STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Rejected'];

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(() => adminApi.dashboard(), []);
  const [orderId, setOrderId] = useState(null);

  if (loading) return <LoadingSpinner />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const { stats, orders_by_status: byStatus, recent_orders: recent } = data;
  const max = Math.max(1, ...STATUSES.map((s) => byStatus[s] || 0));
  const pendingCount = Number(stats.pending_restaurants);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick look at everything happening on Cravo" />

      <div className="stat-grid">
        <StatCard icon={Users} label="Total users" value={stats.users} />
        <StatCard icon={Store} label="Total restaurants" value={stats.restaurants} tone="green" hint={pendingCount > 0 ? `${pendingCount} waiting for approval` : undefined} />
        <StatCard icon={UtensilsCrossed} label="Total food items" value={stats.foods} tone="amber" />
        <StatCard icon={ClipboardList} label="Total orders" value={stats.orders} tone="dark" />
      </div>

      {pendingCount > 0 && (
        <div className="alert alert-info">
          {pendingCount} restaurant{pendingCount === 1 ? ' is' : 's are'} waiting for approval. <Link to="/admin/restaurants" className="text-link">Review now</Link>
        </div>
      )}

      <div className="dash-two-col">
        <section className="panel">
          <h2>Orders by status</h2>
          <ul className="bar-list">
            {STATUSES.map((s) => (
              <li key={s}>
                <span className="bar-label">{s}</span>
                <span className="bar-track"><span className={`bar-fill bar-${s.toLowerCase()}`} style={{ width: `${((byStatus[s] || 0) / max) * 100}%` }} /></span>
                <span className="bar-value">{byStatus[s] || 0}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Latest orders</h2><Link to="/admin/orders" className="text-link">View all</Link></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Order</th><th>Customer</th><th className="num">Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="clickable" onClick={() => setOrderId(o.id)}>
                    <td><strong>#{o.id}</strong><small className="muted block">{formatDateTime(o.created_at)}</small></td>
                    <td>{o.customer_name}<small className="muted block">{o.restaurant_name}</small></td>
                    <td className="num">{formatPrice(o.total_amount)}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
                {recent.length === 0 && <tr><td colSpan={4} className="muted">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {orderId && <AdminOrderModal orderId={orderId} onClose={() => setOrderId(null)} />}
    </>
  );
}
