import { Link } from 'react-router-dom';
import { imageUrl } from '../services/api.js';

export default function CategoryCard({ category, active = false }) {
  return (
    <Link to={`/search?category=${category.id}`} className={`category-card ${active ? 'active' : ''}`}>
      <span className="category-thumb">
        <img src={imageUrl(category.image)} alt="" loading="lazy" />
      </span>
      <span className="category-name">{category.name}</span>
      {category.food_count !== undefined && <span className="category-count">{category.food_count} dishes</span>}
    </Link>
  );
}
