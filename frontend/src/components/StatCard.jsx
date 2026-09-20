export default function StatCard({ icon: Icon, label, value, tone = 'accent', hint }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span className="stat-icon"><Icon size={20} strokeWidth={2} /></span>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        {hint && <p className="stat-hint">{hint}</p>}
      </div>
    </div>
  );
}
