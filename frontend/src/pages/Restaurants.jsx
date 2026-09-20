import { useState } from 'react';
import { Store } from 'lucide-react';
import { catalogApi } from '../services/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { plural } from '../utils/format.js';
import SearchBar from '../components/SearchBar.jsx';
import RestaurantCard from '../components/RestaurantCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Restaurants() {
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useFetch(() => catalogApi.restaurants({ q }), [q]);

  return (
    <div className="container page-section">
      <PageHeader title="Restaurants" subtitle="Kitchens that deliver to you" />
      <div className="toolbar">
        <SearchBar onSearch={setQ} defaultValue={q} placeholder="Search restaurants by name or cuisine" />
      </div>

      {loading && <LoadingSpinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && data.restaurants.length === 0 && (
        <EmptyState icon={Store} title="No restaurants found" message={q ? `Nothing matches "${q}". Try another name or cuisine.` : 'No restaurants are open right now. Please check back soon.'} />
      )}
      {data && data.restaurants.length > 0 && (
        <>
          <p className="result-count">{plural(data.restaurants.length, 'restaurant')}{q ? ` matching "${q}"` : ''}</p>
          <div className="grid grid-restaurants">
            {data.restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        </>
      )}
    </div>
  );
}
