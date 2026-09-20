import { Trash2 } from 'lucide-react';
import { imageUrl } from '../services/api.js';
import { formatPrice } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import VegMark from './VegMark.jsx';
import QuantityStepper from './QuantityStepper.jsx';

export default function CartItem({ item }) {
  const { setQuantity } = useCart();
  return (
    <li className={`cart-item ${item.is_available ? '' : 'unavailable'}`}>
      <img className="cart-item-img" src={imageUrl(item.image)} alt={item.name} />
      <div className="cart-item-info">
        <div className="cart-item-title"><VegMark veg={item.is_veg} /><h3>{item.name}</h3></div>
        <p className="muted">{formatPrice(item.price)} each</p>
        {!item.is_available && <p className="cart-item-warning">No longer available - remove it to continue</p>}
      </div>
      <QuantityStepper value={item.quantity} min={0} onChange={(q) => setQuantity(item.id, q)} />
      <strong className="cart-item-total">{formatPrice(item.line_total)}</strong>
      <button type="button" className="icon-btn" onClick={() => setQuantity(item.id, 0)} aria-label={`Remove ${item.name}`}><Trash2 size={18} /></button>
    </li>
  );
}
