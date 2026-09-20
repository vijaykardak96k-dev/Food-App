-- Sample data for Cravo. Generated once; edit freely.
-- Every demo account uses the DEMO_PASSWORD from backend/.env (hashed by `npm run seed`).

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO users (id, name, email, password_hash, phone, role, is_active) VALUES
  (1, 'Cravo Admin', 'admin@demo.com', '__DEMO_PASSWORD_HASH__', '9000000001', 'admin', 1),
  (2, 'Aarav Sharma', 'customer@demo.com', '__DEMO_PASSWORD_HASH__', '9876543210', 'customer', 1),
  (3, 'Diya Patil', 'diya@demo.com', '__DEMO_PASSWORD_HASH__', '9822012345', 'customer', 1),
  (4, 'Rohan Deshmukh', 'rohan@demo.com', '__DEMO_PASSWORD_HASH__', '9890098765', 'customer', 0),
  (5, 'Imran Qureshi', 'spicegarden@demo.com', '__DEMO_PASSWORD_HASH__', '9860000001', 'restaurant', 1),
  (6, 'Marco D''Souza', 'crustco@demo.com', '__DEMO_PASSWORD_HASH__', '9860000002', 'restaurant', 1),
  (7, 'Kunal Bhatia', 'burgerbarn@demo.com', '__DEMO_PASSWORD_HASH__', '9860000003', 'restaurant', 1),
  (8, 'Li Wei Chen', 'wokthisway@demo.com', '__DEMO_PASSWORD_HASH__', '9860000004', 'restaurant', 1),
  (9, 'Lakshmi Iyer', 'dosajunction@demo.com', '__DEMO_PASSWORD_HASH__', '9860000005', 'restaurant', 1),
  (10, 'Sneha Kulkarni', 'sweettooth@demo.com', '__DEMO_PASSWORD_HASH__', '9860000006', 'restaurant', 1),
  (11, 'Harpreet Singh', 'tandoortales@demo.com', '__DEMO_PASSWORD_HASH__', '9860000007', 'restaurant', 1),
  (12, 'Nisha Rao', 'greenbowl@demo.com', '__DEMO_PASSWORD_HASH__', '9860000008', 'restaurant', 1);

INSERT INTO categories (id, name, emoji, image) VALUES
  (1, 'Pizza', '🍕', '/images/categories/pizza.svg'),
  (2, 'Burger', '🍔', '/images/categories/burger.svg'),
  (3, 'Biryani', '🍛', '/images/categories/biryani.svg'),
  (4, 'Chinese', '🍜', '/images/categories/chinese.svg'),
  (5, 'South Indian', '🥘', '/images/categories/south-indian.svg'),
  (6, 'North Indian', '🍲', '/images/categories/north-indian.svg'),
  (7, 'Desserts', '🍰', '/images/categories/desserts.svg'),
  (8, 'Drinks', '🥤', '/images/categories/drinks.svg'),
  (9, 'Snacks', '🍟', '/images/categories/snacks.svg');

