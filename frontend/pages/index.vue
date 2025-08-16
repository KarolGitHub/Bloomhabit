<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-green-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <div class="text-3xl mr-3">🌸</div>
            <h1 class="text-2xl font-bold text-gradient">Bloomhabit</h1>
          </div>
          <nav class="flex space-x-6">
            <NuxtLink to="/garden" class="text-gray-600 hover:text-green-600 transition-colors">My Garden</NuxtLink>
            <NuxtLink to="/habits" class="text-gray-600 hover:text-green-600 transition-colors">Habits</NuxtLink>
            <NuxtLink to="/social" class="text-gray-600 hover:text-green-600 transition-colors">Social</NuxtLink>
            <NuxtLink to="/community" class="text-gray-600 hover:text-green-600 transition-colors">Community</NuxtLink>
            <NuxtLink to="/wearable" class="text-gray-600 hover:text-green-600 transition-colors">Wearables</NuxtLink>
            <NuxtLink to="/garden-visualization" class="text-gray-600 hover:text-green-600 transition-colors">3D Garden</NuxtLink>
            <NuxtLink to="/export-import" class="text-gray-600 hover:text-green-600 transition-colors">Export/Import</NuxtLink>
            <button class="flower-button">Sign In</button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="text-center">
          <h1 class="text-6xl font-bold text-gradient mb-6">
            🌸 Bloomhabit
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your habits into a beautiful garden. Watch them bloom with consistency
            and gently wilt when neglected. Your personal AI Gardener will help you cultivate
            lasting positive change.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/garden" class="flower-button foundation-enhanced">
              🌱 Start Your Garden
            </NuxtLink>
            <button class="flower-button">
              🎯 Learn More
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 class="text-3xl font-bold text-center text-gray-900 mb-16">Why Choose Bloomhabit?</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">🌱</div>
            <h4 class="text-xl font-semibold mb-3">Visual Garden Metaphor</h4>
            <p class="text-gray-600">See your habits as flowers that grow and bloom with daily care, making progress
              tangible and motivating.</p>
            <NuxtLink to="/garden" class="button primary small rounded mt-4">
              🌺 View Garden
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">📊</div>
            <h4 class="text-xl font-semibold mb-3">Daily Habit Logger</h4>
            <p class="text-gray-600">Track your daily progress with our intuitive logging system and watch your habits
              grow stronger.</p>
            <NuxtLink to="/habit-logger" class="button primary small rounded mt-4">
              📝 Start Logging
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">🤖</div>
            <h4 class="text-xl font-semibold mb-3">AI Gardener</h4>
            <p class="text-gray-600">Get personalized insights, tips, and encouragement from our AI that understands
              your unique journey.</p>
            <NuxtLink to="/ai-gardener" class="button primary small rounded mt-4">
              🤖 Visit AI Gardener
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">📱</div>
            <h4 class="text-xl font-semibold mb-3">PWA Experience</h4>
            <p class="text-gray-600">Works offline, installs on any device, and provides a native app experience across
              all platforms.</p>
            <NuxtLink to="/pwa-settings" class="button primary small rounded mt-4">
              ⚙️ PWA Settings
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">📊</div>
            <h4 class="text-xl font-semibold mb-3">Advanced Analytics</h4>
            <p class="text-gray-600">Deep insights into your habit performance with trend analysis, progress reports,
              and personalized recommendations.</p>
            <NuxtLink to="/analytics" class="button primary small rounded mt-4">
              📊 View Analytics
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">🔔</div>
            <h4 class="text-xl font-semibold mb-3">Real-time Notifications</h4>
            <p class="text-gray-600">Stay updated with push notifications, habit reminders, streak milestones, and AI
              insights delivered in real-time.</p>
            <NuxtLink to="/notifications" class="button primary small rounded mt-4">
              🔔 Manage Notifications
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">🌱</div>
            <h4 class="text-xl font-semibold mb-3">Community Gardens</h4>
            <p class="text-gray-600">Join shared gardens, participate in group challenges, and grow habits together with
              friends and fellow enthusiasts.</p>
            <NuxtLink to="/community" class="button primary small rounded mt-4">
              🌱 Join Community
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">👥</div>
            <h4 class="text-xl font-semibold mb-3">Social Features</h4>
            <p class="text-gray-600">Connect with friends, share your habits, and build a supportive network around your
              personal growth journey.</p>
            <NuxtLink to="/social" class="button primary small rounded mt-4">
              👥 Connect Socially
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">⌚</div>
            <h4 class="text-xl font-semibold mb-3">Wearable Integration</h4>
            <p class="text-gray-600">Connect your fitness trackers, smartwatches, and health devices to automatically sync
              your health data and gain deeper insights.</p>
            <NuxtLink to="/wearable" class="button primary small rounded mt-4">
              ⌚ Connect Devices
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">🎨</div>
            <h4 class="text-xl font-semibold mb-3">3D Garden Visualization</h4>
            <p class="text-gray-600">Experience your habits in immersive 3D with custom themes, seasonal layouts, and interactive garden designs.</p>
            <NuxtLink to="/garden-visualization" class="button primary small rounded mt-4">
              🎨 Explore 3D Garden
            </NuxtLink>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">📤</div>
            <h4 class="text-xl font-semibold mb-3">Export/Import System</h4>
            <p class="text-gray-600">Manage your data with comprehensive export/import tools, automated backups, and GDPR compliance features.</p>
            <NuxtLink to="/export-import" class="button primary small rounded mt-4">
              📤 Manage Data
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Garden Preview -->
    <section class="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 class="text-3xl font-bold text-center text-gray-900 mb-16">Your Personal Habit Garden</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div class="habit-flower blooming">🌹</div>
          <div class="habit-flower growing">🌻</div>
          <div class="habit-flower growing">🌿</div>
          <div class="habit-flower wilting">🌱</div>
        </div>
        <p class="text-center text-gray-600 mt-8">
          Each flower represents a habit. Water them daily to help them grow and bloom!
        </p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 class="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Your Habits?</h3>
        <p class="text-xl text-gray-600 mb-8">
          Join thousands of users who are already growing their best selves with Bloomhabit.
        </p>
        <button class="flower-button text-lg px-10 py-4">
          Start Your Garden Today 🌸
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <div class="text-2xl mr-2">🌸</div>
              <span class="text-xl font-bold">Bloomhabit</span>
            </div>
            <p class="text-gray-400">Grow your best self, one bloom at a time.</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Product</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Support</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Company</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">About</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Bloomhabit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Bloomhabit - Grow Your Best Self'
})
</script>
