import { catalogApi } from '../services/services.js';
import { useFetch } from '../hooks/useFetch.js';
import CategoryCard from '../components/CategoryCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Categories() {
  const { data, loading, error, reload } = useFetch(() => catalogApi.categories(), []);
  return (
    <div className="container page-section">
      <PageHeader title="Categories" subtitle="Pick a craving and see who serves it" />
      {loading && <LoadingSpinner />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {data && <div className="category-grid">{data.categories.map((c) => <CategoryCard key={c.id} category={c} />)}</div>}
    </div>
  );
}
