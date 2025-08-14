# Bloomhabit

## 🌸 Description

Bloomhabit is a habit-focused app that helps users create and maintain good habits while breaking bad ones, using a **garden-inspired metaphor**.
Each habit is represented as a flower in your personal garden — one that **blooms** with consistency and **withers** when neglected.
With **AI-driven insights**, **Progressive Web App (PWA)** support, and a **NestJS + Nuxt 3** tech stack enhanced with **Foundation CSS**, Bloomhabit is designed to help you **cultivate lasting positive change**.

---

## ✨ Key Features

- 🌱 **Habit Garden Metaphor** – Visualize your habits as flowers in a personal garden.
- 📅 **Habit Tracking** – Create, edit, and categorize habits with progress visualization.
- 💧 **Growth Feedback** – See habits bloom or gently wither based on daily care.
- 🔄 **Habit Swapping** – Replace bad habits with positive ones in your garden.
- 🤖 **AI Gardener** – Get personalized habit insights, tips, and encouragement.
- 📲 **PWA Support** – Works offline, installable on devices, and offers native-like experience.
- 🎨 **Responsive Design** – Built with Foundation CSS and Tailwind CSS for beautiful, mobile-first experiences.
- 🔔 **Reminders & Notifications** – Push notifications powered by Firebase Cloud Messaging.
- 🔐 **Authentication** – Secure sign-in with OAuth and JWT.
- 👥 **Community Gardens** _(future)_ – Group habit tracking and shared goals.
- 📓 **Journaling & Reflection** – Record insights that enrich your habit growth.

---

## 🛠 Tech Stack

