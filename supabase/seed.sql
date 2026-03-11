-- ============================================================
-- Halfway Cafe — Seed Data
-- Run this AFTER schema.sql in Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── Menu Items: Breakfast ───

INSERT INTO menu_items (name, description, price, category, image_url, dietary, featured, sort_order) VALUES
('The Full English',
 'Two eggs, bacon, sausage, baked beans, grilled tomato, mushrooms, hash brown & toast. The classic.',
 9.50, 'breakfast',
 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80',
 '{}', true, 1),

('The Veggie Full',
 'Two eggs, veggie sausages, baked beans, grilled tomato, mushrooms, hash brown, halloumi & toast.',
 9.00, 'breakfast',
 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80',
 '{vegetarian}', false, 2),

('The Vegan Full',
 'Vegan sausages, smashed avocado, baked beans, grilled tomato, mushrooms, hash brown & sourdough.',
 9.50, 'breakfast',
 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
 '{vegan}', false, 3),

('Fluffy Pancakes',
 'Stack of three buttermilk pancakes with maple syrup, butter & a dusting of icing sugar.',
 7.50, 'breakfast',
 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
 '{vegetarian}', true, 4),

('Eggs Benedict',
 'Poached eggs on toasted English muffin with back bacon & hollandaise sauce.',
 8.50, 'breakfast',
 'https://images.unsplash.com/photo-1608039829572-9b0189468027?w=600&q=80',
 '{}', false, 5),

('Avocado on Toast',
 'Smashed avocado on thick sourdough, chilli flakes, cherry tomatoes & a poached egg.',
 7.00, 'breakfast',
 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=80',
 '{vegetarian}', false, 6),

('Three-Egg Omelette',
 'Fluffy omelette with your choice of cheese, ham, mushrooms, peppers or tomato. Served with toast.',
 7.50, 'breakfast',
 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&q=80',
 '{}', false, 7),

('Proper Porridge',
 'Creamy oats topped with honey, banana & a pinch of cinnamon. Warm and filling.',
 4.50, 'breakfast',
 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80',
 '{vegetarian}', false, 8);

-- ─── Menu Items: Lunch ───

INSERT INTO menu_items (name, description, price, category, image_url, dietary, featured, sort_order) VALUES
('Jacket Potato',
 'Crispy baked potato with butter and your choice of beans, cheese, tuna mayo or coleslaw.',
 6.50, 'lunch',
 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
 '{vegetarian}', false, 9),

('Fish & Chips',
 'Beer-battered cod fillet with thick-cut chips, mushy peas & tartare sauce.',
 11.00, 'lunch',
 'https://images.unsplash.com/photo-1579208030886-b1715a8e7e8c?w=600&q=80',
 '{}', true, 10),

('Bangers & Mash',
 'Cumberland sausages on buttery mashed potato with onion gravy and garden peas.',
 9.50, 'lunch',
 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
 '{}', false, 11),

('Chicken Club Sandwich',
 'Grilled chicken, crispy bacon, lettuce, tomato & mayo on toasted white bread. Served with crisps.',
 8.00, 'lunch',
 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
 '{}', false, 12),

('Soup of the Day',
 'Homemade soup served with a thick slice of crusty bread and butter. Ask your server for today''s pick.',
 5.00, 'lunch',
 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
 '{vegetarian}', false, 13);

-- ─── Menu Items: Burgers ───

INSERT INTO menu_items (name, description, price, category, image_url, dietary, featured, sort_order) VALUES
('The Halfway Burger',
 'Beef patty, melted cheddar, lettuce, tomato, pickles & our secret sauce in a brioche bun. With chips.',
 10.50, 'burgers',
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
 '{}', true, 14),

('Crispy Chicken Burger',
 'Buttermilk fried chicken, slaw, pickles & sriracha mayo in a brioche bun. With chips.',
 10.00, 'burgers',
 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80',
 '{}', false, 15),

('Halloumi & Portobello Burger',
 'Grilled halloumi, portobello mushroom, roasted pepper, rocket & pesto in a brioche bun. With chips.',
 9.50, 'burgers',
 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80',
 '{vegetarian}', false, 16);

-- ─── Menu Items: Desserts ───

INSERT INTO menu_items (name, description, price, category, image_url, dietary, featured, sort_order) VALUES
('Sticky Toffee Pudding',
 'Warm date sponge drenched in toffee sauce, served with vanilla custard.',
 5.50, 'desserts',
 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80',
 '{vegetarian}', false, 17),

('Apple Crumble',
 'Bramley apple crumble with a golden oat topping, served with custard or ice cream.',
 5.00, 'desserts',
 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600&q=80',
 '{vegetarian}', false, 18);

-- ─── Menu Items: Drinks ───

INSERT INTO menu_items (name, description, price, category, image_url, dietary, featured, sort_order) VALUES
('Builder''s Tea',
 'A proper strong brew. PG Tips, served in a mug the way it should be.',
 2.00, 'drinks',
 'https://images.unsplash.com/photo-1561882468-9110d70d166c?w=600&q=80',
 '{vegetarian}', false, 19),

('Flat White',
 'Double shot of espresso with velvety steamed milk.',
 3.20, 'drinks',
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
 '{vegetarian}', false, 20),

('Fresh Orange Juice',
 'Freshly squeezed orange juice. No added sugar, no concentrate — just oranges.',
 3.50, 'drinks',
 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',
 '{vegan,gluten-free}', false, 21),

('Classic Milkshake',
 'Thick milkshake in chocolate, vanilla or strawberry. Made with real ice cream.',
 4.00, 'drinks',
 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
 '{vegetarian}', false, 22);

-- ─── Opening Hours ───

INSERT INTO opening_hours (day_name, day_order, open_time, close_time, is_closed) VALUES
('Monday',    1, '07:00', '21:00', false),
('Tuesday',   2, '07:00', '21:00', false),
('Wednesday', 3, '07:00', '21:00', false),
('Thursday',  4, '07:00', '21:00', false),
('Friday',    5, '07:00', '21:00', false),
('Saturday',  6, '08:00', '22:00', false),
('Sunday',    7, '08:00', '22:00', false);

-- ─── Categories ───

INSERT INTO categories (name, slug, sort_order) VALUES
('Breakfast', 'breakfast', 1),
('Lunch',     'lunch',     2),
('Burgers',   'burgers',   3),
('Desserts',  'desserts',  4),
('Drinks',    'drinks',    5);
