import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { imageUrl } from '../services/api.js';
import { formatDateTime, formatPrice, itemSummary } from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';

export default function OrderCard({ order }) {
  return (
    <Link to={`/orders/${order.id}`} className="order-card">
      <img className="order-card-img" src={imageUrl(order.restaurant_image)} alt="" loading="lazy" />
      <div className="order-card-main">
        <div className="order-card-top">
          <h3>{order.restaurant_name}</h3>
          <StatusBadge status={order.status} />
        </div>
        <p className="order-card-items">{itemSummary(order.items)}</p>
        <p className="muted">Order #{order.id} - {formatDateTime(order.created_at)}</p>
      </div>
      <div className="order-card-side">
        <strong>{formatPrice(order.total_amount)}</strong>
        <span className="order-card-link">View details <ChevronRight size={16} /></span>
      </div>
    </Link>
  );
}
