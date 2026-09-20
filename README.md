# Cravo - Food Delivery Web App

Cravo is a small, complete food-ordering web application (a college project inspired by the general idea of Zomato / Swiggy, with its own original design). Customers browse restaurants, search food, fill a cart and place orders. Restaurants manage their menu and incoming orders. An admin approves restaurants and manages users and categories.

Everything runs on `localhost`. **Docker is used only for the MySQL database.** The frontend and backend run directly on your Windows machine.

---

## 1. Features

**Customer**
- Register, log in, log out (JWT); the session survives a browser refresh
- Home page with search, categories, popular food and restaurants
- Search food by name (done in the database, not in React) and search restaurants by name or cuisine
- Filter by category, Veg / Non-veg, and sort by price
- Restaurant pages with a full menu, food details, add to cart
- Cart with quantity +/-, remove, subtotal and total (a cart holds food from one restaurant at a time)
- Saved delivery addresses, checkout, Cash on Delivery or a **mock** online payment (no real payment gateway)
- Orders saved in MySQL with the price at the time of ordering; "My orders", order details and a live status tracker (auto-refreshes)
- Account page: profile, current order, recent orders, saved addresses

**Restaurant owner**
- Own login and a "Register your restaurant" page (new restaurants start as *Pending*)
- Dashboard: total / pending / completed orders and number of menu items
- Menu management: add, edit, delete, mark available / unavailable, upload an image
- Order management: Pending -> Accepted -> Preparing -> Ready -> Completed, or Reject a pending order

**Admin**
- Dashboard with totals (users, restaurants, food items, orders)
- Users: list, view details, activate / deactivate
- Restaurants: approve, deactivate, reactivate (only *Approved* restaurants are visible to customers)
- Categories: add, edit, delete
- Orders: view all orders and their details (view only)

---

## 2. Technology stack

| Part | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Lucide icons, plain CSS |
| Backend | Node.js, Express (REST API) |
| Database | MySQL 8 (in Docker) with `mysql2` |
| Security | JWT (`jsonwebtoken`), `bcryptjs` password hashing, role-based middleware |
| Uploads | `multer` (food images) |

---

## 3. Requirements (install once)

1. **Node.js 20 LTS** (18.11 or newer also works) - https://nodejs.org
2. **Docker Desktop** - https://www.docker.com/products/docker-desktop (make sure it is running)
3. A code editor such as VS Code

Check in PowerShell:

```powershell
node -v
npm -v
docker --version
```

---

## 4. Project structure

```text
food-delivery/
├── frontend/                  React + Vite app (port 5173)
│   ├── src/
│   │   ├── components/        Navbar, Footer, RestaurantCard, FoodCard, SearchBar, CategoryCard,
│   │   │                      CartItem, OrderCard, OrderTracker, LoadingSpinner, ProtectedRoute, ...
│   │   ├── pages/             Home, Search, Cart, Checkout, ... (partner/ and admin/ sub-folders)
│   │   ├── layouts/           MainLayout (website) and DashboardLayout (restaurant + admin)
│   │   ├── context/           AuthContext, CartContext, ToastContext
│   │   ├── services/          api.js (fetch + JWT) and services.js (one function per endpoint)
│   │   ├── hooks/, utils/     small helpers
│   │   └── styles/            base.css, components.css, pages.css, dashboard.css
│   └── package.json
│
├── backend/                   Express API (port 5000)
│   ├── src/
│   │   ├── routes/            URL -> controller
│   │   ├── controllers/       request handling and validation
│   │   ├── models/            all SQL queries
│   │   ├── middleware/        auth (JWT + roles), error handler, image upload
│   │   ├── config/            env.js and db.js (MySQL pool)
│   │   ├── scripts/seed.js    creates tables and loads sample data
│   │   ├── app.js             wires everything together
│   │   └── server.js          starts the server
│   ├── public/images/         sample food / restaurant / category images (local SVG files)
│   ├── uploads/               images uploaded by restaurants
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql             tables, keys, indexes
│   └── seed.sql               sample data
│
├── docker-compose.yml         MySQL only
├── .gitignore
└── README.md
```

---

## 5. Setup and run (Windows / PowerShell)

Open the `food-delivery` folder in PowerShell. You will use **three terminals**.

