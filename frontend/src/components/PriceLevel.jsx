export default function PriceLevel({ level = 2 }) {
  const n = Math.min(Math.max(Number(level) || 1, 1), 3);
  return (
    <span className="price-level" title={`Price level ${n} of 3`}>
      {'₹'.repeat(n)}<span className="dim">{'₹'.repeat(3 - n)}</span>
    </span>
  );
}
