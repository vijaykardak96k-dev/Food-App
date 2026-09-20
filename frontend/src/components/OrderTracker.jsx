import { Check, X } from 'lucide-react';

const STEPS = [
  { key: 'Placed', label: 'Order placed', hint: 'Your order was sent to the restaurant' },
  { key: 'Accepted', label: 'Accepted', hint: 'The restaurant confirmed your order' },
  { key: 'Preparing', label: 'Preparing', hint: 'Your food is being cooked' },
  { key: 'Ready', label: 'Ready', hint: 'Your order is packed and ready' },
  { key: 'Completed', label: 'Completed', hint: 'Your order has been delivered' },
];
const POSITION = { Pending: 0, Accepted: 1, Preparing: 2, Ready: 3, Completed: 4 };

export default function OrderTracker({ status, horizontal = false }) {
  if (status === 'Rejected') {
    return (
      <div className="tracker-rejected">
        <span className="tracker-dot rejected"><X size={16} strokeWidth={3} /></span>
        <div>
          <strong>Order rejected</strong>
          <p className="muted">The restaurant could not accept this order. You have not been charged.</p>
        </div>
      </div>
    );
  }

  const position = POSITION[status] ?? 0;
  const stateOf = (index) => {
    if (index < position) return 'done';
    if (index === position) return status === 'Pending' || status === 'Completed' ? 'done' : 'active';
    if (index === position + 1 && status === 'Pending') return 'active';
    return 'todo';
  };

  return (
    <ol className={`tracker ${horizontal ? 'tracker-h' : ''}`} aria-label={`Order status: ${status}`}>
      {STEPS.map((step, index) => {
        const state = stateOf(index);
        const hint = index === 1 && status === 'Pending' ? 'Waiting for the restaurant' : step.hint;
        return (
          <li key={step.key} className={`tracker-step ${state}`}>
            <span className="tracker-dot">{state === 'done' && <Check size={14} strokeWidth={3.5} />}</span>
            <div className="tracker-text">
              <strong>{step.label}</strong>
              <small>{hint}</small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