### Step 1 - Start MySQL (Terminal 1, project root)

```powershell
docker compose up -d
docker compose ps
```

Wait until the `cravo-mysql` status shows **healthy** (the first start takes 20-40 seconds). This creates an empty database called `food_delivery` on `localhost:3306`. Your data is kept in a Docker volume, so it is still there after a restart.

### Step 2 - Backend (Terminal 2)

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

- `Copy-Item` creates your `.env` file. The defaults already match `docker-compose.yml`. Change `JWT_SECRET` to any long random text.
- `npm run seed` creates all tables and loads the sample data (run it once; running it again **wipes and reloads** all data).
- `npm run dev` starts the API. You should see `Cravo API running on http://localhost:5000`.

Quick check: open http://localhost:5000/api/health - it should show `{"status":"ok"}`.

### Step 3 - Frontend (Terminal 3)

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. (Optional: `Copy-Item .env.example .env` in `frontend` if your backend is not on port 5000.)

### Daily use

```powershell
docker compose up -d        # Terminal 1 (if Docker is not already running)
cd backend;  npm run dev    # Terminal 2
cd frontend; npm run dev    # Terminal 3
```

Stop MySQL with `docker compose down` (data is kept). Use `docker compose down -v` only if you want to delete the database completely.

---

## 6. Environment variables (`backend/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=cravo_local_pw        # must match MYSQL_ROOT_PASSWORD in docker-compose.yml
DB_NAME=food_delivery
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
DEMO_PASSWORD=Demo@1234           # password given to the demo accounts by `npm run seed`
```

`.env` is ignored by Git. Never commit real credentials. The frontend has no secrets; its only setting is `VITE_API_URL` (the backend address).

---

## 7. Database

Tables (see `database/schema.sql`):

```text
users ──┬── addresses
        ├── cart ── cart_items ── foods
        └── orders ── order_items
restaurants ──┬── foods ── categories
              └── orders
```

Points worth explaining in a viva:
- `order_items` stores `food_name` and `unit_price` **copied at order time**, so old orders stay correct if a restaurant changes a price later.
- `orders.delivery_address` is a copy of the address text, for the same reason.
- Passwords are stored only as bcrypt hashes (`users.password_hash`).
- Foreign keys keep data consistent (for example a category that still has food cannot be deleted).
- Placing an order runs in a **transaction**: create the order, copy the cart items, empty the cart - all or nothing.

To reset the database at any time: `cd backend` then `npm run seed`.

---

## 8. Demo accounts

Every demo account uses the password from `DEMO_PASSWORD` in `backend/.env` (default **`Demo@1234`**).

| Role | Email | What you can see |
| --- | --- | --- |
| Customer | `customer@demo.com` | Has past orders, saved addresses, one order in progress |
| Restaurant | `spicegarden@demo.com` | Owner of *Spice Garden*, with a pending order to accept |
| Admin | `admin@demo.com` | Full admin panel |
| More customers | `diya@demo.com`, `rohan@demo.com` (deactivated) | To try user management |
| More restaurants | `crustco@`, `burgerbarn@`, `wokthisway@`, `dosajunction@`, `sweettooth@`, `tandoortales@`, `greenbowl@` + `demo.com` | Each owns one restaurant. `greenbowl` is *Pending* so you can approve it as admin |

URLs:
- Website: http://localhost:5173
- Restaurant panel: http://localhost:5173/partner (after logging in as a restaurant)
- Admin panel: http://localhost:5173/admin (after logging in as admin)
- API: http://localhost:5000/api

---

## 9. API overview

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/register-restaurant`, `POST /api/auth/login`, `GET /api/auth/me` |
| Browse | `GET /api/restaurants`, `GET /api/restaurants/:id`, `GET /api/foods`, `GET /api/foods/search?q=`, `GET /api/foods/popular`, `GET /api/foods/:id`, `GET /api/categories` |
| Cart (customer) | `GET/POST /api/cart`, `PUT/DELETE /api/cart/:id`, `DELETE /api/cart` |
| Addresses (customer) | `GET/POST /api/addresses`, `DELETE /api/addresses/:id` |
| Orders (customer) | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id` |
| Restaurant | `GET /api/restaurant/dashboard`, `GET/POST /api/restaurant/foods`, `PUT/DELETE /api/restaurant/foods/:id`, `PATCH /api/restaurant/foods/:id/availability`, `GET /api/restaurant/orders`, `PUT /api/restaurant/orders/:id/status` |
| Admin | `GET /api/admin/dashboard`, `GET /api/admin/users`, `GET /api/admin/users/:id`, `PUT /api/admin/users/:id/status`, `GET /api/admin/restaurants`, `PUT /api/admin/restaurants/:id/status`, `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `POST/PUT/DELETE /api/admin/categories` |

