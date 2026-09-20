import { Link } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { catalogApi } from '../services/services.js';
import { imageUrl } from '../services/api.js';
import { formatPrice } from '../utils/format.js';
import { useFetch } from '../hooks/useFetch.js';
import { useCart, useAddToCart } from '../context/CartContext.jsx';
import Modal from './Modal.jsx';
import VegMark from './VegMark.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import ErrorState from './ErrorState.jsx';
import QuantityStepper from './QuantityStepper.jsx';

export default function FoodDetailModal({ foodId, onClose }) {
  const { data, loading, error } = useFetch(() => catalogApi.food(foodId), [foodId]);
  const { itemFor, setQuantity, isCustomer } = useCart();
  const addToCart = useAddToCart();
  const food = data?.food;
  const inCart = food && isCustomer ? itemFor(food.id) : null;

  return (
    <Modal title={food ? food.name : 'Food details'} onClose={onClose} size="lg">
      {loading && <LoadingSpinner />}
      {error && !food && <ErrorState message={error} />}
      {food && (
        <div className="food-detail">
          <div className="food-detail-media"><img src={imageUrl(food.image)} alt={food.name} /></div>
          <div className="food-detail-info">
            <div className="food-detail-tags">
              <VegMark veg={food.is_veg} />
              <span className="chip">{food.category_name}</span>
              <span className={`chip ${food.is_available ? 'chip-green' : 'chip-red'}`}>{food.is_available ? 'Available' : 'Currently unavailable'}</span>
            </div>
            <p className="food-detail-desc">{food.description || 'No description added yet.'}</p>
            <Link to={`/restaurants/${food.restaurant_id}`} className="food-detail-restaurant" onClick={onClose}>
              <strong>{food.restaurant_name}</strong>
              <span><MapPin size={14} /> {food.restaurant_location}</span>
            </Link>
            <div className="food-detail-buy">
              <span className="food-detail-price">{formatPrice(food.price)}</span>
              {inCart ? (
                <QuantityStepper value={inCart.quantity} onChange={(q) => setQuantity(inCart.id, q)} />
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => addToCart(food)} disabled={!food.is_available}>
                  <Plus size={18} strokeWidth={2.5} /> Add to cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
