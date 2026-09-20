import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Store, UtensilsCrossed } from 'lucide-react';
import { catalogApi } from '../services/services.js';
import { imageUrl } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import FoodCard from '../components/FoodCard.jsx';
import FoodDetailModal from '../components/FoodDetailModal.jsx';
import Rating from '../components/Rating.jsx';
import PriceLevel from '../components/PriceLevel.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function RestaurantDetail() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => catalogApi.restaurant(id), [id]);
  const [category, setCategory] = useState('All');
  const [diet, setDiet] = useState('all');
  const [selectedFood, setSelectedFood] = useState(null);

  const foods = useMemo(() => {
    if (!data) return [];
    return data.foods.filter((f) => (category === 'All' || f.category_name === category)
      && (diet === 'all' || (diet === 'veg' ? f.is_veg : !f.is_veg)));
  }, [data, category, diet]);

  const categories = useMemo(() => (data ? ['All', ...new Set(data.foods.map((f) => f.category_name))] : []), [data]);

  const grouped = useMemo(() => {
    const groups = new Map();
    foods.forEach((f) => {
      if (!groups.has(f.category_name)) groups.set(f.category_name, []);
      groups.get(f.category_name).push(f);
    });
    return [...groups.entries()];
  }, [foods]);

  if (loading) return <LoadingSpinner label="Opening the menu..." />;
  if (error || !data) {
    return (
      <div className="container page-section">
        <EmptyState
          icon={Store}
          title="Restaurant unavailable"
          message={error || 'This restaurant is not available right now.'}
          action={<Link to="/restaurants" className="btn btn-primary">Browse restaurants</Link>}
        />
      </div>
    );
  }

  const { restaurant } = data;

  return (
    <>
      <section className="restaurant-hero">
        <div className="container restaurant-hero-inner">
          <div className="restaurant-hero-img"><img src={imageUrl(restaurant.image)} alt={restaurant.name} /></div>
          <div className="restaurant-hero-info">
            <h1>{restaurant.name}</h1>
            <p className="restaurant-cuisine">{restaurant.cuisine}</p>
            <p className="restaurant-hero-desc">{restaurant.description}</p>
            <div className="restaurant-meta restaurant-meta-lg">
              <Rating value={restaurant.rating} />
              <PriceLevel level={restaurant.price_level} />
              <span className="restaurant-location"><MapPin size={15} /> {restaurant.location}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container page-section">
        <div className="menu-toolbar">
          <div className="chip-row" role="tablist" aria-label="Menu categories">
            {categories.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={category === c} className={`chip chip-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <div className="segmented" role="group" aria-label="Diet filter">
            {[['all', 'All'], ['veg', 'Veg'], ['nonveg', 'Non-veg']].map(([value, label]) => (
              <button key={value} type="button" className={diet === value ? 'active' : ''} onClick={() => setDiet(value)}>{label}</button>
            ))}
          </div>
        </div>

        {grouped.length === 0 && (
          <EmptyState icon={UtensilsCrossed} title="No dishes match" message="Try a different category or diet filter." action={<button type="button" className="btn btn-soft" onClick={() => { setCategory('All'); setDiet('all'); }}>Clear filters</button>} />
        )}

        {grouped.map(([name, items]) => (
          <section key={name} className="menu-section">
            <h2>{name} <span className="muted">{items.length}</span></h2>
            <div className="grid grid-food">
              {items.map((f) => <FoodCard key={f.id} food={f} onOpen={(food) => setSelectedFood(food.id)} />)}
            </div>
          </section>
        ))}
      </div>

      {selectedFood && <FoodDetailModal foodId={selectedFood} onClose={() => setSelectedFood(null)} />}
    </>
  );
}