INSERT INTO restaurants (id, owner_id, name, description, cuisine, location, image, rating, price_level, status) VALUES
  (1, 5, 'Spice Garden', 'Slow-cooked dum biryanis and rich curries made with hand-ground masalas.', 'Indian • Biryani', 'Dharampeth, Nagpur', '/images/restaurants/spice-garden.svg', 4.5, 2, 'Approved'),
  (2, 6, 'Crust & Co.', 'Hand-tossed pizzas with a crisp base, loaded toppings and real mozzarella.', 'Pizza • Italian', 'Sitabuldi, Nagpur', '/images/restaurants/crust--co.svg', 4.3, 2, 'Approved'),
  (3, 7, 'Burger Barn', 'Juicy smash burgers, crispy chicken and loaded fries, made to order.', 'Burgers • Fast Food', 'Sadar, Nagpur', '/images/restaurants/burger-barn.svg', 4.1, 1, 'Approved'),
  (4, 8, 'Wok This Way', 'Street-style Indo-Chinese cooked on a roaring flame, from noodles to momos.', 'Chinese • Asian', 'Civil Lines, Nagpur', '/images/restaurants/wok-this-way.svg', 4.2, 2, 'Approved'),
  (5, 9, 'Dosa Junction', 'Crisp dosas, fluffy idlis and filter coffee, just like a Chennai tiffin room.', 'South Indian', 'Ramdaspeth, Nagpur', '/images/restaurants/dosa-junction.svg', 4.6, 1, 'Approved'),
  (6, 10, 'Sweet Tooth Studio', 'Warm brownies, pastries and thick shakes for every sweet craving.', 'Desserts • Beverages', 'Bajaj Nagar, Nagpur', '/images/restaurants/sweet-tooth-studio.svg', 4.4, 2, 'Approved'),
  (7, 11, 'Tandoor Tales', 'Smoky tandoor kebabs, creamy gravies and fresh butter naan.', 'North Indian • Tandoor', 'Wardha Road, Nagpur', '/images/restaurants/tandoor-tales.svg', 4.4, 3, 'Approved'),
  (8, 12, 'Green Bowl Kitchen', 'Fresh salads, sprouts and grain bowls for lighter meals.', 'Healthy • Salads', 'Manish Nagar, Nagpur', '/images/restaurants/green-bowl-kitchen.svg', 0.0, 2, 'Pending');

