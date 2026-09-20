import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, MapPin, Plus, ShoppingBag } from 'lucide-react';
import { addressApi, orderApi } from '../services/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import AddressForm from '../components/AddressForm.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import VegMark from '../components/VegMark.jsx';

const PAYMENT_OPTIONS = [
  { value: 'COD', label: 'Cash on delivery', text: 'Pay in cash when your order arrives', icon: Banknote },
  { value: 'MOCK_ONLINE', label: 'Online payment (demo)', text: 'Simulated payment. No real money is charged', icon: CreditCard },
];

export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => addressApi.list(), []);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [payment, setPayment] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!data) return;
    setAddresses(data.addresses);
    setAddressId((current) => current ?? data.addresses[0]?.id ?? null);
    if (data.addresses.length === 0) setAddingAddress(true);
  }, [data]);

  if (cart.items.length === 0) {
    return (
      <div className="container page-section">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" message="Add some food before checking out." action={<Link to="/restaurants" className="btn btn-primary">Browse restaurants</Link>} />
      </div>
    );
  }
  if (loading) return <LoadingSpinner />;
  if (error && !data) return <div className="container page-section"><ErrorState message={error} onRetry={reload} /></div>;

  const placeOrder = async () => {
    setOrderError('');
    if (!addressId) { setOrderError('Please add or select a delivery address.'); return; }
    setPlacing(true);
    try {
      const result = await orderApi.create({ address_id: addressId, payment_method: payment });
      await refresh();
      toast.success('Order placed! The restaurant will confirm it shortly.');
      navigate(`/orders/${result.order.id}`, { replace: true, state: { placed: true } });
    } catch (err) {
      setOrderError(err.message);
      refresh();
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container page-section">
      <PageHeader title="Checkout" subtitle={`Ordering from ${cart.restaurant.name}`} />
      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="panel">
            <div className="panel-head">
              <h2>Delivery address</h2>
              {!addingAddress && <button type="button" className="btn btn-soft btn-sm" onClick={() => setAddingAddress(true)}><Plus size={16} /> New address</button>}
            </div>
            {addresses.length > 0 && (
              <div className="option-list" role="radiogroup" aria-label="Delivery address">
                {addresses.map((a) => (
                  <label key={a.id} className={`option-card ${addressId === a.id ? 'selected' : ''}`}>
                    <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                    <MapPin size={20} className="option-icon" />
                    <span>
                      <strong>{a.full_address}</strong>
                      <small>{a.city} - {a.pincode}{a.phone ? ` - ${a.phone}` : ''}</small>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {addingAddress && (
              <div className={addresses.length > 0 ? 'inline-form' : ''}>
                <AddressForm
                  defaultPhone={user?.phone || ''}
                  onCancel={addresses.length > 0 ? () => setAddingAddress(false) : undefined}
                  onSaved={(address) => {
                    setAddresses((list) => [address, ...list]);
                    setAddressId(address.id);
                    setAddingAddress(false);
                    toast.success('Address saved');
                  }}
                />
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Payment method</h2>
            <div className="option-list" role="radiogroup" aria-label="Payment method">
              {PAYMENT_OPTIONS.map(({ value, label, text, icon: Icon }) => (
                <label key={value} className={`option-card ${payment === value ? 'selected' : ''}`}>
                  <input type="radio" name="payment" checked={payment === value} onChange={() => setPayment(value)} />
                  <Icon size={20} className="option-icon" />
                  <span><strong>{label}</strong><small>{text}</small></span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="summary-card">
          <h2>Order summary</h2>
          <p className="summary-restaurant">{cart.restaurant.name}</p>
          <ul className="summary-items">
            {cart.items.map((item) => (
              <li key={item.id}>
                <VegMark veg={item.is_veg} />
                <span>{item.quantity} x {item.name}</span>
                <strong>{formatPrice(item.line_total)}</strong>
              </li>
            ))}
          </ul>
          <dl className="summary-rows">
            <div><dt>Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd className="text-green">Free</dd></div>
            <div className="summary-total"><dt>Total</dt><dd>{formatPrice(cart.total)}</dd></div>
          </dl>
          <p className="summary-note">Payment: {PAYMENT_OPTIONS.find((p) => p.value === payment).label}</p>
          {cart.has_unavailable && <div className="alert alert-error">Some items are no longer available. <Link to="/cart" className="text-link">Update your cart</Link></div>}
          {orderError && <div className="alert alert-error" role="alert">{orderError}</div>}
          <button type="button" className="btn btn-primary btn-lg btn-block" onClick={placeOrder} disabled={placing || cart.has_unavailable}>
            {placing ? 'Placing order...' : `Place order - ${formatPrice(cart.total)}`}
          </button>
        </aside>
      </div>
    </div>
  );
}
