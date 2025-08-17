<template>
  <div>
    <DataPrivacy />
  </div>
</template>

<script setup>
import DataPrivacy from '~/components/DataPrivacy.vue'

// Page metadata
useHead({
  title: 'Data & Privacy - Bloomhabit',
  meta: [
    { name: 'description', content: 'Manage your privacy settings, data requests, and security monitoring in Bloomhabit' }
  ]
})
</script>
