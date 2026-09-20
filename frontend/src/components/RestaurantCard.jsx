import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { imageUrl } from '../services/api.js';
import Rating from './Rating.jsx';
import PriceLevel from './PriceLevel.jsx';

export default function RestaurantCard({ restaurant, compact = false }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className={`restaurant-card ${compact ? 'compact' : ''}`}>
      <div className="restaurant-media">
        <img src={imageUrl(restaurant.image)} alt={restaurant.name} loading="lazy" />
      </div>
      <div className="restaurant-body">
        <h3>{restaurant.name}</h3>
        <p className="restaurant-cuisine">{restaurant.cuisine}</p>
        <div className="restaurant-meta">
          <Rating value={restaurant.rating} />
          <PriceLevel level={restaurant.price_level} />
          {restaurant.food_count !== undefined && !compact && <span className="muted">{restaurant.food_count} dishes</span>}
        </div>
        <p className="restaurant-location"><MapPin size={14} /> {restaurant.location}</p>
      </div>
    </Link>
  );
}
