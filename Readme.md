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
├── /mobile # React Native mobile application
│ ├── /src
│ │ ├── /components # Reusable UI components
│ │ ├── /screens # Screen components
│ │ ├── /navigation # Navigation configuration
│ │ ├── /contexts # React Context providers
│ │ ├── /services # API and external services
│ │ ├── /types # TypeScript type definitions
│ │ └── /constants # App constants and configuration
│ ├── /android # Android-specific configuration
│ ├── /ios # iOS-specific configuration
│ └── package.json # Mobile app dependencies
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
- **Mobile App (React Native):** Native mobile application with offline support, push notifications, and touch-optimized interface.
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

6. **Set up mobile app (optional)**
   ```bash
   cd mobile
   npm install
   # For iOS (macOS only)
   cd ios && pod install && cd ..
   # Start Metro bundler
   npm start
   # Run on device/emulator
   npm run android  # or npm run ios
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
- **Real-time Notifications** - Push notification backend integration, notification management, and user preferences
- **Community Features** - Shared gardens, group challenges, and collaborative habit building
- **Mobile App** - React Native mobile application with native performance and offline support
- **Advanced Goal Setting** - SMART goals with progress tracking, milestones, and analytics
- **Multi-language Support** - Internationalization (i18n) with 10+ languages, RTL support, and automatic language detection
- **Social Features** - Friend connections, habit sharing, and social interactions
- **Wearable Integrations** - Health data tracking, device management, and automatic synchronization

### 📋 **Planned Features**

- **Export/Import** - Data portability and backup systems

---

## 🌍 Multi-language Support (i18n)

### **Frontend Internationalization**

- **Nuxt i18n Module** - Seamless integration with Vue 3 and Nuxt 3
- **10+ Languages** - English, Spanish, French, German, Portuguese, Italian, Japanese, Korean, Chinese, Arabic
- **RTL Support** - Full right-to-left language support for Arabic
- **Automatic Detection** - Browser language detection with fallback
- **Language Switcher** - Beautiful dropdown component with flags and native names
- **Persistent Preferences** - Language choice saved in localStorage
- **Composable Utilities** - `useI18nUtils` for easy translation management

### **Backend Internationalization**

- **NestJS i18n Module** - Server-side internationalization support
- **Localized Responses** - API responses in user's preferred language
- **Validation Messages** - Localized error and validation messages
- **Language Detection** - Automatic language detection from headers, cookies, and query params
- **Translation Files** - JSON-based translation management
- **Interceptor & Filters** - Automatic language handling for all API endpoints

### **Supported Languages**

| Language   | Code | Flag | Native Name | RTL |
| ---------- | ---- | ---- | ----------- | --- |
| English    | `en` | 🇺🇸   | English     | No  |
| Spanish    | `es` | 🇪🇸   | Español     | No  |
| French     | `fr` | 🇫🇷   | Français    | No  |
| German     | `de` | 🇩🇪   | Deutsch     | No  |
| Portuguese | `pt` | 🇧🇷   | Português   | No  |
| Italian    | `it` | 🇮🇹   | Italiano    | No  |
| Japanese   | `ja` | 🇯🇵   | 日本語      | No  |
| Korean     | `ko` | 🇰🇷   | 한국어      | No  |
| Chinese    | `zh` | 🇨🇳   | 中文        | No  |
| Arabic     | `ar` | 🇸🇦   | العربية     | Yes |

### **Features**

- **Automatic Language Detection** - Detects user's preferred language from browser settings
- **URL-based Language Switching** - Language-specific URLs (e.g., `/es/settings`, `/fr/garden`)
- **Localized Content** - All UI text, error messages, and API responses in user's language
- **RTL Layout Support** - Automatic text direction switching for Arabic
- **Number & Date Formatting** - Locale-specific formatting for numbers, dates, and currencies
- **Pluralization Rules** - Language-specific plural forms
- **Fallback System** - Graceful fallback to English for missing translations
- **Translation Management** - Easy-to-maintain JSON translation files
- **Performance Optimized** - Lazy loading of translation files

---

## 👥 Social Features

### **Friend Connections**

- **Friend Requests** - Send and receive friend requests with personalized messages
- **Friendship Types** - Categorize relationships (Friend, Family, Colleague, Mentor, Mentee)
- **User Search** - Find users by name or username to build your network
- **Mutual Friends** - Discover shared connections and expand your social circle
- **Block/Unblock** - Manage unwanted connections with user blocking features
- **Friendship Management** - Accept, reject, or remove friends with ease

### **Habit Sharing**

- **Permission-Based Sharing** - Control access levels (View, Comment, Support, Full Access)
- **Personal Messages** - Add context and encouragement when sharing habits
- **Shared Habit Dashboard** - View habits shared by friends and track their progress
- **Support System** - Send encouragement, likes, and supportive messages
- **Share Analytics** - Track views, interactions, and engagement on shared habits
- **Popular Habits** - Discover trending habits shared by the community

### **Social Interactions**

- **Activity Feed** - Track likes, comments, support, and achievements
- **Milestone Celebrations** - Automatically share achievements and milestones
- **Streak Recognition** - Celebrate streak achievements with friends
- **Goal Achievements** - Share completed goals and inspire others
- **Social Statistics** - Monitor your social engagement and network growth
- **Real-time Updates** - Stay connected with live activity notifications

### **Community Integration**

- **Seamless Integration** - Works alongside existing community gardens and challenges
- **Cross-Platform Sharing** - Share habits between web and mobile applications
- **Privacy Controls** - Granular control over what and with whom you share
- **Social Analytics** - Insights into your social network and habit sharing impact

### **Usage Examples**

```vue
<!-- Basic translation -->
<h1>{{ $t('app.name') }}</h1>

