# ⚡ ServiceFinder — Hyper-Local Mumbai Neighborhood Trade Directory

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloudflare%20Workers-f38020?style=for-the-badge&logo=cloudflare)](https://servicefinder.service-finder.workers.dev)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-ffca28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers%20Edge-faae40?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)

> **ServiceFinder** is an on-demand, hyper-local neighborhood services directory engineered specifically for Mumbai's Western Railway corridor (Churchgate to Virar). It bridges local homeowners and residents with verified, background-checked trade professionals (Electricians, Plumbers, AC Technicians, Carpenters, Painters, and Appliance Specialists) through voice-enabled AI diagnosis, real-time railway station filtering, and transparent direct communication.

---

## 🌐 Live Platform & Links

- **Production URL:** [https://servicefinder.service-finder.workers.dev](https://servicefinder.service-finder.workers.dev)
- **GitHub Repository:** [https://github.com/shani0136/ServiceFinder](https://github.com/shani0136/ServiceFinder)
- **Statutory Terms & Conditions:** [https://servicefinder.service-finder.workers.dev/terms](https://servicefinder.service-finder.workers.dev/terms)
- **Privacy Policy (DPDPA 2023):** [https://servicefinder.service-finder.workers.dev/privacy](https://servicefinder.service-finder.workers.dev/privacy)
- **Direct Support Desk:** [https://servicefinder.service-finder.workers.dev/contact](https://servicefinder.service-finder.workers.dev/contact)

---

## ✨ Key Features

### 1. 🤖 AI Smart Problem Diagnosis & Voice Search
- Natural language issue input: Describe symptoms (e.g., *"AC is leaking water on the floor and making noise"*) to receive instant diagnostic guidance and the exact recommended trade specialist.
- Voice-enabled search with Web Speech API for quick hands-free discovery.
- Google Gemini API integration with intelligent fallback heuristics for low-latency recommendations.

### 2. 📍 Mumbai Western Railway Hyper-Local Station Filtering
- Optimized for Mumbai's geography: Filter pros by exact railway stations (Borivali, Kandivali, Malad, Goregaon, Andheri, Bandra, Dadar, etc.).
- Direct distance and neighborhood sorting to ensure rapid 30-minute doorstep service.

### 3. 🚨 Instant Emergency Breakdown Mode
- One-click toggle for urgent household emergencies (pipe burst, short circuit, gas leak).
- Instantly surfaces only verified providers currently marked **Active & Available for Emergency Dispatch**.

### 4. 👷 Dedicated Service Provider Portal (`/provider`)
- **Self-Service Onboarding:** Step-by-step registration for neighborhood tradespeople.
- **Identity & Trade Verification:** Upload Aadhaar, trade licenses, certifications, and experience records for admin approval.
- **Live Availability Switch:** Providers toggle their active dispatch status in real time.
- **Rate Card & Skills Showcase:** Set transparent visiting charges, hourly rates, and trade specialties.

### 5. 🛡️ Strict Role-Gated Admin Control Center (`/admin/dashboard`)
- **Credential Verification Queue:** Review, approve, reject, or suspend service provider applications.
- **Live Directory Metrics:** Track verified active pros, pending queues, customer registrations, and platform activity.
- **User Account Management:** Inspect customer and provider profiles with server-side role enforcement.

### 6. ⚖️ Enterprise Legal & Privacy Compliance
- **Digital Personal Data Protection Act, 2023 (DPDPA):** Zero-commercial-sale guarantee, strict data encryption, and 30-day permanent erasure procedure.
- **IT Act, 2000 & Consumer Protection Rules, 2020:** Disclosed Statutory Grievance Redressal and Data Protection Officers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling & Aesthetics** | Pure CSS Modules, Modern Glassmorphism (`--glass-*`, `--poly-*`), [Framer Motion](https://www.framer.com/motion/) |
| **Serverless Edge** | [Cloudflare Workers](https://workers.cloudflare.com/), `@cloudflare/vite-plugin` |
| **Database & Auth** | [Google Firebase](https://firebase.google.com/) Firestore (Document DB) & Firebase Authentication |
| **Artificial Intelligence** | [Google Gemini API](https://ai.google.dev/) for multimodal problem diagnosis |
| **Production CDN** | Cloudflare Global Anycast Edge Network |

---

## 📂 Project Architecture

```plaintext
ServiceFinder/
├── public/                 # Static assets, logos, and vector icons
├── src/
│   ├── assets/             # Curated photography & spotlights
│   ├── components/
│   │   ├── layout/         # Navbar, Sidebar, Footer, AmbientBackground
│   │   └── ui/             # Modals, ProviderCards, GlowButton, CookieConsent, RatingStars
│   ├── constants/          # Mumbai station locations, categories, rate suggestions
│   ├── hooks/              # Voice search, 3D tilt micro-animations
│   ├── lib/
│   │   ├── auth.ts         # Multi-role authentication (Admin, Provider, Customer)
│   │   ├── directoryService.ts # Real-time Firestore sync & CRUD logic
│   │   ├── firebase.ts     # Firebase client configuration & init
│   │   ├── gemini.ts       # AI diagnosis prompt pipeline
│   │   └── location.ts     # Western Railway station geocoding
│   ├── pages/
│   │   ├── sections/       # Landing page sections (Hero, Popular, Trust, Impact)
│   │   ├── views/          # AdminView, DirectoryView, FinderView, OnboardingView
│   │   ├── AdminLoginPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── CustomerHomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── PrivacyPolicyPage.tsx
│   │   ├── ProviderPortalPage.tsx
│   │   ├── ProvidersPage.tsx
│   │   ├── ServicesPage.tsx
│   │   └── TermsPage.tsx
│   ├── store/              # Global state management via React Context
│   ├── types/              # TypeScript definitions for Providers, Users, Reviews
│   ├── index.css           # Global design system & polymorphic tokens
│   └── main.tsx            # Root entry point with ErrorBoundary
├── worker/
│   └── index.ts            # Cloudflare Worker SSR & static asset proxy
├── firestore.rules         # Enterprise security rules for Firestore access control
├── wrangler.jsonc          # Cloudflare Worker deployment configuration
└── package.json            # Project dependencies & build pipelines
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **Package Manager:** npm (v9+) or pnpm
- **Firebase Account:** A Firebase project with Firestore and Authentication enabled.

### 2. Clone the Repository
```bash
git clone https://github.com/shani0136/ServiceFinder.git
cd ServiceFinder
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root based on `.env.example`:
```bash
cp .env.example .env
```
Fill in your Firebase web application keys:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build & Deployment

### Production Build
Compile TypeScript and bundle optimized assets using Vite:
```bash
npm run build
```

### Cloudflare Workers Deployment
Deploy directly to the Cloudflare Global Edge network:
```bash
npm run deploy
```

---

## 🔒 Security & Role Separation

- **Customer:** Can search, filter, view verified provider contact details (call/WhatsApp), and schedule callback requests.
- **Provider:** Isolated to the **Provider Portal** (`/provider`) to manage their trade profile, rates, KYC documents, and live status.
- **Administrator:** Strictly gated to verified admin credentials (`/admin/login`). Allows inspection and approval of pending provider registrations.

---

## 📄 License & Attribution

This project is developed as part of the **CEP Project** initiative.  
All rights reserved © 2026 **ServiceFinder Mumbai**.
