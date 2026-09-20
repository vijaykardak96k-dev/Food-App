export default function LoadingSpinner({ label = 'Loading...', inline = false }) {
  return (
    <div className={inline ? 'spinner-inline' : 'spinner-block'} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
