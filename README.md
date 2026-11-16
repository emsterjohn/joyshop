# JoyShop Prototype

A simple customer-facing fashion storefront built with React and Vite.

## Features
- Responsive pink-and-white storefront
- Product categories and search
- Add to cart, update quantity, and remove products
- Cart subtotal in Philippine pesos
- Customer registration, sign in, and sign out
- Customer demo order history
- Checkout with Cash on Delivery (COD), GCash, or Maya selection
- GCash/Maya sender mobile number and transaction reference fields
- Demo order confirmation and local browser storage

## Run the project
1. Extract the ZIP file.
2. Open the extracted `JoyShop-Prototype` folder in VS Code.
3. Open **Terminal > New Terminal**.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL shown in the terminal, usually `http://localhost:5173/`.

## Important prototype limitations
- This is a frontend prototype. Accounts, cart contents, and demo orders are stored in the current browser using localStorage. They do not sync between devices and are not protected by a production backend.
- Passwords are hashed in the browser for this demonstration, but this is not a production authentication system. Do not use real or reused passwords.
- COD, GCash, and Maya are payment method selections only. GCash/Maya payments are not sent, charged, or verified. The order is marked **Pending manual verification**. No real merchant number or QR code is configured.
- For real customer accounts, order storage, and live GCash/Maya payments, connect a secure backend/database and an approved payment provider. Never collect or store wallet PINs or OTPs.
- Product images load from Unsplash and require an internet connection.

## Production build
Run `npm run build`.
