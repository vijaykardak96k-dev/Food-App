import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cartApi } from '../services/services.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const EMPTY_CART = { id: null, restaurant: null, items: [], subtotal: 0, total: 0, count: 0, has_unavailable: false };
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(EMPTY_CART);
  const [conflict, setConflict] = useState(null); // set when the customer adds food from a second restaurant
  const isCustomer = user?.role === 'customer';

  const refresh = useCallback(async () => {
    if (!isCustomer) { setCart(EMPTY_CART); return; }
    try {
      const data = await cartApi.get();
      setCart(data.cart);
    } catch { /* the cart page shows its own error if needed */ }
  }, [isCustomer]);

  useEffect(() => { refresh(); }, [refresh, user?.id]);

  const add = useCallback(async (food, quantity = 1, replace = false) => {
    try {
      const data = await cartApi.add({ food_id: food.id, quantity, replace });
      setCart(data.cart);
      setConflict(null);
      toast.success(`${food.name} added to your cart`, { action: { label: 'View cart', to: '/cart' } });
    } catch (err) {
      if (err.code === 'DIFFERENT_RESTAURANT') setConflict({ food, quantity, message: err.message });
      else toast.error(err.message);
    }
  }, [toast]);

  const setQuantity = useCallback(async (itemId, quantity) => {
    try {
      const data = quantity < 1 ? await cartApi.remove(itemId) : await cartApi.update(itemId, quantity);
      setCart(data.cart);
    } catch (err) {
      toast.error(err.message);
    }
  }, [toast]);

  const clear = useCallback(async () => {
    try {
      const data = await cartApi.clear();
      setCart(data.cart);
    } catch (err) {
      toast.error(err.message);
    }
  }, [toast]);

  const value = useMemo(() => ({
    cart, add, setQuantity, clear, refresh, isCustomer,
    itemFor: (foodId) => cart.items.find((i) => i.food_id === foodId) || null,
  }), [cart, add, setQuantity, clear, refresh, isCustomer]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {conflict && (
        <ConfirmDialog
          title="Start a new cart?"
          message={`${conflict.message} You can order from one restaurant at a time. Clear your cart and add ${conflict.food.name} instead?`}
          confirmLabel="Clear cart and add"
          onConfirm={() => add(conflict.food, conflict.quantity, true)}
          onCancel={() => setConflict(null)}
        />
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

// Returns a function that adds a food to the cart, or sends guests / non-customers to the right place.
export function useAddToCart() {
  const { user } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback((food) => {
    if (!user) {
      toast.info('Log in to start your order');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    if (user.role !== 'customer') {
      toast.info('Only customer accounts can order food');
      return;
    }
    add(food);
  }, [user, add, toast, navigate, location]);
}
