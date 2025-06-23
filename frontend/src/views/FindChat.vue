<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSocket } from '@/composables/useSocket'

const { socket, myId } = useSocket(ref(''))
const router = useRouter()

const isSearching = ref(false)
const errorMessage = ref('')
const isMyDataAvailable = ref(false)
const myData = ref({ age: null, gender: null })

const options = ref({
  age: [] as string[],
  gender: 'any' as string,
})

const ageOptions = [
  { value: null, label: 'Не важно' },
  { value: '17', label: 'до 17' },
  { value: '18-21', label: '18-21' },
  { value: '22-25', label: '22-25' },
  { value: '26-35', label: '26-35' },
  { value: '36+', label: 'старше 36' },
]

const genderOptions = [
  { value: 'any', label: 'Не важно' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
]

onMounted(() => {
  const stored = localStorage.getItem('userSearchFilters')
  if (stored) {
    const parsed = JSON.parse(stored)
    if (parsed.age && parsed.gender) {
      myData.value = parsed
      isMyDataAvailable.value = true
    }
  }
})

function startSearch() {
  errorMessage.value = ''
  isSearching.value = true
  socket.emit('find-room', {
    criteria: options.value,
    myData: myData.value,
  })
}

function cancelSearch() {
  isSearching.value = false
  socket.emit('cancel-search', { userId: myId.value })
}

socket.on('room-found', ({ roomId }) => {
  isSearching.value = false
  router.push(`/room/${roomId}`)
})

socket.on('waiting', () => {
  isSearching.value = true
})

socket.on('error', (msg: string) => {
  errorMessage.value = msg
  isSearching.value = false
})

function toggleAge(value: string | null) {
  const index = options.value.age.indexOf(value as string)
  if (index === -1) {
    options.value.age.push(value as string)
  } else {
    options.value.age.splice(index, 1)
  }
}
</script>
<template>
  <section class="my-20">
    <div class="container">
      <div class="space-y-10 bg-gray-50 md:max-w-150 mx-auto">
        <div
          v-if="!isMyDataAvailable"
          class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
          role="alert"
        >
          <span class="font-medium">Ошибка!</span> Ваши данные (возраст и пол) не установлены.
          Пожалуйста, сначала заполните свой профиль.
        </div>

        <form @submit.prevent="startSearch" class="space-y-4 bg-white p-6 rounded shadow-md">
          <div class="text-center space-y-2">
            <h1 class="text-3xl font-bold">Найти собеседника</h1>
            <p class="text-gray-600">Выберите параметры для поиска</p>
          </div>

          <div>
            <p class="font-bold mb-2">Возраст собеседника</p>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="(ageOption, i) in ageOptions"
                :key="i"
                @click="toggleAge(ageOption.value)"
                type="button"
                :class="[
                  'px-3 py-2 rounded text-sm',
                  options.age.includes(ageOption.value as string)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200',
                ]"
              >
                {{ ageOption.label }}
              </button>
            </div>
          </div>

          <div>
            <p class="font-bold mb-2">Пол собеседника</p>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="genderOption in genderOptions"
                :key="genderOption.value"
                @click="options.gender = genderOption.value"
                type="button"
                :class="[
                  'px-3 py-2 rounded text-sm',
                  options.gender === genderOption.value ? 'bg-blue-600 text-white' : 'bg-gray-200',
                ]"
              >
                {{ genderOption.label }}
              </button>
            </div>
          </div>

          <div v-if="!isSearching">
            <button
              type="submit"
              :disabled="!isMyDataAvailable"
              class="bg-green-600 text-white py-2 px-4 rounded w-full"
            >
              Найти собеседника
            </button>
          </div>
          <div v-else>
            <p class="text-center text-gray-600 animate-pulse">Идёт поиск...</p>
            <button
              type="button"
              @click="cancelSearch"
              class="mt-2 bg-red-600 text-white py-2 px-4 rounded w-full"
            >
              Отменить поиск
            </button>
          </div>

          <p v-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
