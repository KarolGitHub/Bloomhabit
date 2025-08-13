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
            <NuxtLink to="/journal" class="text-gray-600 hover:text-green-600 transition-colors">Journal</NuxtLink>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">🌱</div>
            <h4 class="text-xl font-semibold mb-3">Visual Garden Metaphor</h4>
            <p class="text-gray-600">See your habits as flowers that grow and bloom with daily care, making progress
              tangible and motivating.</p>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">🤖</div>
            <h4 class="text-xl font-semibold mb-3">AI Gardener</h4>
            <p class="text-gray-600">Get personalized insights, tips, and encouragement from our AI that understands
              your unique journey.</p>
          </div>
          <div class="garden-card text-center">
            <div class="text-4xl mb-4">📱</div>
            <h4 class="text-xl font-semibold mb-3">PWA Experience</h4>
            <p class="text-gray-600">Works offline, installs on any device, and provides a native app experience across
              all platforms.</p>
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
