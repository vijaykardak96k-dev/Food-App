import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`logo ${light ? 'logo-light' : ''}`} aria-label="Cravo home">
      <span className="logo-mark"><UtensilsCrossed size={18} strokeWidth={2.4} /></span>
      <span className="logo-word">Cravo</span>
    </Link>
  );
}
