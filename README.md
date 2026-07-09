# AI-Powered QR Digital Menu Platform

A premium, production-ready AI-powered digital menu platform designed for specialty cafes, craft roasteries, and modern restaurants. 

Customers can scan a QR code table standee to browse menus instantly with high-performance search, category filters, and dietary toggles. Restaurant owners can upload images or PDF cards of their existing menus to automatically digitize them in seconds using a built-in **Gemini 3.5 Flash** AI OCR extraction model.

---

## 🚀 Key Features

* **Instant Digital Menu**: Light, lightning-fast mobile-first menu browser designed like top specialty coffee chains. Features instant search, category navigation tabs, and a quick Veg-Only toggle.
* **AI OCR Menu Extractor**: Upload standard menu images (JPG, PNG, WEBP) or PDFs and automatically parse all category groups, food items, prices, descriptions, and dietary statuses using Google Gemini AI.
* **Admin Review & Edit**: Real-time AI OCR canvas allows administrators to review, edit, and correct spelling or price mistakes in place before publishing them to the live menu.
* **Interactive Admin Dashboard**: Full administrative console including:
  * Category CRUD management.
  * Menu Item CRUD management (Quick hide, duplicate, bestseller/recommendation promotion badges).
  * Profile configuration (Logo, Address, Contacts, Social links, Opening hours).
* **Automatic QR Code Generation**: Dynamically creates a printable high-resolution QR code point-of-sale standee linking directly to the live platform.
* **Bulk Operations**: Speed up operations with bulk adjustments (e.g., increase or decrease prices by a percentage value across specific category tags, or execute bulk deletions).
* **Dual-Layer Authentication**: Gated by a JWT session security layer accompanied by a custom Admin Access Key to prevent unauthorized panel access.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite, TypeScript, Tailwind CSS, Motion animations)
* **Backend**: Node.js Express (Fast, secure custom endpoints)
* **AI Extraction Engine**: `@google/genai` (using **Gemini 3.5 Flash**)
* **Data Storage**:
  * **Development/Sandbox**: High-performance JSON file database (`/src/db/db.json`) for seamless zero-setup operations out of the box.
  * **Production (Deploy Ready)**: Prisma ORM configured with standard PostgreSQL relations (`/prisma/schema.prisma`).

---

## 📂 Folder Structure

```text
├── prisma/
│   └── schema.prisma         # Production PostgreSQL Prisma schema models
├── src/
│   ├── db/
│   │   ├── mockDb.ts         # JSON file persistence layer and rich seed files
│   │   └── db.json           # Live local sandbox store
│   ├── components/
│   │   ├── CustomerMenu.tsx  # Mobile-first customer menu explorer
│   │   ├── AdminLogin.tsx    # Secure dual-factor admin credential gate
│   │   ├── AdminDashboard.tsx# Full item/category management, Bulk operations, and QR Generator
│   │   └── QRGenerator.tsx   # QR generation layout
│   ├── types.ts              # Global TypeScript types (Category, MenuItem, etc.)
│   ├── App.tsx               # Client router & session state coordinator
│   ├── main.tsx              # React mounting entrypoint
│   └── index.css             # Tailwind styling definitions
├── server.ts                 # Express Custom Server with backend API routes & Vite middleware
├── package.json              # Platform scripts and node dependency configurations
└── .env.example              # Documentation for required environment variables
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory (or inject these inside your hosting secrets panel):

```env
# Google GenAI Key (Configure this in AI Studio Settings > Secrets)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Private key used for securely signing JWT authentication sessions
JWT_SECRET="YOUR_SECURE_JWT_SECRET"

# Production PostgreSQL Connection URL (Used by Prisma ORM)
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
```

---

## 🏃 Local Development Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Boot Platform**:
   This runs the Express full-stack server on port `3000` with hot-reloading active.
   ```bash
   npm run dev
   ```

3. **Access App**:
   * Customer Menu: `http://localhost:3000`
   * Admin Terminal: `http://localhost:3000/admin`

---

## 🔐 Admin Credentials (Pre-Seeded)

To test the admin terminal out-of-the-box, use these default credentials:
* **Username**: `admin`
* **Password**: `admin123`
* **Access Key**: `BB-SAFE-KEY-2026`

*You can edit the Cafe Name, address, working hours, and the Admin Access Key directly from the **Cafe Settings** panel inside the dashboard.*

---

## ⚡ Production Deployment to Vercel + PostgreSQL

For production deployments, the project is configured to scale easily to Next.js or traditional Node.js/Prisma deployments:

### Option A: Prisma + PostgreSQL Setup
1. Point your `DATABASE_URL` environment variable to your active PostgreSQL instance.
2. Initialize and migrate the schema on your server:
   ```bash
   npx prisma db push
   ```
3. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```

### Option B: Deploying on Vercel
1. Upload this repository to your GitHub account.
2. Import the project in Vercel.
3. Bind your `GEMINI_API_KEY`, `JWT_SECRET`, and `DATABASE_URL` inside the **Environment Variables** panel in Vercel settings.
4. Click **Deploy**. Vercel will automatically compile the client static pages and link your Express router or compile Next.js serverless functions perfectly.

---

## 📝 License
This project is licensed under the Apache-2.0 License.