- **Frontend:** [Nuxt 3 (Vue.js)](https://nuxt.com/) with PWA support
- **CSS Framework:** [Foundation CSS](https://get.foundation/) + [Tailwind CSS](https://tailwindcss.com/) + [SCSS](https://sass-lang.com/) for responsive design
- **Backend:** [NestJS](https://nestjs.com/) (Node.js/TypeScript)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Auth:** OAuth & JWT
- **Notifications:** Firebase Cloud Messaging (FCM)
- **AI Integration:** AI APIs (e.g., OpenAI) for personalized coaching

---

## 📂 Project Structure

```bash
bloomhabit/
├── /frontend # Nuxt 3 app source code
│ ├── /components # Vue components
│ ├── /pages # App pages & routes
│ ├── /composables # Reusable Vue composition functions
│ ├── /plugins # Nuxt plugins (PWA, FCM, etc.)
│ ├── /assets # Static styles & images
│ │ └── /css # Foundation CSS + Tailwind CSS + custom styles
│ └── nuxt.config.ts # Nuxt configuration
│
├── /backend # NestJS backend service
│ ├── /src
│ │ ├── /modules # Feature modules (habits, users, auth)
│ │ ├── /common # Helpers, guards, interceptors
│ │ ├── /config # Environment & settings
│ │ ├── /database # Entities & migrations
│ │ └── app.module.ts # Root module
│
├── /docs # Project documentation
├── /scripts # Build & deployment scripts
├── .env # Environment variables
├── docker-compose.yml # Local development stack
└── package.json # Dependencies & scripts

```

---

## 🏗 High-Level Architecture

- **Frontend (Nuxt 3 PWA):** Interactive UI, offline caching, push notifications, garden visualizations.
- **CSS Framework:** Foundation CSS for responsive components + Tailwind CSS for utility-first styling.
- **Backend (NestJS):** REST/GraphQL API for habits, authentication, AI features.
- **Database (PostgreSQL):** Stores users, habits, streaks, and journal entries.
- **AI Service:** External AI APIs to provide personalized recommendations.
- **FCM:** Sends reminders & motivational notifications.
- **OAuth + JWT:** Secure authentication & authorization.

---

## ⚙️ How It Works

1. Users sign up or log in with OAuth.
2. Each habit is visualized as a unique flower in their personal garden.
3. Completing a habit waters the flower, helping it grow and bloom.
4. Missing a habit causes it to slowly wilt — encouraging gentle accountability.
5. The AI Gardener analyzes streaks and patterns, sending personalized nudges.
6. Users can keep journals that "enrich the soil" for future growth.
7. Notifications remind users to maintain their habits.
8. Responsive design ensures the garden looks beautiful on all devices.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 13 (or Docker)
- **Firebase** account (for FCM)
- **OAuth provider** credentials (Google, GitHub, etc.)
- _(Optional)_ Docker & Docker Compose

### Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/bloomhabit.git
   cd bloomhabit
   ```

2. **Start the database**

   ```bash
   docker-compose up -d postgres
   ```

3. **Install dependencies**

   ```bash
   npm run install:all
   ```

4. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

### Manual Setup

#### 1. Clone repo

```bash
git clone https://github.com/yourusername/bloomhabit.git
cd bloomhabit
```

#### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

#### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

#### 4. Create and configure .env files

```bash
# Copy the example file
cp env.example .env

# Edit .env with your configuration
# At minimum, set:
# - DB_PASSWORD
# - JWT_SECRET
# - Your OAuth credentials
# - Firebase configuration
```

#### 5. Setup PostgreSQL DB & run migrations

```bash
# Create database
createdb bloomhabit

# Run the initialization script
psql -d bloomhabit -f scripts/init-db.sql
```

#### 6. Start backend (dev)

```bash
cd backend
npm run start:dev
```

#### 7. Start frontend (dev)

```bash
cd frontend
npm run dev
```

Open [**http://localhost:3000**](http://localhost:3000) to view your app.

---

## 📖 Current Implementation Status

### ✅ **Completed Features**

- **Project Structure** - Monorepo with frontend/backend separation
- **Frontend Foundation** - Nuxt 3, Tailwind CSS, Foundation CSS, SCSS
- **Backend Foundation** - NestJS, TypeORM, PostgreSQL integration
- **Database Schema** - User, Habit, HabitLog, JournalEntry entities
- **Authentication System** - JWT guards, OAuth integration (Google, GitHub)
- **Habits Management** - CRUD operations, logging, streak tracking
- **Garden Visualization** - Habit garden dashboard with visual metaphors
- **AI Gardener** - OpenAI integration, personalized insights, coaching
- **PWA Features** - Offline support, service worker, manifest, installable
- **Habit Logging** - Daily completion tracking, analytics, streak calculation
- **Docker Setup** - Local development environment with PostgreSQL
- **Advanced Analytics** - Performance metrics, progress reports, trend analysis

### 🚧 **In Progress**

- **Real-time Notifications** - Push notification backend integration

### 📋 **Planned Features**

- **Community Features** - Shared gardens and group challenges
- **Mobile App** - React Native or Flutter implementation
- **Advanced Goal Setting** - SMART goals with progress tracking
- **Social Features** - Friend connections and habit sharing
- **Export/Import** - Data portability and backup systems

---

## 🎨 CSS Framework Features

### **Foundation CSS + SCSS**

- **Responsive Grid System** - Mobile-first grid layout with SCSS customization
- **Component Library** - Buttons, forms, navigation, modals with SCSS variables
- **Responsive Utilities** - Show/hide classes for different screen sizes
- **Accessibility** - Built-in accessibility features
- **SCSS Customization** - Easy theming with SCSS variables and mixins
- **Modular Components** - Import only the Foundation components you need

### **Tailwind CSS**

- **Utility-First** - Rapid UI development with utility classes
- **Custom Components** - Garden-themed component classes
- **Responsive Design** - Mobile-first responsive utilities
- **Custom Colors** - Garden-inspired color palette

### **SCSS Benefits**

- **Variables & Mixins** - Reusable styles and consistent theming
- **Nested Rules** - Cleaner, more maintainable CSS structure
- **Functions** - Advanced color manipulation and calculations
- **Partials** - Modular SCSS file organization
- **Foundation Integration** - Direct access to Foundation's SCSS source

### **Integration Benefits**

- **Best of Both Worlds** - Foundation's robust components + Tailwind's utility classes + SCSS power
- **Responsive Design** - Mobile-first approach with Foundation's grid system
- **Theme Consistency** - Unified color scheme and design language via SCSS variables
- **Developer Experience** - Familiar tools for all three frameworks
- **Performance** - Only include the Foundation components you actually use

---

## 🔧 Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend in development mode
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build both applications
npm run build

# Database operations
npm run db:setup
npm run db:migrate

# Run tests
npm run test
```

---

## 🌐 API Documentation

Once the backend is running, visit [http://localhost:3001/api](http://localhost:3001/api) for interactive API documentation powered by Swagger.

---

## 📖 Documentation

Available in `/docs`:

- API Reference
- Auth flows
- AI integration details
- PWA setup & caching
- Deployment guides
- CSS Framework usage guide

---

## 🗺 Roadmap

- **v1.0** – Core habit gardening features, AI Gardener MVP, PWA, auth, and notifications.
- **v1.1** – Community gardens & group challenges.
- **v1.2** – Expanded AI coaching with voice tips.
- **v2.0** – Cross-platform mobile apps, multi-language support, wearable integrations.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Bloomhabit** — _Grow your best self, one bloom at a time._ 🌿🌸
