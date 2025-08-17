<template>
  <div>
    <IntegrationEcosystem />
  </div>
</template>

<script setup>
import IntegrationEcosystem from '~/components/IntegrationEcosystem.vue'

// Set page metadata
useHead({
  title: 'Integration Ecosystem - Bloomhabit',
  meta: [
    {
      name: 'description',
      content: 'Connect your calendar, task managers, and smart home devices to Bloomhabit for seamless habit tracking and automation.'
    }
  ]
})
</script>
