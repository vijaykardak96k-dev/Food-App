// The standard veg / non-veg square marker.
export default function VegMark({ veg }) {
  const isVeg = Boolean(veg);
  return (
    <span className={`veg-mark ${isVeg ? 'veg' : 'nonveg'}`} title={isVeg ? 'Vegetarian' : 'Non-vegetarian'} role="img" aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}>
      <i />
    </span>
  );
}
