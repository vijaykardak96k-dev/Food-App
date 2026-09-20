import { imageUrl } from '../services/api.js';

// Two-column layout shared by the login and register pages.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-art" aria-hidden="true">
        <div className="auth-art-plate"><img src={imageUrl('/images/categories/biryani.svg')} alt="" /></div>
        <p className="auth-art-title">Good food, without the wait.</p>
        <p className="auth-art-text">Order from your favourite local kitchens and follow your order every step of the way.</p>
      </aside>
      <section className="auth-panel">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
          {children}
          {footer && <p className="auth-footer">{footer}</p>}
        </div>
      </section>
    </div>
  );
}