How authorization works: `authenticate` middleware reads the `Authorization: Bearer <token>` header, verifies the JWT and loads the user from MySQL (so a deactivated user is blocked immediately). `authorize('customer' | 'restaurant' | 'admin')` then checks the role. The React `ProtectedRoute` component protects pages the same way, but the real protection is always on the server.

---

## 10. Try the whole flow (test checklist)

1. Open http://localhost:5173, search **biryani** - foods and restaurants appear. Use the category, Veg / Non-veg and sort controls.
2. Register a new customer account (or log in as `customer@demo.com`).
3. Open *Spice Garden*, add food to the cart, change quantities, go to checkout, add an address, choose a payment method, place the order.
4. In another browser window log in as `spicegarden@demo.com`, open **Orders**, accept the order and move it forward. Switch back to the customer window - the tracker updates within about 15 seconds.
5. As the restaurant, open **Menu**, add a dish with an image, mark another as unavailable, and check the customer side.
6. Register a new restaurant at `/register-restaurant`; it is hidden from customers. Log in as `admin@demo.com` and approve it under **Restaurants**; it now appears on the website.
7. As admin, deactivate a customer under **Users**; that customer can no longer log in. Add and edit a category under **Categories**.
8. Refresh the browser on any page - you stay logged in. Visit a wrong URL - a friendly "Page not found" page appears. Visit `/admin` as a customer - you are told you have no access.

---

## 11. Common errors and solutions

**`npm : File ...npm.ps1 cannot be loaded because running scripts is disabled`**
Run once in PowerShell: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then reopen the terminal.

**`Could not connect to MySQL: ECONNREFUSED`**
Docker is not running or MySQL is not ready yet. Start Docker Desktop, run `docker compose up -d`, wait until `docker compose ps` shows *healthy*. If it still fails, set `DB_HOST=127.0.0.1` in `backend/.env`.

**`ER_ACCESS_DENIED_ERROR` (access denied for user root)**
`DB_PASSWORD` in `backend/.env` does not match the password the MySQL container was created with. Either fix `.env`, or delete the old container data and start again: `docker compose down -v` then `docker compose up -d`.

**`Bind for 0.0.0.0:3306 failed: port is already allocated`**
Another MySQL is already using port 3306 (for example MySQL installed on Windows). Stop that service, or change the left side of `"3306:3306"` in `docker-compose.yml` to `"3307:3306"` and set `DB_PORT=3307` in `backend/.env`.

**`Port 5000 is already in use` / `Port 5173 is already in use`**
Close the other program using it. For the backend you can change `PORT` in `backend/.env` (and `VITE_API_URL` in `frontend/.env`). The frontend must stay on 5173 because the backend only allows that origin (CORS).

**Browser shows "Cannot reach the server"**
The backend is not running. Start it with `npm run dev` in the `backend` folder and check http://localhost:5000/api/health.

**Login says "Invalid email or password" for a demo account**
You have not run `npm run seed`, or you changed `DEMO_PASSWORD` after seeding. Run `npm run seed` again.

**`Missing JWT_SECRET`**
You did not create `backend/.env`. Run `Copy-Item .env.example .env` inside `backend`.

**Images are missing**
Images are served by the backend. Make sure it is running, and that you did not delete `backend/public/images`.

**Uploaded image is rejected**
Only JPG, PNG or WebP up to 2 MB are accepted.

---

## 12. Notes

- Food and restaurant pictures are illustrated SVG files stored locally in `backend/public/images`. No external image links are used.
- Ratings on restaurants are sample data (there is no review feature). The online payment option is a demo: it only marks the order as paid.
- Delivery is free and there are no coupons, maps, chat or notifications - by design, to keep the project small.

Designed & Developed by Vijay Kardak
