<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="layout flex flex-col justify-between h-full">
    <header class="shadow-lg">
      <div class="container">
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="font-bold text-xl py-4">Анонимная</RouterLink>
          <div class="flex items-center justify-end gap-4">
            <RouterLink
              to="/find"
              class="bg-blue-600 text-white py-2 px-4 rounded-xl font-medium shadow-lg shadow-blue-800/20 my-4"
              >Начать</RouterLink
            >
            <RouterLink
              to="/"
              class="bg-purple-600 text-white py-2 px-4 rounded-xl font-medium shadow-lg shadow-purple-800/20 my-4"
              >Войти</RouterLink
            >
          </div>
        </div>
      </div>
    </header>
    <main class="flex-1">
      <slot></slot>
    </main>
    <footer></footer>
  </div>
</template>
