import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { partnerApi } from '../../services/services.js';
import { useFetch, usePolling } from '../../hooks/useFetch.js';
import PageHeader from '../../components/PageHeader.jsx';
import PartnerOrderCard from '../../components/PartnerOrderCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const TABS = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Rejected'];

export default function PartnerOrders() {
  const [tab, setTab] = useState('All');
  const { data, loading, error, reload } = useFetch(() => partnerApi.orders(), []);
  usePolling(() => reload({ silent: true }), 20000);

  if (loading) return <LoadingSpinner />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const orders = data.orders;
  const count = (status) => (status === 'All' ? orders.length : orders.filter((o) => o.status === status).length);
  const visible = tab === 'All' ? orders : orders.filter((o) => o.status === tab);

  return (
    <>
      <PageHeader title="Orders" subtitle="Accept new orders and move them through the kitchen" />
      <div className="chip-row tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`chip chip-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} <span className="chip-count">{count(t)}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={ClipboardList} title={tab === 'All' ? 'No orders yet' : `No ${tab.toLowerCase()} orders`} message="New orders show up here automatically." />
      ) : (
        <div className="partner-orders-grid">
          {visible.map((o) => <PartnerOrderCard key={o.id} order={o} onChanged={() => reload({ silent: true })} />)}
        </div>
      )}
    </>
  );
}
