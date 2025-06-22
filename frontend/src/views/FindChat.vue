<template>
  <div class="flex items-center justify-center flex-col-reverse gap-10 h-screen bg-gray-50">
    <div class="p-4 border rounded shadow max-w-md mx-auto text-left">
      <p>Онлайн: {{ allUsers.length }}</p>
      <p>В чатах: {{ chattingUsers.length }}</p>
      <p>В поиске: {{ searchingUsers.length }}</p>
    </div>

    <div class="flex items-stretch justify-center gap-10">
      <div
        class="text-center flex flex-col justify-between md:max-w-1/2 w-full space-y-6 shadow-2xl bg-white shadow-gray-500/15 border border-black/10 p-10 rounded-lg"
      >
        <div class="space-y-3">
          <h1 class="text-3xl font-bold">Анонимный чат</h1>
          <p class="text-gray-500">Нажмите, чтобы найти собеседника</p>
        </div>

        <button
          @click="startSearch"
          :disabled="isSearching"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isSearching ? 'Поиск...' : 'Найти собеседника' }}
        </button>

        <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
      </div>
      <div
        class="text-center flex flex-col justify-between md:max-w-1/2 w-full space-y-6 shadow-2xl bg-white shadow-gray-500/15 border border-black/10 p-10 rounded-lg"
      >
        <div class="space-y-3">
          <h1 class="text-3xl font-bold">Чат с друзьями</h1>
          <p class="text-gray-500">Нажмите, чтобы создать ссылку</p>
        </div>

        <button
          @click="createInvite"
          :disabled="isCreatingInvite"
          class="bg-green-600 text-white mt-auto px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {{ isCreatingInvite ? 'Создание...' : 'Создать ссылку' }}
        </button>

        <p v-if="inviteLink" class="text-sm text-green-700">
          Скопируйте ссылку: <a :href="inviteLink" class="underline">{{ inviteLink }}</a>
        </p>

        <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSocket } from '@/composables/useSocket'

const roomIdRef = ref<string>('')
const { socket, allUsers, chattingUsers, searchingUsers } = useSocket(roomIdRef)

const isSearching = ref(false)
const isCreatingInvite = ref(false)
const inviteLink = ref('')
const errorMessage = ref('')
const router = useRouter()

function startSearch() {
  errorMessage.value = ''
  isSearching.value = true
  socket.emit('find-room')
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

function createInvite() {
  isCreatingInvite.value = true
  socket.emit('create-invite')
}

socket.on('invite-created', (code: string) => {
  inviteLink.value = `${window.location.origin}/invite/${code}`
  isCreatingInvite.value = false
})

socket.on('invite-error', (msg: string) => {
  errorMessage.value = msg
  isCreatingInvite.value = false
})

onMounted(() => {
  setInterval(() => {
    socket.emit('request-status')
  }, 3000)
})
</script>
