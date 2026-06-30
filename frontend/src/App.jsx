import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Routes>
      {/* Login page has its own full-screen layout */}
      <Route path="/login" element={<Login />} />

      {/* All other pages use the shared Layout (Navbar + Footer) */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />

              {/* Protected: must be logged in */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

              {/* Admin only */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;