import { Link } from 'react-router-dom';
import { CheckCheck, ClipboardList, Clock, Info, UtensilsCrossed } from 'lucide-react';
import { partnerApi } from '../../services/services.js';
import { useFetch, usePolling } from '../../hooks/useFetch.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import PartnerOrderCard from '../../components/PartnerOrderCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function PartnerDashboard() {
  const { data, loading, error, reload } = useFetch(async () => {
    const [dashboard, pending] = await Promise.all([partnerApi.dashboard(), partnerApi.orders('Pending')]);
    return { ...dashboard, pending: pending.orders };
  }, []);

  usePolling(() => reload({ silent: true }), 20000);

  if (loading) return <LoadingSpinner />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const { restaurant, stats, pending } = data;

  return (
    <>
      <PageHeader title={restaurant.name} subtitle="Here is how your restaurant is doing today" />

      {restaurant.status === 'Pending' && (
        <div className="alert alert-info"><Info size={18} /> Your restaurant is waiting for admin approval. Customers cannot see it yet, but you can already set up your menu.</div>
      )}
      {restaurant.status === 'Inactive' && (
        <div className="alert alert-error"><Info size={18} /> Your restaurant is inactive, so customers cannot see it or place new orders. Please contact the admin.</div>
      )}

      <div className="stat-grid">
        <StatCard icon={ClipboardList} label="Total orders" value={stats.total_orders} />
        <StatCard icon={Clock} label="Pending orders" value={stats.pending_orders} tone="amber" />
        <StatCard icon={CheckCheck} label="Completed orders" value={stats.completed_orders} tone="green" />
        <StatCard icon={UtensilsCrossed} label="Menu items" value={stats.food_items} tone="dark" />
      </div>

      <section className="dash-section">
        <div className="section-head">
          <h2>New orders waiting for you</h2>
          <Link to="/partner/orders" className="text-link">All orders</Link>
        </div>
        {pending.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No new orders right now" message="New orders appear here automatically." />
        ) : (
          <div className="partner-orders-grid">
            {pending.map((o) => <PartnerOrderCard key={o.id} order={o} onChanged={() => reload({ silent: true })} />)}
          </div>
        )}
      </section>
    </>
  );
}
