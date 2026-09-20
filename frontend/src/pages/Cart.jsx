import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, plural } from '../utils/format.js';
import CartItem from '../components/CartItem.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Cart() {
  const { cart, clear, refresh } = useCart();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);

  // make sure availability info is fresh when the cart page opens
  useEffect(() => { refresh(); }, [refresh]);

  if (cart.items.length === 0) {
    return (
      <div className="container page-section">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add something tasty from a restaurant and it will show up here."
          action={<Link to="/restaurants" className="btn btn-primary">Browse restaurants</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container page-section">
      <PageHeader
        title="Your cart"
        subtitle={<>{plural(cart.count, 'item')} from <Link to={`/restaurants/${cart.restaurant.id}`} className="text-link">{cart.restaurant.name}</Link></>}
        actions={<button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(true)}><Trash2 size={16} /> Clear cart</button>}
      />
      <div className="cart-layout">
        <ul className="cart-list">
          {cart.items.map((item) => <CartItem key={item.id} item={item} />)}
        </ul>
        <aside className="summary-card">
          <h2>Order summary</h2>
          <dl className="summary-rows">
            <div><dt>Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd className="text-green">Free</dd></div>
            <div className="summary-total"><dt>Total</dt><dd>{formatPrice(cart.total)}</dd></div>
          </dl>
          {cart.has_unavailable && <div className="alert alert-error">Some items are no longer available. Remove them to continue.</div>}
          <button type="button" className="btn btn-primary btn-lg btn-block" disabled={cart.has_unavailable} onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
        </aside>
      </div>

      {confirmClear && (
        <ConfirmDialog
          title="Clear your cart?"
          message="All items will be removed from your cart."
          confirmLabel="Clear cart"
          danger
          onConfirm={async () => { await clear(); setConfirmClear(false); }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}
