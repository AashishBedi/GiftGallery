import { Link } from 'react-router-dom';
import { Globe, Camera, MessageCircle, Play, Phone, Mail, MapPin } from 'lucide-react';

const Facebook = (props) => <Globe {...props} />;
const Instagram = (props) => <Camera {...props} />;
const Twitter = (props) => <MessageCircle {...props} />;
const Youtube = (props) => <Play {...props} />;

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter strip */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-black text-lg">Subscribe & Get 10% Off</h3>
            <p className="text-white opacity-80 text-sm">Join our newsletter for exclusive deals and gift ideas</p>
          </div>
          <form className="flex w-full md:w-auto gap-0 max-w-sm rounded-full overflow-hidden border-2 border-white/30">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 text-white placeholder-white/60 px-5 py-2.5 outline-none text-sm min-w-0"
            />
            <button
              type="submit"
              className="bg-white text-primary font-bold px-5 py-2.5 text-sm hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-black text-white">🎁 Gift Gallery</span>
              <p className="text-xs text-gray-400 mt-0.5 font-light italic">Where care finds its perfect expression.</p>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Your one-stop destination for thoughtful gifts for every occasion — birthdays, anniversaries, weddings, and more.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="bg-gray-800 hover:bg-primary p-2 rounded-full transition-colors"
                >
                  <Icon size={15} className="text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'New Arrivals', to: '/products' },
                { label: 'Birthday Gifts', to: '/products?category=birthday' },
                { label: 'Anniversary', to: '/products?category=anniversary' },
                { label: 'Jewellery', to: '/products?category=jewellery' },
                { label: 'Sale', to: '/products?sale=true' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">My Account</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Login / Register', to: '/login' },
                { label: 'My Orders', to: '/orders' },
                { label: 'My Cart', to: '/cart' },
                { label: 'Checkout', to: '/checkout' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-gray-400 hover:text-white transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Phone size={14} className="mt-0.5 flex-shrink-0 text-primary" />
                9855440475
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Mail size={14} className="mt-0.5 flex-shrink-0 text-primary" />
                support@giftgallery.in
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-primary" />
                Ludhiana, Punjab, India
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Gift Gallery. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;