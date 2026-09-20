import { useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../services/services.js';
import { imageUrl } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import SearchBar from '../components/SearchBar.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import FoodCard from '../components/FoodCard.jsx';
import FoodDetailModal from '../components/FoodDetailModal.jsx';
import RestaurantCard from '../components/RestaurantCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

const QUICK_SEARCHES = ['Biryani', 'Pizza', 'Burger', 'Dosa', 'Momos'];

export default function Home() {
  const [selectedFood, setSelectedFood] = useState(null);
  const { data, loading, error, reload } = useFetch(async () => {
    const [categories, popular, restaurants] = await Promise.all([
      catalogApi.categories(), catalogApi.popularFoods(), catalogApi.restaurants(),
    ]);
    return { categories: categories.categories, foods: popular.foods, restaurants: restaurants.restaurants };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>What are you craving today?</h1>
            <p>Order from local kitchens you love. Cooked fresh, followed live, delivered to your door.</p>
            <SearchBar large />
            <div className="quick-searches">
              <span>Try</span>
              {QUICK_SEARCHES.map((term) => (
                <Link key={term} to={`/search?q=${term.toLowerCase()}`} className="chip chip-link">{term}</Link>
              ))}
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-dish hero-dish-main"><img src={imageUrl('/images/categories/biryani.svg')} alt="" /></div>
            <div className="hero-dish hero-dish-a"><img src={imageUrl('/images/categories/pizza.svg')} alt="" /></div>
            <div className="hero-dish hero-dish-b"><img src={imageUrl('/images/categories/desserts.svg')} alt="" /></div>
            <div className="hero-dish hero-dish-c"><img src={imageUrl('/images/categories/burger.svg')} alt="" /></div>
          </div>
        </div>
      </section>

      {loading && <LoadingSpinner label="Fetching today's menu..." />}
      {error && !data && <div className="container"><ErrorState message={error} onRetry={reload} /></div>}

      {data && (
        <>
          <section className="section">
            <div className="container">
              <div className="section-head">
                <h2>Browse by category</h2>
                <Link to="/categories" className="text-link">See all</Link>
              </div>
              <div className="category-strip">
                {data.categories.map((c) => <CategoryCard key={c.id} category={c} />)}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="section-head">
                <h2>Popular near you</h2>
                <Link to="/search" className="text-link">Browse all food</Link>
              </div>
              <div className="grid grid-food">
                {data.foods.map((f) => <FoodCard key={f.id} food={f} showRestaurant onOpen={(food) => setSelectedFood(food.id)} />)}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="section-head">
                <h2>Restaurants for you</h2>
                <Link to="/restaurants" className="text-link">View all</Link>
              </div>
              <div className="grid grid-restaurants">
                {data.restaurants.slice(0, 6).map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="partner-cta">
                <div>
                  <h2>Run a restaurant?</h2>
                  <p>List your menu on Cravo, manage incoming orders in one place and reach hungry customers nearby.</p>
                </div>
                <Link to="/register-restaurant" className="btn btn-dark btn-lg">Register your restaurant</Link>
              </div>
            </div>
          </section>
        </>
      )}

      {selectedFood && <FoodDetailModal foodId={selectedFood} onClose={() => setSelectedFood(null)} />}
    </>
  );
}