INSERT INTO foods (id, restaurant_id, category_id, name, description, price, image, is_veg, is_available) VALUES
  (1, 1, 3, 'Chicken Biryani', 'Long-grain basmati layered with marinated chicken, saffron and fried onions.', 249.00, '/images/foods/chicken-biryani.svg', 0, 1),
  (2, 1, 3, 'Mutton Biryani', 'Tender mutton pieces slow-cooked with aromatic rice in a sealed handi.', 329.00, '/images/foods/mutton-biryani.svg', 0, 0),
  (3, 1, 3, 'Veg Biryani', 'Garden vegetables and paneer cooked with fragrant rice and whole spices.', 189.00, '/images/foods/veg-biryani.svg', 1, 1),
  (4, 1, 3, 'Egg Biryani', 'Spiced boiled eggs nestled in masala rice, served with raita.', 209.00, '/images/foods/egg-biryani.svg', 0, 1),
  (5, 1, 9, 'Chicken 65', 'Crispy fried chicken tossed with curry leaves, chillies and yogurt masala.', 199.00, '/images/foods/chicken-65.svg', 0, 1),
  (6, 1, 6, 'Butter Chicken', 'Smoky chicken in a velvety tomato-butter gravy finished with cream.', 289.00, '/images/foods/butter-chicken.svg', 0, 1),
  (7, 1, 8, 'Masala Chaas', 'Chilled spiced buttermilk with roasted cumin, mint and coriander.', 59.00, '/images/foods/masala-chaas.svg', 1, 1),
  (8, 2, 1, 'Margherita Pizza', 'Classic tomato sauce, fresh mozzarella and basil on a thin crust.', 229.00, '/images/foods/margherita-pizza.svg', 1, 1),
  (9, 2, 1, 'Farmhouse Pizza', 'Capsicum, onion, sweet corn, olives and tomato with extra cheese.', 299.00, '/images/foods/farmhouse-pizza.svg', 1, 1),
  (10, 2, 1, 'Pepperoni Pizza', 'Generous pepperoni slices over bubbling mozzarella and zesty sauce.', 349.00, '/images/foods/pepperoni-pizza.svg', 0, 1),
  (11, 2, 1, 'BBQ Chicken Pizza', 'Smoky barbecue sauce, grilled chicken, onions and mozzarella.', 369.00, '/images/foods/bbq-chicken-pizza.svg', 0, 1),
  (12, 2, 9, 'Garlic Bread with Cheese', 'Toasted garlic bread topped with melted cheese and herbs.', 129.00, '/images/foods/garlic-bread-with-cheese.svg', 1, 1),
  (13, 2, 7, 'Choco Lava Cake', 'Warm chocolate cake with a molten centre, dusted with sugar.', 99.00, '/images/foods/choco-lava-cake.svg', 1, 1),
  (14, 3, 2, 'Classic Veg Burger', 'Crunchy veggie patty, lettuce, tomato and cheese in a toasted bun.', 129.00, '/images/foods/classic-veg-burger.svg', 1, 1),
  (15, 3, 2, 'Crispy Chicken Burger', 'Golden fried chicken fillet with lettuce and creamy mayo.', 179.00, '/images/foods/crispy-chicken-burger.svg', 0, 1),
  (16, 3, 2, 'Double Cheese Smash Burger', 'Two smashed beef-style patties, double cheese and house sauce.', 229.00, '/images/foods/double-cheese-smash-burger.svg', 0, 1),
  (17, 3, 2, 'Aloo Tikki Burger', 'Spiced potato patty with tangy chutney, tomato and lettuce.', 99.00, '/images/foods/aloo-tikki-burger.svg', 1, 1),
  (18, 3, 9, 'Peri Peri Fries', 'Crisp fries dusted with fiery peri peri seasoning.', 99.00, '/images/foods/peri-peri-fries.svg', 1, 1),
  (19, 3, 8, 'Cold Coffee', 'Thick chilled coffee blended with ice cream and cocoa.', 119.00, '/images/foods/cold-coffee.svg', 1, 1),
  (20, 4, 4, 'Veg Hakka Noodles', 'Wok-tossed noodles with crunchy cabbage, carrot and capsicum.', 159.00, '/images/foods/veg-hakka-noodles.svg', 1, 1),
  (21, 4, 4, 'Chicken Hakka Noodles', 'Street-style noodles with shredded chicken and spring onion.', 189.00, '/images/foods/chicken-hakka-noodles.svg', 0, 1),
  (22, 4, 4, 'Veg Manchurian', 'Crispy vegetable balls in a tangy, garlicky soy sauce.', 169.00, '/images/foods/veg-manchurian.svg', 1, 1),
  (23, 4, 4, 'Chilli Chicken', 'Batter-fried chicken tossed with green chillies, onion and capsicum.', 219.00, '/images/foods/chilli-chicken.svg', 0, 1),
  (24, 4, 4, 'Veg Fried Rice', 'Smoky wok-fried rice with peas, carrot and beans.', 149.00, '/images/foods/veg-fried-rice.svg', 1, 1),
  (25, 4, 9, 'Veg Momos', 'Steamed dumplings filled with cabbage and carrot, with spicy chutney.', 129.00, '/images/foods/veg-momos.svg', 1, 1),
  (26, 4, 9, 'Chicken Momos', 'Juicy minced-chicken dumplings served with fiery red chutney.', 149.00, '/images/foods/chicken-momos.svg', 0, 1),
  (27, 5, 5, 'Masala Dosa', 'Crisp golden dosa filled with spiced potato, with sambar and chutneys.', 119.00, '/images/foods/masala-dosa.svg', 1, 1),
  (28, 5, 5, 'Mysore Masala Dosa', 'Dosa smeared with fiery red chutney and stuffed with potato masala.', 139.00, '/images/foods/mysore-masala-dosa.svg', 1, 1),
  (29, 5, 5, 'Idli Sambar', 'Soft steamed rice cakes with piping hot sambar and coconut chutney.', 89.00, '/images/foods/idli-sambar.svg', 1, 1),
  (30, 5, 5, 'Medu Vada', 'Crunchy lentil doughnuts served with sambar and chutney.', 89.00, '/images/foods/medu-vada.svg', 1, 1),
  (31, 5, 5, 'Onion Uttapam', 'Thick rice pancake topped with onion, tomato and green chilli.', 129.00, '/images/foods/onion-uttapam.svg', 1, 1),
  (32, 5, 8, 'Filter Coffee', 'Strong South Indian decoction coffee with frothy milk.', 49.00, '/images/foods/filter-coffee.svg', 1, 1),
  (33, 6, 7, 'Brownie with Ice Cream', 'Fudgy chocolate brownie with vanilla ice cream and chocolate sauce.', 149.00, '/images/foods/brownie-with-ice-cream.svg', 1, 1),
  (34, 6, 7, 'Red Velvet Pastry', 'Layers of red velvet sponge and cream cheese frosting.', 129.00, '/images/foods/red-velvet-pastry.svg', 1, 1),
  (35, 6, 7, 'Gulab Jamun', 'Soft milk dumplings soaked in warm cardamom syrup.', 89.00, '/images/foods/gulab-jamun.svg', 1, 1),
  (36, 6, 8, 'Mango Shake', 'Thick shake made from ripe Alphonso mango and cold milk.', 129.00, '/images/foods/mango-shake.svg', 1, 1),
  (37, 6, 8, 'Oreo Milkshake', 'Creamy milkshake blended with crushed chocolate cookies.', 149.00, '/images/foods/oreo-milkshake.svg', 1, 1),
  (38, 6, 8, 'Fresh Lime Soda', 'Sparkling lime soda, sweet, salted or mixed.', 69.00, '/images/foods/fresh-lime-soda.svg', 1, 1),
  (39, 6, 7, 'Kulfi Falooda', 'Traditional kulfi with falooda noodles, rose syrup and pistachios.', 119.00, '/images/foods/kulfi-falooda.svg', 1, 0),
  (40, 7, 6, 'Paneer Butter Masala', 'Soft paneer cubes in a rich, buttery tomato gravy.', 249.00, '/images/foods/paneer-butter-masala.svg', 1, 1),
  (41, 7, 6, 'Dal Makhani', 'Black lentils simmered overnight with butter and cream.', 199.00, '/images/foods/dal-makhani.svg', 1, 1),
  (42, 7, 6, 'Tandoori Chicken (Half)', 'Half chicken marinated in yogurt and spices, roasted in the tandoor.', 299.00, '/images/foods/tandoori-chicken-half.svg', 0, 1),
  (43, 7, 6, 'Chicken Tikka', 'Smoky boneless chicken cubes, char-grilled with mint chutney.', 259.00, '/images/foods/chicken-tikka.svg', 0, 1),
  (44, 7, 6, 'Kadhai Paneer', 'Paneer tossed with capsicum in a freshly ground kadhai masala.', 239.00, '/images/foods/kadhai-paneer.svg', 1, 1),
  (45, 7, 6, 'Butter Naan', 'Soft tandoor-baked flatbread brushed with butter.', 49.00, '/images/foods/butter-naan.svg', 1, 1),
  (46, 7, 6, 'Garlic Naan', 'Tandoor naan topped with roasted garlic and coriander.', 59.00, '/images/foods/garlic-naan.svg', 1, 1),
  (47, 8, 9, 'Sprouts Chaat', 'Fresh sprouts with onion, tomato, lemon and chaat masala.', 99.00, '/images/foods/sprouts-chaat.svg', 1, 1),
  (48, 8, 9, 'Greek Salad Bowl', 'Crisp greens, cucumber, olives, tomato and feta with olive oil.', 199.00, '/images/foods/greek-salad-bowl.svg', 1, 1);

