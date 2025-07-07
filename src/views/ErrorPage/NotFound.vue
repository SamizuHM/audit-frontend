<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'

const route = useRoute()
useHead({
  title: '404 Not Found',
  meta: [
    {
      name: 'description',
      content: 'The page you are looking for does not exist.',
    },
  ],
})
</script>
<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-6xl font-bold text-red-600">404</h1>
    <p class="mt-4 text-lg text-gray-700">Page Not Found</p>
    <p class="mt-2 text-sm text-gray-500">The page "{{ route.path }}" does not exist.</p>
    <router-link to="/" class="mt-6 text-blue-500 hover:underline"> Go to Home </router-link>
  </div>
</template>