<!-- Translation with parameters -->
<p>{{ $t('garden.greeting', { name: userName }) }}</p>

<!-- Pluralization -->
<span>{{ $tc('common.units.day', count) }}</span>

<!-- Date formatting -->
<span>{{ $d(date, 'long') }}</span>

<!-- Number formatting -->
<span>{{ $n(value, 'currency') }}</span>
```

```typescript
// Using the i18n composable
const { getText, formatDate, isRTL } = useI18nUtils();

const message = getText('common.messages.success');
const formattedDate = formatDate(new Date(), 'short');
const isRightToLeft = isRTL.value;
```

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

# Mobile App Development
cd mobile && npm install          # Install mobile dependencies
cd mobile && npm start            # Start Metro bundler
cd mobile && npm run android      # Run on Android device/emulator
cd mobile && npm run ios          # Run on iOS device/simulator (macOS only)

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
- **v1.3** – React Native mobile app with offline support and push notifications.
- **v1.4** – Advanced goal setting with SMART goals, progress tracking, and analytics.
- **v1.5** – Multi-language support with 10+ languages, RTL support, and automatic language detection.
- **v1.6** – Social features with friend connections, habit sharing, and social interactions.
- **v1.7** – Wearable integrations with health data tracking and device management.

---

## 🚀 Next Steps & Remaining Features

### **Advanced Analytics & Insights** 📊

- **Habit Correlation Analysis** – Find relationships between different habits
- **Predictive Analytics** – Forecast habit success based on patterns
- **Custom Dashboard Builder** – Let users create personalized analytics views
- **Export & Reporting** – PDF reports, data export to CSV/JSON

### **Gamification & Rewards** 🏆

- **Achievement System** – Badges, milestones, streak rewards
- **Level System** – User progression with experience points
- **Challenges & Quests** – Daily/weekly challenges with rewards
- **Leaderboards** – Global and friend-based rankings

### **Advanced Garden Visualization** 🌸

- **3D Garden View** – Interactive 3D garden representation
- **Seasonal Themes** – Different garden styles based on time/achievements
- **Custom Garden Layouts** – User-defined garden arrangements
- **Garden Sharing** – Share garden designs with friends

### **Enhanced AI Features** 🤖

- **Natural Language Processing** – Chat with AI Gardener
- **Image Recognition** – Analyze photos for habit tracking
- **Voice Commands** – Voice-based habit logging
- **Smart Reminders** – AI-powered optimal reminder timing

### **Advanced Mobile Features** 📱

- **Offline Mode** – Full offline functionality
- **Widgets** – Home screen widgets for quick habit logging
- **Apple Watch/Android Wear** – Native smartwatch apps
- **Background Sync** – Automatic data synchronization

### **Data & Privacy** 🔒

- **Data Export/Import** – GDPR compliance tools
- **Privacy Controls** – Granular data sharing permissions
- **Data Backup** – Cloud backup and restore
- **Audit Logs** – Track data access and changes

### **Integration Ecosystem** 🔗

- **Calendar Integration** – Sync with Google Calendar, Outlook
- **Task Management** – Connect with Todoist, Notion, etc.
- **Health Apps** – More health platform integrations
- **Smart Home** – IoT device integration for habit automation

### **Advanced Social Features** 👥

- **Habit Groups** – Create habit-focused communities
- **Mentorship System** – Connect users with similar goals
- **Social Challenges** – Group habit challenges with rewards
- **Social Feed** – Activity feed with habit updates

### **Performance & Scalability** ⚡

- **Caching Layer** – Redis for performance optimization
- **Background Jobs** – Queue system for heavy operations
- **API Rate Limiting** – Protect against abuse
- **Monitoring & Logging** – Application performance monitoring

### **Testing & Quality** 🧪

- **Unit Tests** – Comprehensive test coverage
- **E2E Tests** – Automated user journey testing
- **Performance Tests** – Load testing for scalability
- **Security Tests** – Vulnerability scanning

---

## ⌚ Wearable Integrations

Bloomhabit now supports comprehensive wearable device integration, allowing users to automatically sync health and fitness data from popular devices and platforms:

### **Supported Devices & Platforms**

- **Fitness Trackers** – Fitbit, Garmin, Withings
- **Smartwatches** – Apple Watch, Samsung Galaxy Watch, Garmin Fenix
- **Health Platforms** – Apple Health, Google Fit, Samsung Health
- **Specialized Devices** – Oura Ring (sleep tracking), Peloton, Strava

### **Health Data Types**

- **Activity Metrics** – Steps, distance, calories, active minutes
- **Vital Signs** – Heart rate, blood pressure, oxygen saturation
- **Sleep Data** – Duration, quality, stages, recovery metrics
- **Body Metrics** – Weight, body composition, temperature
- **Custom Metrics** – User-defined health parameters

### **Key Features**

- **Automatic Sync** – Real-time or scheduled data synchronization
- **Data Processing** – AI-powered insights and health recommendations
- **Trend Analysis** – Historical data visualization and progress tracking
- **Device Management** – Connect, configure, and monitor multiple devices
- **Data Export** – Export health data for personal records or sharing

### **Integration Benefits**

- **Seamless Tracking** – No manual data entry required
- **Comprehensive Insights** – Correlate health data with habit performance
- **Motivation Boost** – Visual progress and achievement tracking
- **Health Awareness** – Better understanding of wellness patterns
- **Goal Alignment** – Connect health metrics with habit goals
- **v2.0** – Advanced AI features and machine learning insights.
- **v2.1** – Advanced analytics, habit correlation analysis, and predictive insights.
- **v2.2** – Gamification system with achievements, levels, and rewards.
- **v2.3** – Enhanced 3D garden visualization and custom garden layouts.
- **v2.4** – Natural language processing, voice commands, and smart reminders.
- **v2.5** – Advanced mobile features: offline mode, widgets, smartwatch apps.
- **v2.6** – Data privacy tools, GDPR compliance, and advanced security.
- **v2.7** – Extended integration ecosystem (calendars, task managers, smart home).
- **v2.8** – Advanced social features: mentorship, habit groups, social challenges.
- **v2.9** – Performance optimization, caching, and scalability improvements.
- **v3.0** – Comprehensive testing suite and quality assurance.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Bloomhabit** — _Grow your best self, one bloom at a time._ 🌿🌸
