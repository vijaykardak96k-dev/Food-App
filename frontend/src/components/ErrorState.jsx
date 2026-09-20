import { TriangleAlert } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="empty-state">
      <span className="empty-icon empty-icon-error"><TriangleAlert size={30} strokeWidth={1.75} /></span>
      <h3>We couldn't load this</h3>
      <p>{message || 'Something went wrong. Please try again.'}</p>
      {onRetry && <div className="empty-action"><button type="button" className="btn btn-primary" onClick={() => onRetry()}>Try again</button></div>}
    </div>
  );
}
