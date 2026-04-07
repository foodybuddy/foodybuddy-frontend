# FoodyBuddy — Frontend

Student-facing web app for the Karunya canteen. Built with React, deployed on Vercel.

---

## What This Is

FoodyBuddy lets students order food from the Karunya canteen without standing in a queue. They browse the menu, pay online or choose cash, and collect their food when it's ready. The canteen staff manage everything from the Admin Panel.

---

## Screens

| Screen | What it does |
|---|---|
| Landing Page | Welcome screen with a Get Started button |
| Login / Register | Students sign up with their name, WhatsApp number, and password |
| Menu | Browse all items, filter by category (Meals, Snacks, Drinks, Breakfast), search by name |
| Cart | Review items, choose Dine-in or Takeaway |
| Payment | Pay via UPI / Card / Net Banking (Razorpay) or cash at counter |
| Success | Order confirmed with order ID and WhatsApp notification |
| Order Tracker | Live status screen — shows Received → Preparing → Ready → Collected, updates every 8 seconds |
| Order History | All past orders with option to reorder in one tap |
| Profile | Edit name and WhatsApp number |
| Admin Panel | For canteen staff only (see below) |

---

## Admin Panel

Only accessible with the admin password. Canteen staff use this to manage everything.

**Live Orders tab**
- Shows all active orders in real time (auto-refreshes every 10 seconds)
- Each order shows: student name, phone, items ordered, total, payment method (UPI or Cash), and order type (Dine-in / Takeaway)
- Staff advance each order through: New → Preparing → Ready → Done
- When marked Ready, a WhatsApp message is automatically sent to the student
- Orders can be cancelled from here

**History tab**
- Shows all completed (Done) orders for the day
- Displays total revenue at the top
- Staff can clear history and reset revenue at the end of each day using the Clear History button

**Menu tab**
- Add, edit, or delete menu items
- Upload a photo for each item
- Set name, price, category, and veg/non-veg type
- Toggle items on/off (e.g. mark something as unavailable without deleting it)

---

## How Students Use It

1. Open the website on their phone or laptop
2. Register once with their name, WhatsApp number, and a password
3. Browse the menu and add items to cart
4. Choose Dine-in or Takeaway
5. Pay online (UPI/card) or choose Cash at Counter
6. Get a WhatsApp confirmation immediately
7. Track the order live until it says Ready for Pickup
8. Collect food at the counter

---

## Notifications

Students receive WhatsApp messages at two points:
- When the order is placed and confirmed
- When the canteen marks the order as Ready for Pickup

---

## Key Details

- Students log in with their **name** and **password** (no email needed)
- WhatsApp number is used only for order notifications
- Admin access is given by using the admin password during registration — this makes the account an admin account
- All payments go through Razorpay — UPI, debit/credit card, and net banking are supported
- Cash orders are also supported — no online payment required, student pays at the counter

---

## Deployed At

[foofybuddy.shop](https://foodybuddy.shop)
