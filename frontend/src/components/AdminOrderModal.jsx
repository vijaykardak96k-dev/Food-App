import { adminApi } from '../services/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { PAYMENT_LABELS, formatDateTime, formatPrice } from '../utils/format.js';
import Modal from './Modal.jsx';
import StatusBadge from './StatusBadge.jsx';
import OrderTracker from './OrderTracker.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import ErrorState from './ErrorState.jsx';

// Read-only order details for the admin. Admins do not change order status.
export default function AdminOrderModal({ orderId, onClose }) {
  const { data, loading, error } = useFetch(() => adminApi.order(orderId), [orderId]);
  const order = data?.order;

  return (
    <Modal title={`Order #${orderId}`} onClose={onClose} size="lg">
      {loading && <LoadingSpinner />}
      {error && !order && <ErrorState message={error} />}
      {order && (
        <div className="admin-order">
          <div className="admin-order-top">
            <StatusBadge status={order.status} />
            <span className="muted">{formatDateTime(order.created_at)}</span>
          </div>
          <div className="admin-order-grid">
            <div>
              <h3>Customer</h3>
              <p><strong>{order.customer_name}</strong></p>
              <p className="muted">{order.customer_email}</p>
              <p className="muted">{order.delivery_phone || order.customer_phone}</p>
              <h3>Delivery address</h3>
              <p>{order.delivery_address}</p>
              <h3>Restaurant</h3>
              <p><strong>{order.restaurant_name}</strong></p>
              <p className="muted">{order.restaurant_location}</p>
              <h3>Payment</h3>
              <p>{PAYMENT_LABELS[order.payment_method]} - {order.payment_status}</p>
            </div>
            <div>
              <h3>Items</h3>
              <table className="items-table">
                <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Total</th></tr></thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.id}><td>{i.food_name}<small className="muted block">{formatPrice(i.unit_price)} each</small></td><td className="num">{i.quantity}</td><td className="num">{formatPrice(i.line_total)}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan={2}>Total</td><td className="num">{formatPrice(order.total_amount)}</td></tr></tfoot>
              </table>
              <h3>Progress</h3>
              <OrderTracker status={order.status} />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
