import Navbar from './Navbar';
import Footer from './Footer';

const WHATSAPP_NUMBER = '919855440475'; // +91 prefix for international format

const WhatsAppButton = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Gift%20Gallery!%20I%20need%20help%20with%20my%20order.`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    style={{
      position: 'fixed',
      bottom: '88px',      // above the cart toast zone
      right: '20px',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
    }}
  >
    {/* Tooltip */}
    <span
      className="whatsapp-tooltip"
      style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontSize: '11px',
        fontWeight: 600,
        padding: '5px 10px',
        borderRadius: '8px',
        whiteSpace: 'nowrap',
        opacity: 0,
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
      }}
    >
      Chat with us
    </span>

    {/* Button */}
    <div style={{ position: 'relative' }}>
      {/* Pulse ring */}
      <span
        style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          opacity: 0.3,
          animation: 'waPulse 2s ease-out infinite',
        }}
      />
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
          position: 'relative',
        }}
      >
        {/* WhatsApp SVG icon */}
        <svg width="26" height="26" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.348L4 29l7.896-2.198A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.848 0-3.596-.498-5.104-1.367l-.366-.215-4.683 1.303 1.328-4.558-.237-.38A9.953 9.953 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.428c-.29-.145-1.717-.847-1.983-.944-.266-.097-.46-.145-.654.145-.193.29-.75.944-.919 1.138-.169.193-.338.218-.628.073-.29-.145-1.225-.451-2.333-1.44-.862-.769-1.444-1.718-1.614-2.008-.169-.29-.018-.447.127-.591.13-.13.29-.338.434-.507.144-.169.193-.29.29-.483.097-.194.048-.363-.024-.508-.073-.145-.655-1.58-.897-2.164-.236-.569-.477-.492-.655-.501l-.558-.01c-.193 0-.507.073-.772.363-.266.29-1.015 1.01-1.015 2.47s1.039 2.866 1.184 3.06c.145.193 2.046 3.124 4.956 4.381.693.3 1.233.478 1.655.612.696.222 1.328.19 1.828.115.558-.083 1.717-.703 1.96-1.382.242-.68.242-1.262.169-1.383-.072-.12-.265-.193-.556-.338z"/>
        </svg>
      </div>
    </div>

    <style>{`
      @keyframes waPulse {
        0%   { transform: scale(1);   opacity: 0.4; }
        70%  { transform: scale(1.5); opacity: 0; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      a:hover .whatsapp-tooltip { opacity: 1 !important; }
    `}</style>
  </a>
);

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;