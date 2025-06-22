<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <div class="container">
      <div class="text-center space-y-3 py-20">
        <h1 class="font-bold text-4xl">
          Анонимный чат <br />
          найди собеседника за секунду
        </h1>
        <p class="text-medium text-xl">Без регистрации. Без логов. 100% анонимно.</p>
        <div class="mt-10">
          <RouterLink
            to="/find"
            class="black rounded-lg shadow-xl shadow-blue-600/20 mt-10 bg-blue-600 text-white py-3 px-5"
          >
            Начать чат
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
