<template>
  <div>
    <PerformanceScalability />
  </div>
</template>

<script setup lang="ts">
import PerformanceScalability from '~/components/PerformanceScalability.vue'

// Page metadata
useHead({
  title: 'Performance & Scalability - Bloomhabit',
  meta: [
    {
      name: 'description',
      content: 'Monitor system performance, manage caching, and oversee background job queues for optimal Bloomhabit performance.'
    }
  ]
})
</script>
