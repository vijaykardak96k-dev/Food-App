import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, Store, Tags, UtensilsCrossed, Users } from 'lucide-react';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Restaurants from './pages/Restaurants.jsx';
import RestaurantDetail from './pages/RestaurantDetail.jsx';
import Search from './pages/Search.jsx';
import Categories from './pages/Categories.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RegisterRestaurant from './pages/RegisterRestaurant.jsx';
import Account from './pages/Account.jsx';
import MyOrders from './pages/MyOrders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import NotFound from './pages/NotFound.jsx';

import PartnerDashboard from './pages/partner/PartnerDashboard.jsx';
import PartnerMenu from './pages/partner/PartnerMenu.jsx';
import PartnerOrders from './pages/partner/PartnerOrders.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminRestaurants from './pages/admin/AdminRestaurants.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';

const PARTNER_LINKS = [
  { to: '/partner', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/partner/orders', label: 'Orders', icon: ClipboardList },
  { to: '/partner/menu', label: 'Menu', icon: UtensilsCrossed },
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/restaurants', label: 'Restaurants', icon: Store },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Customer website */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-restaurant" element={<RegisterRestaurant />} />
          <Route path="/cart" element={<ProtectedRoute roles={['customer']}><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><Checkout /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute roles={['customer']}><Account /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute roles={['customer']}><MyOrders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute roles={['customer']}><OrderDetail /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Restaurant panel */}
        <Route path="/partner" element={<ProtectedRoute roles={['restaurant']}><DashboardLayout variant="partner" title="Restaurant panel" links={PARTNER_LINKS} /></ProtectedRoute>}>
          <Route index element={<PartnerDashboard />} />
          <Route path="orders" element={<PartnerOrders />} />
          <Route path="menu" element={<PartnerMenu />} />
          <Route path="*" element={<Navigate to="/partner" replace />} />
        </Route>

        {/* Admin panel */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout variant="admin" title="Admin" links={ADMIN_LINKS} /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  );
}
