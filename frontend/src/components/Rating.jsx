import { Star } from 'lucide-react';

export default function Rating({ value }) {
  const n = Number(value);
  if (!n) return <span className="rating rating-new">New</span>;
  return (
    <span className="rating">
      <Star size={13} fill="currentColor" strokeWidth={0} />
      {n.toFixed(1)}
    </span>
  );
}
