// Coloured pill for order, restaurant and account statuses.
export default function StatusBadge({ status, label }) {
  const key = String(status).toLowerCase();
  return <span className={`badge badge-${key}`}>{label || status}</span>;
}
