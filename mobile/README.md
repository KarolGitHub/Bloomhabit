# Bloomhabit Mobile App

A React Native mobile application for the Bloomhabit habit-tracking platform, designed to help users build and maintain healthy habits through a garden-inspired interface.

## 🌱 Features

### Core Functionality

- **Habit Management**: Create, edit, and track daily habits
- **Garden View**: Visual representation of habits as growing plants
- **Progress Tracking**: Monitor completion rates and streaks
- **AI Gardener**: Personalized insights and coaching
- **Analytics Dashboard**: Detailed progress reports and trends
- **Push Notifications**: Reminders and milestone celebrations
- **Community Features**: Join gardens and participate in challenges

### Mobile-Specific Features

- **Offline Support**: Basic offline functionality for habit tracking
- **Native Performance**: Optimized for mobile devices
- **Touch Gestures**: Intuitive swipe and tap interactions
- **Biometric Authentication**: Secure login with fingerprint/face ID
- **Background Sync**: Automatic data synchronization
- **Deep Linking**: Direct navigation to specific features

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- JDK 11 or higher

### Installation

1. **Clone the repository**

   ```bash
   cd mobile
   npm install
   ```

2. **Install iOS dependencies (macOS only)**

   ```bash
   cd ios && pod install && cd ..
   ```

3. **Start Metro bundler**

   ```bash
   npm start
   ```

4. **Run on device/emulator**

   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

## 📱 Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   └── main/          # Main app screens
├── navigation/         # Navigation configuration
├── contexts/           # React Context providers
├── services/           # API and external services
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App constants and configuration
├── hooks/              # Custom React hooks
├── store/              # State management
└── assets/             # Images, fonts, and other assets
```

## 🎨 Design System

### Theme

- **Light/Dark Mode**: Automatic theme switching
- **Color Palette**: Garden-inspired colors (greens, blues, earth tones)
- **Typography**: Consistent font hierarchy and spacing
- **Components**: Material Design 3 components with custom styling

### Icons

- **Material Community Icons**: Comprehensive icon library
- **Custom Icons**: Garden and habit-specific icons
- **Consistent Sizing**: Standardized icon dimensions

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3000/api
ENVIRONMENT=development
```

### API Configuration

- **Base URL**: Configurable API endpoint
- **Authentication**: JWT token-based auth
- **Error Handling**: Comprehensive error management
- **Retry Logic**: Automatic retry for failed requests

## 📊 State Management

### Context API

- **Auth Context**: User authentication and session management
- **Theme Context**: Light/dark mode and theme preferences
- **Notification Context**: Push notification management

### Local Storage

- **AsyncStorage**: Persistent data storage
- **Secure Storage**: Encrypted sensitive data
- **Cache Management**: Efficient data caching

## 🔔 Push Notifications

### Features

- **Habit Reminders**: Daily habit completion reminders
- **Streak Milestones**: Celebration of achievement milestones
- **AI Insights**: Personalized coaching notifications
- **Community Updates**: Activity from community gardens

### Configuration

- **VAPID Keys**: Web push notification setup
- **Permission Handling**: User consent management
- **Background Processing**: Notification delivery optimization

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Testing Tools

- **Jest**: Unit testing framework
- **React Native Testing Library**: Component testing
- **Detox**: End-to-end testing

## 📦 Building

### Android

```bash
npm run build:android
```

### iOS

```bash
npm run build:ios
```

### Build Configuration

- **Release Builds**: Optimized production builds
- **Code Signing**: Proper app signing for distribution
- **Bundle Optimization**: Reduced app size and improved performance

## 🚀 Deployment

### App Store

- **Google Play Store**: Android app distribution
- **Apple App Store**: iOS app distribution
- **Release Management**: Version control and rollback

### CI/CD

- **Automated Testing**: Pre-deployment validation
- **Build Automation**: Automated build and deployment
- **Quality Gates**: Code quality and performance checks

## 🔒 Security

### Authentication

- **JWT Tokens**: Secure token-based authentication
- **Biometric Auth**: Device-level security
- **Session Management**: Secure session handling

### Data Protection

- **Encryption**: Data encryption at rest and in transit
- **Privacy**: GDPR-compliant data handling
- **Secure Storage**: Protected local data storage

## 📈 Performance

### Optimization

- **Lazy Loading**: On-demand component loading
- **Image Optimization**: Efficient image handling
- **Memory Management**: Optimized memory usage
- **Bundle Splitting**: Reduced initial load time

### Monitoring

- **Performance Metrics**: App performance tracking
- **Crash Reporting**: Error monitoring and reporting
- **Analytics**: User behavior and app usage analytics

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

### Documentation

- **API Reference**: Backend API documentation
- **Component Library**: UI component documentation
- **Architecture Guide**: System design and patterns

### Community

- **Issues**: Bug reports and feature requests
- **Discussions**: Community discussions and help
- **Contributing**: How to contribute to the project

## 🔮 Roadmap

### Upcoming Features

- **Offline Mode**: Enhanced offline functionality
- **Widgets**: Home screen widgets for quick access
- **Apple Watch**: Watch app for habit tracking
- **Voice Commands**: Voice-controlled habit logging
- **AR Features**: Augmented reality habit visualization

### Performance Improvements

- **Hermes Engine**: JavaScript engine optimization
- **New Architecture**: React Native new architecture adoption
- **Bundle Optimization**: Further app size reduction
- **Memory Optimization**: Enhanced memory management
