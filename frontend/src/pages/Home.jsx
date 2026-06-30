import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { getProducts } from '../api/product.api';
import { getCategories } from '../api/category.api';
import { ProductCard } from './Products';

// Archies-style hero banners (clean, image-centric)
const banners = [
  {
    id: 1,
    title: 'Surprises, Delivered Today',
    subtitle: 'Get happiness delivered to your doorstep — Same Day!',
    tags: 'Mugs | Soft Toys | Gift Hampers | Cards',
    bg: 'from-rose-50 to-pink-50',
    accent: '#CC0000',
    emoji: '🎁',
    link: '/products',
  },
  {
    id: 2,
    title: "Birthday Gifts They'll Love",
    subtitle: 'Make their special day even more magical',
    tags: 'Cakes | Balloons | Jewellery | Hampers',
    bg: 'from-amber-50 to-orange-50',
    accent: '#CC0000',
    emoji: '🎂',
    link: '/products?category=birthday',
  },
  {
    id: 3,
    title: 'Anniversary Collection',
    subtitle: 'Express your love with our romantic picks',
    tags: 'Flowers | Chocolates | Photo Frames | Cards',
    bg: 'from-pink-50 to-rose-100',
    accent: '#CC0000',
    emoji: '💍',
    link: '/products?category=anniversary',
  },
];

// Archies-style category icons (outline style)
const categoryIcons = [
  { name: 'Birthday', icon: '🎂', slug: 'birthday' },
  { name: 'Jewellery', icon: '💍', slug: 'jewellery' },
  { name: 'Greeting Cards', icon: '💌', slug: 'greeting-cards' },
  { name: 'Same Day', icon: '⚡', slug: 'same-day' },
  { name: 'Gift Hampers', icon: '🧺', slug: 'gift-hampers' },
  { name: 'Stationery', icon: '✏️', slug: 'stationery' },
  { name: 'Soft Toys', icon: '🧸', slug: 'soft-toys' },
  { name: 'Sale', icon: '🏷️', slug: 'sale' },
];

const giftsFor = [
  { label: 'Him', emoji: '👨', slug: 'him' },
  { label: 'Her', emoji: '👩', slug: 'her' },
  { label: 'Girlfriend', emoji: '💑', slug: 'girlfriend' },
  { label: 'Boyfriend', emoji: '💏', slug: 'boyfriend' },
  { label: 'Wife', emoji: '💍', slug: 'wife' },
  { label: 'Husband', emoji: '🤵', slug: 'husband' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProducts(0, 10);
        setProducts(res.data.content || []);
        setOffline(false);
      } catch (err) {
        console.error(err);
        setOffline(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white">

      {/* Offline banner */}
      {offline && (
        <div style={{ backgroundColor: '#fff3cd', borderBottom: '1px solid #ffc107' }} className="text-center py-2.5 text-sm font-medium text-yellow-800">
          ⚠️ Backend server is offline. Please start your Spring Boot server on port 8080.
        </div>
      )}

      {/* ── HERO SLIDER ── */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="w-full hero-swiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className={`bg-gradient-to-r ${banner.bg} min-h-[380px] md:min-h-[460px] flex items-center`}>
              <div className="container mx-auto px-8 md:px-16 flex items-center justify-between gap-8">
                {/* Text */}
                <div className="max-w-lg">
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Gift Gallery Exclusive</p>
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
                    {banner.title}
                  </h2>
                  <p className="text-gray-600 text-base mb-3">{banner.subtitle}</p>
                  <p className="text-sm text-gray-500 mb-6 font-medium">{banner.tags}</p>
                  <Link
                    to={banner.link}
                    className="inline-block bg-primary hover:bg-primaryDark text-white font-bold px-8 py-3 rounded-full transition-colors text-sm tracking-wide shadow-sm"
                  >
                    SHOP NOW
                  </Link>
                </div>
                {/* Illustration */}
                <div className="hidden md:flex text-[140px] select-none opacity-80">
                  {banner.emoji}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-primary opacity-30" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight text-center whitespace-nowrap">Shop by Category</h2>
            <div className="flex-1 h-px bg-primary opacity-30" />
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categoryIcons.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-red-50 transition-all group cursor-pointer"
              >
                <div className="text-4xl">{cat.icon}</div>
                <span className="text-xs text-center font-semibold text-gray-700 group-hover:text-primary leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="bg-primary py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl font-black mb-1">Same Day Delivery Available!</h3>
            <p className="opacity-90 text-sm">Order before 3 PM to get gifts delivered today in select cities.</p>
          </div>
          <Link
            to="/products"
            className="flex-shrink-0 bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors text-sm tracking-wide"
          >
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* ── GIFTS FOR ── */}
      <section className="py-12 bg-[#f7f7f7]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Gifts For</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {giftsFor.map((item) => (
              <Link
                key={item.label}
                to={`/products?for=${item.slug}`}
                className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="text-4xl mb-2">{item.emoji}</div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-primary">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">New Arrivals</h2>
              <div className="h-1 w-16 bg-primary rounded mt-1" />
            </div>
            <Link
              to="/products"
              className="text-sm font-semibold text-primary hover:underline border border-primary px-4 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY GIFT GALLERY ── */}
      <section className="py-12 bg-[#f7f7f7] border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹499' },
              { icon: '💝', title: 'Curated Gifts', desc: 'Handpicked for every occasion' },
              { icon: '🔒', title: 'Secure Payments', desc: '100% safe & encrypted' },
              { icon: '↩️', title: 'Easy Returns', desc: '7-day hassle-free returns' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h4 className="font-bold text-sm text-gray-800 mb-1">{f.title}</h4>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SALE BANNER ── */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-12 text-white text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Limited Time Offer</p>
        <h2 className="text-3xl font-black mb-2">Special Offers Just For You</h2>
        <p className="mb-6 opacity-70 text-sm">Get up to 50% off on selected items. Don't miss out!</p>
        <Link
          to="/products?sale=true"
          className="bg-primary hover:bg-primaryDark text-white font-bold px-10 py-3 rounded-full transition-colors inline-block text-sm tracking-wide"
        >
          SHOP SALE
        </Link>
      </section>
    </div>
  );
};

export default Home;