import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { orderApi } from '../services/services.js';
import { useFetch } from '../hooks/useFetch.js';
import OrderCard from '../components/OrderCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function MyOrders() {
  const { data, loading, error, reload } = useFetch(() => orderApi.list(), []);
  return (
    <div className="container page-section narrow">
      <PageHeader title="My orders" subtitle="Everything you have ordered on Cravo" />
      {loading && <LoadingSpinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && data.orders.length === 0 && (
        <EmptyState icon={Receipt} title="No orders yet" message="When you place an order it will show up here." action={<Link to="/restaurants" className="btn btn-primary">Order something</Link>} />
      )}
      {data && data.orders.length > 0 && <div className="stack">{data.orders.map((o) => <OrderCard key={o.id} order={o} />)}</div>}
    </div>
  );
}
