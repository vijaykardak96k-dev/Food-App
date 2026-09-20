import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { imageUrl } from '../services/api.js';
import { formatPrice } from '../utils/format.js';
import { useCart, useAddToCart } from '../context/CartContext.jsx';
import VegMark from './VegMark.jsx';
import QuantityStepper from './QuantityStepper.jsx';

// onOpen(food) opens the food detail dialog.
export default function FoodCard({ food, onOpen, showRestaurant = false }) {
  const { itemFor, setQuantity, isCustomer } = useCart();
  const addToCart = useAddToCart();
  const inCart = isCustomer ? itemFor(food.id) : null;
  const available = Boolean(food.is_available);

  return (
    <article className={`food-card ${available ? '' : 'unavailable'}`}>
      <button type="button" className="food-media" onClick={() => onOpen?.(food)} aria-label={`View details of ${food.name}`}>
        <img src={imageUrl(food.image)} alt={food.name} loading="lazy" />
        <span className="food-veg"><VegMark veg={food.is_veg} /></span>
        {!available && <span className="food-soldout">Currently unavailable</span>}
      </button>
      <div className="food-body">
        <h3 className="food-name">{food.name}</h3>
        {showRestaurant && (
          <Link to={`/restaurants/${food.restaurant_id}`} className="food-restaurant">{food.restaurant_name}</Link>
        )}
        <p className="food-desc">{food.description}</p>
        <div className="food-footer">
          <span className="food-price">{formatPrice(food.price)}</span>
          {inCart ? (
            <QuantityStepper value={inCart.quantity} min={0} onChange={(q) => setQuantity(inCart.id, q)} size="sm" />
          ) : (
            <button type="button" className="btn btn-soft btn-sm" onClick={() => addToCart(food)} disabled={!available}>
              <Plus size={16} strokeWidth={2.5} /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
