# 🎁 Gift Gallery

A full-stack e-commerce platform built for a real-world gifting business, inspired by Archies Online. Customers can browse gift categories, add items to cart, and check out with Razorpay, while admins manage products, categories, and orders through a no-code dashboard.

**Repository:** [github.com/AashishBedi/GiftGallery](https://github.com/AashishBedi/GiftGallery)

---

## ✨ Features

### Customer-facing
- Browse products by category (Birthday, Jewellery, Mugs, Bags, Soft Toys, Home Decor, Chocolates, Greeting Cards, Anniversary)
- Product search and category filtering
- Cart with add / update quantity / remove
- Checkout flow with Razorpay payment integration (UPI, cards, netbanking via test mode)
- Order history for logged-in users
- JWT-based authentication (register / login)

### Admin panel (no-code product management)
- Dashboard with stats: total products, categories, pending orders, total revenue
- Add / edit / delete products with multi-image upload (Cloudinary)
- Add / delete categories — appear automatically in the storefront navigation
- View and update order status (Pending → Processing → Shipped → Delivered → Cancelled)
- Grid and list views for product management
- Role-based access — admin routes are protected and only visible to ADMIN users

---

## 🛠 Tech Stack

**Backend**
- Java 21, Spring Boot 4.1
- Spring Security + JWT (jjwt) for authentication
- Spring Data JPA + Hibernate
- PostgreSQL
- Cloudinary SDK for image hosting
- Razorpay Java SDK for payments
- Maven

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios (with JWT interceptor)
- Context API for Auth and Cart state
- Swiper.js for the homepage hero banner
- Lucide React icons

---

## 📁 Project Structure

```
GiftGallery/
├── backend/
│   └── src/main/java/com/giftgallery/backend/
│       ├── config/          # SecurityConfig, JwtUtil, JwtAuthFilter, CloudinaryConfig
│       ├── controller/      # Auth, Product, Category, Cart, Order, Payment
│       ├── service/         # Business logic layer
│       ├── repository/      # Spring Data JPA repositories
│       ├── model/           # User, Product, Category, CartItem, Order, OrderItem
│       ├── dto/              # Request/response DTOs
│       └── exception/       # Global exception handling
│
└── frontend/
    └── src/
        ├── api/              # Axios instance + endpoint wrappers
        ├── components/
        │   ├── layout/       # Navbar, Footer, Layout
        │   └── ui/
        ├── context/          # AuthContext, CartContext
        ├── pages/
        │   ├── admin/        # AdminDashboard (Products / Orders / Categories tabs)
        │   └── ...           # Home, Products, ProductDetail, Cart, Orders, Login
        └── routes/           # ProtectedRoute, AdminRoute
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21 (JDK)
- Node.js 18+
- Maven 3.8+
- PostgreSQL 15+
- Cloudinary account (free tier)
- Razorpay account (test mode)

### Backend Setup

1. Create the database:
   ```sql
   CREATE DATABASE gift_gallery;
   ```

2. Inside `backend/src/main/resources/`, create `application.yml` (copy from `application-example.yml`) and fill in your own values:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/gift_gallery
       username: postgres
       password: YOUR_POSTGRES_PASSWORD
     jpa:
       hibernate:
         ddl-auto: update

   cloudinary:
     cloud-name: YOUR_CLOUD_NAME
     api-key: YOUR_API_KEY
     api-secret: YOUR_API_SECRET

   razorpay:
     key-id: YOUR_KEY_ID
     key-secret: YOUR_KEY_SECRET
   ```

3. Run the backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Server starts on `http://localhost:8080`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`.

---

## 🔑 Creating an Admin User

New registrations default to the `CUSTOMER` role. To promote a user to `ADMIN`, run this in your PostgreSQL database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```
Then log in again to get a fresh token with the ADMIN role.

---

## 📡 Key API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/products` | Public |
| GET | `/api/products/{id}` | Public |
| GET | `/api/products/search?q=` | Public |
| POST | `/api/products` | Authenticated (multipart form-data) |
| GET | `/api/categories` | Public |
| POST | `/api/categories` | Authenticated |
| GET / POST | `/api/cart`, `/api/cart/add` | Authenticated |
| POST | `/api/orders` | Authenticated |
| GET | `/api/orders/my` | Authenticated |
| GET | `/api/orders/admin/all` | Admin |
| PUT | `/api/orders/admin/{id}/status` | Admin |
| POST | `/api/payment/create-order` | Public |
| POST | `/api/payment/verify` | Authenticated |

---

## 📦 Deployment Notes

- Backend: deployable to Railway (or any Spring Boot host) — connect to a managed PostgreSQL instance (e.g. Neon.tech).
- Frontend: deployable to Vercel — set `VITE_API_URL` to point to the deployed backend.
- Secrets (`application.yml`, Cloudinary/Razorpay keys) are excluded from version control via `.gitignore` and should be set as environment variables in production.
- Switch Razorpay from test mode to live mode only after completing business verification on the Razorpay dashboard.

---

## 👤 Author

**Aashish Bedi** — [github.com/AashishBedi](https://github.com/AashishBedi)

Built as a real-world e-commerce platform for a family gifting business, blending personal motivation with full-stack engineering practice (Spring Boot, React, PostgreSQL, JWT auth, Cloudinary, Razorpay).
