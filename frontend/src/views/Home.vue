<script setup lang="ts">
import { RouterLink } from 'vue-router'
import FriendChat from '@/components/FriendChat.vue'
import { MessageCircle, User, ShieldCheck } from 'lucide-vue-next'

interface FAQItem {
  question: string
  answer: string
}
interface FAQCategory {
  title: string
  items: FAQItem[]
}

const faqCategory1: FAQCategory = {
  title: 'Основные вопросы об анонимном чате',
  items: [
    {
      question: 'Как начать анонимный чат?',
      answer: 'Нажмите кнопку «Начать чат» и система автоматически подберёт собеседника.',
    },
    {
      question: 'Нужно ли регистрироваться?',
      answer: 'Нет, регистрация не требуется — общение полностью анонимно.',
    },
    {
      question: 'Можно ли узнать личность собеседника?',
      answer: 'Нет, чат не собирает личные данные и не хранит историю сообщений.',
    },
  ],
}

const faqCategory2: FAQCategory = {
  title: 'Дополнительные вопросы',
  items: [
    {
      question: 'Как долго длится сессия?',
      answer: 'Сессия активна пока вы отправляете сообщения. После окончания все данные удаляются.',
    },
    {
      question: 'Могу ли я отправлять медиа или файлы?',
      answer: 'Нет, разрешены только текстовые сообщения для обеспечения безопасности.',
    },
    {
      question: 'Что делать при нарушении правил?',
      answer:
        'Вы можете сообщить о нарушении модерации через кнопку «Пожаловаться». Нарушители блокируются.',
    },
  ],
}
</script>
<template>
  <section class="hero md:py-20 py-15">
    <div class="container">
      <div class="text-center space-y-3 py-20">
        <h1 class="font-bold md:text-4xl text-3xl">
          Анонимный чат <br />
          найди собеседника за секунду
        </h1>
        <p class="text-gray-700 md:text-xl text-lg leading-relaxed">
          Никакой регистрации, сбора данных или истории чатов. <br class="hidden md:block" />
          Просто открой и начни анонимное общение — быстро, безопасно и бесплатно.
        </p>

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
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Как это работает</h2>
      <div class="flex flex-col md:flex-row gap-8">
        <div class="flex-1 text-center p-6 bg-white rounded-2xl shadow-md">
          <MessageCircle class="mx-auto w-12 h-12 text-blue-600 mb-4" />
          <h3 class="font-semibold text-xl mb-2">Начать поиск</h3>
          <p class="text-gray-600">
            Нажми кнопку «Найти собеседника», и мы подберём тебе случайного партнёра.
          </p>
        </div>
        <div class="flex-1 text-center p-6 bg-white rounded-2xl shadow-md">
          <User class="mx-auto w-12 h-12 text-blue-600 mb-4" />
          <h3 class="font-semibold text-xl mb-2">Навигация без входа</h3>
          <p class="text-gray-600">Общайся без регистрации и ввода личных данных.</p>
        </div>
        <div class="flex-1 text-center p-6 bg-white rounded-2xl shadow-md">
          <ShieldCheck class="mx-auto w-12 h-12 text-blue-600 mb-4" />
          <h3 class="font-semibold text-xl mb-2">Безопасность</h3>
          <p class="text-gray-600">
            Все сообщения не сохраняются и передаются по защищённому каналу.
          </p>
        </div>
      </div>
    </div>
  </section>
  <section class="my-20">
    <div class="container">
      <h1 class="text-3xl font-bold text-center mb-10">Чаты в реальном времени</h1>
      <div class="flex flex-col md:flex-row items-stretch justify-center gap-10">
        <div
          class="text-center flex flex-col justify-between w-full md:max-w-xs space-y-6 shadow-2xl bg-white shadow-gray-500/15 border border-black/10 p-10 rounded-lg"
        >
          <div class="space-y-3">
            <h1 class="text-3xl font-bold">Анонимный чат</h1>
            <p class="text-gray-500">Нажмите, чтобы найти случайного собеседника</p>
          </div>

          <div class="flex flex-col gap-2 items-center">
            <RouterLink
              to="/find"
              class="shadow-xl bg-blue-600 text-white rounded-lg w-full py-3 shadow-blue-600/20"
              >Найти собеседника</RouterLink
            >
          </div>
        </div>
        <FriendChat />
      </div>
    </div>
  </section>
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Вопросы и ответы</h2>
      <div
        class="flex max-w-[66.7325rem] mx-auto justify-between flex-wrap md:my-10 my-9 md:gap-5 gap-6"
      >
        <article
          class="md:w-[calc(50%-0.75rem)] w-full bg-white border border-[#F3F4F6] rounded-xl overflow-hidden shadow-input"
        >
          <div
            class="bg-[#F3F4F6] px-2 md:py-4 py-[0.9375rem] rounded-t-xl border-b border-[#F3F4F6]"
          >
            <h2 class="text-lg font-bold">{{ faqCategory1.title }}</h2>
          </div>
          <div v-for="(item, idx) in faqCategory1.items" :key="idx">
            <details class="border-b border-[#F3F4F6] group">
              <summary
                class="cursor-pointer text-[#1F2937] flex items-center justify-between w-full md:px-3 md:py-3 p-[0.75rem] font-medium text-left hover:bg-gray-50 focus:outline-none gap-2 md:text-base text-sm"
              >
                <span class="tracking-wide font-medium leading-6">{{ item.question }}</span>
                <svg
                  class="accordion-icon w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div
                class="p-2 md:mb-2 md:mx-3 mx-[1.375rem] mb-[0.75rem] text-sm bg-[#F4F4F4] rounded-lg border-l-4 border-gray-700"
              >
                <p class="text-black">{{ item.answer }}</p>
              </div>
            </details>
          </div>
        </article>
        <article
          class="md:w-[calc(50%-0.75rem)] w-full bg-white border border-[#F3F4F6] rounded-xl overflow-hidden shadow-input"
        >
          <div
            class="bg-[#F3F4F6] px-2 md:py-4 py-[0.9375rem] rounded-t-xl border-b border-[#F3F4F6]"
          >
            <h2 class="text-lg font-bold">{{ faqCategory2.title }}</h2>
          </div>
          <div v-for="(item, idx) in faqCategory2.items" :key="idx">
            <details class="border-b border-[#F3F4F6] group">
              <summary
                class="cursor-pointer text-[#1F2937] flex items-center justify-between w-full md:px-3 md:py-3 p-[0.75rem] font-medium text-left hover:bg-gray-50 focus:outline-none gap-2 md:text-base text-sm"
              >
                <span class="tracking-wide font-medium leading-6">{{ item.question }}</span>
                <svg
                  class="accordion-icon w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div
                class="p-2 md:mb-2 md:mx-3 mx-[1.375rem] mb-[0.75rem] text-sm bg-[#F4F4F4] rounded-lg border-l-4 border-gray-700"
              >
                <p class="text-black">{{ item.answer }}</p>
              </div>
            </details>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
<style scoped>
.hero {
  background-image: url('@/assets/images/hero-bg.webp');
  background-size: cover;
  background-position: center;
}
</style>
