<script setup lang="ts">
import { RouterLink } from 'vue-router'
import FriendChat from '@/components/FriendChat.vue'
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
  <section class="my-20">
    <div class="container">
      <div class="flex flex-col md:flex-row items-stretch justify-center gap-10">
        <div
          class="text-center flex flex-col justify-between w-full md:max-w-xs space-y-6 shadow-2xl bg-white shadow-gray-500/15 border border-black/10 p-10 rounded-lg"
        >
          <div class="space-y-3">
            <h1 class="text-3xl font-bold">Анонимный чат</h1>
            <p class="text-gray-500">Нажмите, чтобы найти случайного собеседника</p>
          </div>

          <div class="flex flex-col gap-2 items-center">
            <RouterLink to="/find">Найти собеседника</RouterLink>
          </div>
        </div>
        <FriendChat />
      </div>
    </div>
  </section>
</template>
