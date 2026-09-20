import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Phone, Receipt } from 'lucide-react';
import { orderApi } from '../services/services.js';
import { useFetch, usePolling } from '../hooks/useFetch.js';
import { PAYMENT_LABELS, formatDateTime, formatPrice } from '../utils/format.js';
import OrderTracker from '../components/OrderTracker.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

const ACTIVE = ['Pending', 'Accepted', 'Preparing', 'Ready'];

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { data, loading, error, reload } = useFetch(() => orderApi.get(id), [id]);
  const order = data?.order;

  // keep the status fresh while the order is still moving
  usePolling(() => reload({ silent: true }), 15000, Boolean(order && ACTIVE.includes(order.status)));

  if (loading) return <LoadingSpinner />;
  if (!order) {
    return (
      <div className="container page-section">
        <EmptyState icon={Receipt} title="Order not found" message={error || 'We could not find this order.'} action={<Link to="/orders" className="btn btn-primary">Back to my orders</Link>} />
      </div>
    );
  }

  return (
    <div className="container page-section narrow">
      <Link to="/orders" className="back-link"><ArrowLeft size={16} /> My orders</Link>

      {location.state?.placed && (
        <div className="placed-banner">
          <span className="placed-check"><Check size={22} strokeWidth={3} /></span>
          <div>
            <strong>Thank you! Your order has been placed.</strong>
            <p>You can follow its progress below. This page refreshes automatically.</p>
          </div>
        </div>
      )}

      <div className="order-head">
        <div>
          <h1>Order #{order.id}</h1>
          <p className="muted">{formatDateTime(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-layout">
        <section className="panel">
          <h2>Order status</h2>
          <OrderTracker status={order.status} />
        </section>

        <div className="stack">
          <section className="panel">
            <h2>{order.restaurant_name}</h2>
            <table className="items-table">
              <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Price</th><th className="num">Total</th></tr></thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.food_name}</td>
                    <td className="num">{i.quantity}</td>
                    <td className="num">{formatPrice(i.unit_price)}</td>
                    <td className="num">{formatPrice(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="summary-rows">
              <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="summary-total"><dt>Total</dt><dd>{formatPrice(order.total_amount)}</dd></div>
            </dl>
          </section>

          <section className="panel">
            <h2>Delivery and payment</h2>
            <ul className="detail-list">
              <li><MapPin size={18} /><span><strong>Delivery address</strong>{order.delivery_address}</span></li>
              {order.delivery_phone && <li><Phone size={18} /><span><strong>Contact number</strong>{order.delivery_phone}</span></li>}
              <li><Receipt size={18} /><span><strong>Payment</strong>{PAYMENT_LABELS[order.payment_method]} - {order.payment_status}</span></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
