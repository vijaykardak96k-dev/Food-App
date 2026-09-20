import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth, homePathFor } from '../context/AuthContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Unauthorized() {
  const { user } = useAuth();
  const home = user ? homePathFor(user) : '/';
  return (
    <div className="container page-section">
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        message="This area is for a different type of account. Log in with the right account or go back."
        action={<Link to={home} className="btn btn-primary">{home === '/' ? 'Back to home' : 'Go to my dashboard'}</Link>}
      />
    </div>
  );
}
