# NEXORA Gaming

Full-stack gaming e-commerce mini project using React, Vite, Tailwind CSS, Node.js, Express.js and MongoDB.

## Requirements
- Node.js 20+
- MongoDB local or MongoDB Atlas
- VS Code

## 1. Install
Open this folder in VS Code terminal:
```bash
npm install
npm run install-all
```

## 2. Environment
Create `server/.env` from `server/.env.example` and set your MongoDB URI and JWT secret.

## 3. Seed demo data
```bash
npm run seed
```

This creates demo games and accounts:
- Admin: admin@nexora.dev / Admin@123
- User: player@nexora.dev / Player@123

## 4. Start
```bash
npm run dev
```
Frontend: http://localhost:5173
Backend: http://localhost:5000

## Main features
Home, store, live search, game details, comparison, compatibility checker, wishlist, cart, checkout, orders, dashboard, achievements, profile, admin dashboard, product CRUD, order management, inventory and reports.

## Notes
Payment is intentionally simulated for the college project. No real card/UPI payment is processed.