INSERT INTO addresses (id, user_id, full_address, city, pincode, phone) VALUES
  (1, 2, 'Flat 302, Shanti Apartments, Dharampeth', 'Nagpur', '440010', '9876543210'),
  (2, 2, 'Plot 14, IT Park Road, Parsodi', 'Nagpur', '440022', NULL),
  (3, 3, '12, Lokmat Square, Sitabuldi', 'Nagpur', '440012', '9822012345'),
  (4, 4, '45, Gandhi Nagar, Wardha Road', 'Nagpur', '440015', NULL);

INSERT INTO orders (id, user_id, restaurant_id, address_id, delivery_address, delivery_phone, payment_method, payment_status, subtotal, total_amount, status, created_at) VALUES
  (1, 2, 1, 1, 'Flat 302, Shanti Apartments, Dharampeth, Nagpur - 440010', '9876543210', 'COD', 'Paid', 0, 0, 'Completed', NOW() - INTERVAL 9 DAY),
  (2, 2, 2, 2, 'Plot 14, IT Park Road, Parsodi, Nagpur - 440022', '9876543210', 'MOCK_ONLINE', 'Paid', 0, 0, 'Completed', NOW() - INTERVAL 5 DAY),
  (3, 3, 5, 3, '12, Lokmat Square, Sitabuldi, Nagpur - 440012', '9822012345', 'COD', 'Paid', 0, 0, 'Completed', NOW() - INTERVAL 4 DAY),
  (4, 3, 1, 3, '12, Lokmat Square, Sitabuldi, Nagpur - 440012', '9822012345', 'COD', 'Paid', 0, 0, 'Completed', NOW() - INTERVAL 6 DAY),
  (5, 2, 2, 1, 'Flat 302, Shanti Apartments, Dharampeth, Nagpur - 440010', '9876543210', 'MOCK_ONLINE', 'Paid', 0, 0, 'Completed', NOW() - INTERVAL 12 DAY),
  (6, 2, 4, 1, 'Flat 302, Shanti Apartments, Dharampeth, Nagpur - 440010', '9876543210', 'COD', 'Pending', 0, 0, 'Rejected', NOW() - INTERVAL 3 DAY),
  (7, 2, 3, 1, 'Flat 302, Shanti Apartments, Dharampeth, Nagpur - 440010', '9876543210', 'COD', 'Pending', 0, 0, 'Preparing', NOW() - INTERVAL 50 MINUTE),
  (8, 3, 1, 3, '12, Lokmat Square, Sitabuldi, Nagpur - 440012', '9822012345', 'COD', 'Pending', 0, 0, 'Pending', NOW() - INTERVAL 12 MINUTE),
  (9, 3, 7, 3, '12, Lokmat Square, Sitabuldi, Nagpur - 440012', '9822012345', 'MOCK_ONLINE', 'Paid', 0, 0, 'Accepted', NOW() - INTERVAL 25 MINUTE),
  (10, 2, 6, 2, 'Plot 14, IT Park Road, Parsodi, Nagpur - 440022', '9876543210', 'COD', 'Pending', 0, 0, 'Ready', NOW() - INTERVAL 70 MINUTE);

