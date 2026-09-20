import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, Store } from 'lucide-react';
import { catalogApi } from '../services/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { plural } from '../utils/format.js';
import SearchBar from '../components/SearchBar.jsx';
import FoodCard from '../components/FoodCard.jsx';
import FoodDetailModal from '../components/FoodDetailModal.jsx';
import RestaurantCard from '../components/RestaurantCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const veg = params.get('veg') || '';
  const sort = params.get('sort') || '';
  const [selectedFood, setSelectedFood] = useState(null);

  const categoriesReq = useFetch(() => catalogApi.categories(), []);
  const { data, loading, error, reload } = useFetch(() => catalogApi.search({ q, category, veg, sort }), [q, category, veg, sort]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next);
  };

  const categories = categoriesReq.data?.categories || [];
  const activeCategory = categories.find((c) => String(c.id) === category);
  const hasFilters = Boolean(q || category || veg || sort);
  const title = q ? `Search results for "${q}"` : activeCategory ? activeCategory.name : 'Browse all food';

  return (
    <div className="container page-section">
      <div className="search-head">
        <h1>{title}</h1>
        <SearchBar defaultValue={q} onSearch={(value) => update({ q: value })} />
      </div>

      <div className="filters">
        <div className="chip-row" aria-label="Category filter">
          <button type="button" className={`chip chip-btn ${!category ? 'active' : ''}`} onClick={() => update({ category: '' })}>All</button>
          {categories.map((c) => (
            <button key={c.id} type="button" className={`chip chip-btn ${String(c.id) === category ? 'active' : ''}`} onClick={() => update({ category: String(c.id) })}>{c.name}</button>
          ))}
        </div>
        <div className="filters-right">
          <div className="segmented" role="group" aria-label="Diet filter">
            {[['', 'All'], ['veg', 'Veg'], ['nonveg', 'Non-veg']].map(([value, label]) => (
              <button key={label} type="button" className={veg === value ? 'active' : ''} onClick={() => update({ veg: value })}>{label}</button>
            ))}
          </div>
          <select className="input select-sm" value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort by price">
            <option value="">Sort: Recommended</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner label="Searching..." />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="search-layout">
          <section aria-labelledby="foods-heading">
            <h2 id="foods-heading" className="column-title">Foods <span className="muted">{data.foods.length}</span></h2>
            {data.foods.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={q ? `No food found for "${q}"` : 'No food matches these filters'}
                message="Check the spelling, try a shorter word like 'chicken', or clear your filters."
                action={hasFilters && <button type="button" className="btn btn-soft" onClick={() => setParams({})}>Clear search and filters</button>}
              />
            ) : (
              <div className="grid grid-food grid-food-2">
                {data.foods.map((f) => <FoodCard key={f.id} food={f} showRestaurant onOpen={(food) => setSelectedFood(food.id)} />)}
              </div>
            )}
          </section>

          <section aria-labelledby="restaurants-heading">
            <h2 id="restaurants-heading" className="column-title">Restaurants <span className="muted">{data.restaurants.length}</span></h2>
            {data.restaurants.length === 0 ? (
              <EmptyState icon={Store} title="No restaurants found" message={q ? `No restaurant name or cuisine matches "${q}".` : 'No restaurants for this filter.'} />
            ) : (
              <div className="stack">
                {data.restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} compact />)}
              </div>
            )}
          </section>
        </div>
      )}
      {data && <p className="sr-only" aria-live="polite">{plural(data.foods.length, 'food item')} found</p>}

      {selectedFood && <FoodDetailModal foodId={selectedFood} onClose={() => setSelectedFood(null)} />}
    </div>
  );
}
