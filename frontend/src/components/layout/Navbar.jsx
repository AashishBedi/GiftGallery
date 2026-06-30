import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropOpen(false);
    navigate('/');
  };

  const navCategories = [
    { label: 'New Arrivals', path: '/products' },
    { label: 'Birthday', path: '/products?category=birthday' },
    { label: 'Anniversary', path: '/products?category=anniversary' },
    { label: 'Jewellery', path: '/products?category=jewellery' },
    { label: 'Greeting Cards', path: '/products?category=greeting-cards' },
    { label: 'Mugs', path: '/products?category=mugs' },
    { label: 'Soft Toys', path: '/products?category=soft-toys' },
    { label: 'Home Decor', path: '/products?category=home-decor' },
    { label: 'Chocolates', path: '/products?category=chocolates' },
    { label: 'Sale', path: '/products?sale=true', isSale: true },
  ];

  return (
    <header className="w-full sticky top-0 z-50">

      {/* ── 1. ANNOUNCEMENT BAR ── */}
      <div style={{ backgroundColor: '#CC0000' }} className="text-white text-center text-xs py-2 font-medium">
        🎁 Free Shipping on orders above ₹499 &nbsp;|&nbsp; Customer Care: 9855440475
      </div>

      {/* ── 2. MAIN ROW: Logo | Search | Icons ── */}
      <div className="bg-white border-b border-gray-200">
        <div style={{ maxWidth: '1280px' }} className="mx-auto px-6 py-4 flex items-center gap-6">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-start gap-2 min-w-[160px]">
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                {/* Gift box icon in brand red */}
                <span style={{ fontSize: '26px', lineHeight: 1 }}>🎁</span>
                <span
                  style={{ color: '#CC0000', fontFamily: 'Jost, sans-serif' }}
                  className="text-xl font-black tracking-tight"
                >
                  Gift Gallery
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-light mt-0.5 pl-0.5 italic">
                Where care finds its perfect expression.
              </span>
            </div>
          </Link>

          {/* Search bar — wide, grey bg, square red button */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden md:flex">
            <div className="flex w-full overflow-hidden rounded-sm" style={{ border: '1px solid #e0e0e0' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gifts, categories, occasions..."
                style={{ backgroundColor: '#fafafa' }}
                className="flex-1 px-5 py-2.5 outline-none text-sm text-gray-700"
              />
              <button
                type="submit"
                style={{ backgroundColor: '#CC0000', minWidth: '48px' }}
                className="flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Search size={18} color="white" />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-6 ml-auto flex-shrink-0">

            {/* Cart */}
            <Link
              to="/cart"
              className="flex flex-col items-center gap-0.5 transition-colors group"
              style={{ color: '#555' }}
            >
              <div className="relative">
                <ShoppingCart size={22} className="group-hover:text-red-600 transition-colors" />
                {cartCount > 0 && (
                  <span
                    style={{ backgroundColor: '#CC0000', fontSize: '10px', minWidth: '18px', height: '18px' }}
                    className="absolute -top-2 -right-2 text-white font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium group-hover:text-red-600 transition-colors hidden md:block">
                Cart
              </span>
            </Link>

            {/* Sign In / User */}
            {user ? (
              <div className="relative hidden md:block" ref={dropRef}>
                <button
                  onClick={() => setUserDropOpen((p) => !p)}
                  className="flex flex-col items-center gap-0.5 transition-colors group"
                  style={{ color: '#555' }}
                >
                  <User size={22} className="group-hover:text-red-600 transition-colors" />
                  <span className="text-[11px] font-medium flex items-center gap-0.5 group-hover:text-red-600 transition-colors">
                    {user.name?.split(' ')[0]} <ChevronDown size={10} />
                  </span>
                </button>
                {userDropOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white shadow-2xl rounded-xl w-52 py-2 border border-gray-100 z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Package size={14} /> My Orders
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        style={{ color: '#CC0000' }}
                        className="block w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex flex-col items-center gap-0.5 transition-colors group hidden md:flex"
                style={{ color: '#555' }}
              >
                <User size={22} className="group-hover:text-red-600 transition-colors" />
                <span className="text-[11px] font-medium group-hover:text-red-600 transition-colors">
                  Sign In
                </span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              style={{ color: '#555' }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. CATEGORY NAV ── */}
      <nav className="bg-white border-b border-gray-200 hidden md:block">
        <div style={{ maxWidth: '1280px' }} className="mx-auto px-6">
          <ul className="flex items-center">
            {navCategories.map((cat) => (
              <li key={cat.path}>
                <Link
                  to={cat.path}
                  className="block px-4 py-3 text-[13px] font-medium transition-all border-b-2 border-transparent hover:border-red-600 hover:text-red-600"
                  style={{
                    color: cat.isSale ? '#CC0000' : '#333',
                    fontWeight: cat.isSale ? '700' : '500',
                  }}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg px-4 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex overflow-hidden rounded-sm border border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gifts..."
              className="flex-1 px-4 py-2 outline-none text-sm bg-gray-50"
            />
            <button type="submit" style={{ backgroundColor: '#CC0000' }} className="px-4 flex items-center">
              <Search size={16} color="white" />
            </button>
          </form>
          <div className="flex flex-col divide-y divide-gray-50">
            {navCategories.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm"
                style={{ color: cat.isSale ? '#CC0000' : '#333', fontWeight: cat.isSale ? '700' : '400' }}
              >
                {cat.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="text-sm py-2 text-gray-700">My Orders</Link>
                {isAdmin() && <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm py-2 text-gray-700">Admin Panel</Link>}
                <button onClick={handleLogout} className="text-sm text-left font-semibold py-2" style={{ color: '#CC0000' }}>Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm py-2 text-gray-700">Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;