<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="layout min-h-screen flex flex-col">
    <header class="border-b border-gray-200 bg-white">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <RouterLink to="/" class="text-2xl font-semibold text-gray-800 py-4">Анонимная</RouterLink>
        <nav class="flex gap-3">
          <RouterLink
            to="/find"
            class="px-4 py-2 my-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Начать
          </RouterLink>
          <RouterLink
            to="/"
            class="px-4 py-2 my-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Войти
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot></slot>
    </main>

    <footer class="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
      © {{ new Date().getFullYear() }} Анонимный чат
    </footer>
  </div>
</template>
