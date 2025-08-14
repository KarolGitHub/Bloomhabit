<template>
  <div class="language-settings-page">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('settings.language') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('settings.language') }} - {{ $t('app.description') }}
        </p>
      </div>

      <!-- Current Language Display -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ $t('settings.language') }} Atual
        </h2>
        <div class="flex items-center space-x-4">
          <div class="text-4xl">{{ currentLocale.flag }}</div>
          <div>
            <div class="text-lg font-medium text-gray-900 dark:text-white">
              {{ currentLocale.name }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ currentLocale.code.toUpperCase() }} - {{ currentLocale.iso }}
            </div>
          </div>
        </div>
      </div>

      <!-- Language Switcher -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ $t('settings.language') }}
        </h2>
        <LanguageSwitcher />
      </div>

      <!-- Language Examples -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Exemplos de Tradução
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Navigation Examples -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900 dark:text-white">
              {{ $t('navigation.title') }}
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('navigation.home') }}</span>
                <span class="text-gray-900 dark:text-white">{{ $t('navigation.home') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('navigation.garden') }}</span>
                <span class="text-gray-900 dark:text-white">{{ $t('navigation.garden') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('navigation.habits') }}</span>
                <span class="text-gray-900 dark:text-white">{{ $t('navigation.habits') }}</span>
              </div>
            </div>
          </div>

          <!-- Common Actions Examples -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900 dark:text-white">
              {{ $t('common.actions.title') }}
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('common.actions.save') }}</span>
                <span class="text-gray-900 dark:text-white">{{ $t('common.actions.save') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('common.actions.cancel') }}</span>
                <span class="text-gray-900 dark:text-white">{{ $t('common.actions.cancel') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('common.actions.delete') }}</span>
                <span class="text-gray-900 dark:text-white">{{ $t('common.actions.delete') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Date and Number Formatting -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Formatação de Data e Número
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date Examples -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900 dark:text-white">Datas</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Hoje:</span>
                <span class="text-gray-900 dark:text-white">{{ $d(new Date(), 'long') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Formato curto:</span>
                <span class="text-gray-900 dark:text-white">{{ $d(new Date(), 'short') }}</span>
              </div>
            </div>
          </div>

          <!-- Number Examples -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-900 dark:text-white">Números</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Decimal:</span>
                <span class="text-gray-900 dark:text-white">{{ $n(1234.56, 'decimal') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Moeda:</span>
                <span class="text-gray-900 dark:text-white">{{ $n(1234.56, 'currency') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plural Examples -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Exemplos de Pluralização
        </h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <span class="text-gray-600 dark:text-gray-400">1 {{ $t('common.units.day', 1) }}:</span>
            <span class="text-gray-900 dark:text-white">{{ $tc('common.units.day', 1) }}</span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-600 dark:text-gray-400">5 {{ $t('common.units.day', 5) }}:</span>
            <span class="text-gray-900 dark:text-white">{{ $tc('common.units.day', 5) }}</span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-600 dark:text-gray-400">0 {{ $t('common.units.day', 0) }}:</span>
            <span class="text-gray-900 dark:text-white">{{ $tc('common.units.day', 0) }}</span>
          </div>
        </div>
      </div>

      <!-- RTL Support Demo -->
      <div v-if="isRTL" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Suporte RTL (Right-to-Left)
        </h2>
        <div class="text-right">
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            Este idioma é suportado com direção de texto da direita para a esquerda (RTL).
          </p>
          <p class="text-gray-900 dark:text-white">
            النص العربي يظهر من اليمين إلى اليسار
          </p>
        </div>
      </div>

      <!-- Language Information -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Informações do Idioma
        </h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Código do Idioma:</span>
            <span class="text-gray-900 dark:text-white">{{ currentLocale.code }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">ISO:</span>
            <span class="text-gray-900 dark:text-white">{{ currentLocale.iso }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Direção do Texto:</span>
            <span class="text-gray-900 dark:text-white">{{ currentLocale.dir || 'ltr' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Idiomas Suportados:</span>
            <span class="text-gray-900 dark:text-white">{{ availableLocales.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { locale, locales } = useI18n()

// Get current locale info
const currentLocale = computed(() => {
  return locales.value.find(l => l.code === locale.value) || locales.value[0]
})

// Get all available locales
const availableLocales = computed(() => {
  return locales.value
})

// Check if current locale is RTL
const isRTL = computed(() => {
  return currentLocale.value?.dir === 'rtl'
})

// Set page title
useHead({
  title: 'Configurações de Idioma - Bloomhabit'
})
</script>

<style scoped>
.language-settings-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.dark .language-settings-page {
  background-color: #111827;
}

/* RTL Support */
[dir="rtl"] .language-settings-page {
  text-align: right;
}

[dir="rtl"] .flex.justify-between {
  flex-direction: row-reverse;
}
</style>
