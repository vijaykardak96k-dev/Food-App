import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({ value, onChange, min = 0, max = 20, size = 'md' }) {
  return (
    <div className={`stepper stepper-${size}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity"><Minus size={14} strokeWidth={2.5} /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity"><Plus size={14} strokeWidth={2.5} /></button>
    </div>
  );
}
