<template>
  <div class="language-switcher">
    <div class="language-dropdown">
      <button @click="toggleDropdown" class="language-button" :class="{ 'dropdown-open': isDropdownOpen }"
        aria-haspopup="true" aria-expanded="isDropdownOpen">
        <span class="language-flag">{{ currentLocale.flag }}</span>
        <span class="language-name">{{ currentLocale.name }}</span>
        <svg class="dropdown-arrow" :class="{ 'rotated': isDropdownOpen }" width="12" height="12" viewBox="0 0 12 12"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>

      <div v-if="isDropdownOpen" class="language-dropdown-menu" :class="{ 'rtl': currentLocale.dir === 'rtl' }">
        <div v-for="locale in availableLocales" :key="locale.code" @click="changeLanguage(locale.code)"
          class="language-option" :class="{ 'active': locale.code === currentLocale.code }">
          <span class="language-flag">{{ locale.flag }}</span>
          <span class="language-name">{{ locale.name }}</span>
          <span v-if="locale.code === currentLocale.code" class="checkmark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, locales } = useI18n()

const isDropdownOpen = ref(false)

// Get available locales from the i18n configuration
const availableLocales = computed(() => {
  return locales.value as Array<{
    code: string
    name: string
    flag: string
    dir?: string
  }>
})

// Get current locale info
const currentLocale = computed(() => {
  return availableLocales.value.find(l => l.code === locale.value) || availableLocales.value[0]
})

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Change language
const changeLanguage = (code: string) => {
  locale.value = code
  isDropdownOpen.value = false

  // Store language preference in localStorage
  localStorage.setItem('bloomhabit-language', code)

  // Update document direction for RTL languages
  if (code === 'ar') {
    document.documentElement.dir = 'rtl'
  } else {
    document.documentElement.dir = 'ltr'
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.language-switcher')) {
    isDropdownOpen.value = false
  }
}

// Close dropdown on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  // Load saved language preference
  const savedLanguage = localStorage.getItem('bloomhabit-language')
  if (savedLanguage && availableLocales.value.some(l => l.code === savedLanguage)) {
    locale.value = savedLanguage
  }

  // Set initial document direction
  if (locale.value === 'ar') {
    document.documentElement.dir = 'rtl'
  }

  // Add event listeners
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  // Remove event listeners
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped lang="scss">
.language-switcher {
  position: relative;
  display: inline-block;
}

.language-dropdown {
  position: relative;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: var(--color-text);

  &:hover {
    background: var(--color-background-hover);
    border-color: var(--color-primary);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  &.dropdown-open {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
}

.language-flag {
  font-size: 1.25rem;
  line-height: 1;
}

.language-name {
  font-weight: 500;
  min-width: 0;
  white-space: nowrap;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  color: var(--color-text-secondary);

  &.rotated {
    transform: rotate(180deg);
  }
}

.language-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;

  &.rtl {
    right: auto;
    left: 0;
  }
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--color-border-light);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-background-hover);
  }

  &.active {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }
}

.language-option .language-flag {
  font-size: 1.125rem;
  line-height: 1;
}

.language-option .language-name {
  flex: 1;
  font-weight: 500;
}

.checkmark {
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

// RTL support
[dir="rtl"] .language-dropdown-menu {
  right: auto;
  left: 0;
}

[dir="rtl"] .language-option {
  text-align: right;
}

// Responsive design
@media (max-width: 640px) {
  .language-button {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }

  .language-name {
    display: none;
  }

  .language-dropdown-menu {
    min-width: 160px;
  }

  .language-option .language-name {
    font-size: 0.875rem;
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .language-dropdown-menu {
    background: var(--color-background-dark);
    border-color: var(--color-border-dark);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }

  .language-option {
    border-bottom-color: var(--color-border-dark);

    &:hover {
      background: var(--color-background-hover-dark);
    }
  }
}
</style>