INSERT INTO order_items (order_id, food_id, food_name, unit_price, quantity) VALUES
  (1, 1, 'Chicken Biryani', 249.00, 2),
  (1, 7, 'Masala Chaas', 59.00, 2),
  (2, 10, 'Pepperoni Pizza', 349.00, 1),
  (2, 13, 'Choco Lava Cake', 99.00, 1),
  (3, 27, 'Masala Dosa', 119.00, 2),
  (3, 32, 'Filter Coffee', 49.00, 2),
  (4, 1, 'Chicken Biryani', 249.00, 1),
  (4, 6, 'Butter Chicken', 289.00, 1),
  (5, 8, 'Margherita Pizza', 229.00, 2),
  (6, 26, 'Chicken Momos', 149.00, 1),
  (6, 23, 'Chilli Chicken', 219.00, 1),
  (7, 16, 'Double Cheese Smash Burger', 229.00, 1),
  (7, 18, 'Peri Peri Fries', 99.00, 1),
  (7, 19, 'Cold Coffee', 119.00, 1),
  (8, 3, 'Veg Biryani', 189.00, 1),
  (8, 4, 'Egg Biryani', 209.00, 1),
  (9, 40, 'Paneer Butter Masala', 249.00, 1),
  (9, 45, 'Butter Naan', 49.00, 3),
  (10, 35, 'Gulab Jamun', 89.00, 2),
  (10, 36, 'Mango Shake', 129.00, 1);

UPDATE orders SET subtotal = (SELECT SUM(unit_price * quantity) FROM order_items WHERE order_items.order_id = orders.id), total_amount = subtotal;
UPDATE orders SET total_amount = subtotal;

INSERT INTO cart (id, user_id) VALUES (1, 2), (2, 3);

SET FOREIGN_KEY_CHECKS = 1;
