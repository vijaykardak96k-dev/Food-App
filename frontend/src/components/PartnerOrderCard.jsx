import { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { partnerApi } from '../services/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { PAYMENT_LABELS, formatPrice, timeAgo } from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

// What the restaurant can do next for each status.
const NEXT_ACTION = {
  Accepted: { status: 'Preparing', label: 'Start preparing' },
  Preparing: { status: 'Ready', label: 'Mark as ready' },
  Ready: { status: 'Completed', label: 'Mark as completed' },
};

export default function PartnerOrderCard({ order, onChanged }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  const change = async (status) => {
    setBusy(true);
    try {
      await partnerApi.updateOrderStatus(order.id, status);
      toast.success(`Order #${order.id} marked as ${status.toLowerCase()}`);
      setConfirmReject(false);
      onChanged();
    } catch (err) {
      toast.error(err.message);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const next = NEXT_ACTION[order.status];

  return (
    <article className="partner-order">
      <header className="partner-order-head">
        <div>
          <h3>Order #{order.id}</h3>
          <p className="muted">{timeAgo(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="partner-order-customer">
        <strong>{order.customer_name}</strong>
        <span><Phone size={14} /> {order.delivery_phone || order.customer_phone}</span>
      </div>

      <ul className="partner-order-items">
        {order.items.map((i) => (
          <li key={i.id}><span>{i.quantity} x {i.food_name}</span><span>{formatPrice(i.line_total)}</span></li>
        ))}
      </ul>

      <p className="partner-order-address"><MapPin size={14} /> {order.delivery_address}</p>

      <div className="partner-order-total">
        <span className="muted">{PAYMENT_LABELS[order.payment_method]} - {order.payment_status}</span>
        <strong>{formatPrice(order.total_amount)}</strong>
      </div>

      {order.status === 'Pending' && (
        <div className="partner-order-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmReject(true)} disabled={busy}>Reject</button>
          <button type="button" className="btn btn-primary" onClick={() => change('Accepted')} disabled={busy}>Accept order</button>
        </div>
      )}
      {next && (
        <div className="partner-order-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={() => change(next.status)} disabled={busy}>{next.label}</button>
        </div>
      )}

      {confirmReject && (
        <ConfirmDialog
          title={`Reject order #${order.id}?`}
          message="The customer will see that the order was rejected. This cannot be undone."
          confirmLabel="Reject order"
          danger
          busy={busy}
          onConfirm={() => change('Rejected')}
          onCancel={() => setConfirmReject(false)}
        />
      )}
    </article>
  );
}
