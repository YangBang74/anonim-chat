<template>
  <div class="flex items-center justify-center flex-col-reverse gap-10 h-screen bg-gray-50">
    <div class="p-4 border rounded shadow-md max-w-md mx-auto text-left bg-white">
      <h2 class="text-lg font-semibold mb-2">Статистика</h2>
      <p>Онлайн: {{ allOnlineUsers.length }}</p>
      <p>В чатах: {{ chattingUsers.length }}</p>
      <p>В поиске: {{ searchingUsers.length }}</p>
    </div>

    <div class="flex flex-col md:flex-row items-stretch justify-center gap-10">
      <div
        class="text-center flex flex-col justify-between w-full md:max-w-xs space-y-6 shadow-2xl bg-white shadow-gray-500/15 border border-black/10 p-10 rounded-lg"
      >
        <div class="space-y-3">
          <h1 class="text-3xl font-bold">Анонимный чат</h1>
          <p class="text-gray-500">Нажмите, чтобы найти случайного собеседника</p>
        </div>

        <button
          @click="startSearch"
          :disabled="isSearching"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {{ isSearching ? 'Поиск...' : 'Найти собеседника' }}
        </button>

        <p v-if="errorMessage" class="text-red-500 h-5">{{ errorMessage }}</p>
      </div>
      <div
        class="text-center flex flex-col justify-between w-full md:max-w-xs space-y-6 shadow-2xl bg-white shadow-gray-500/15 border border-black/10 p-10 rounded-lg"
      >
        <div class="space-y-3">
          <h1 class="text-3xl font-bold">Чат с друзьями</h1>
          <p class="text-gray-500">Создайте приватную комнату и отправьте ссылку другу</p>
        </div>

        <button
          @click="createInvite"
          :disabled="isCreatingInvite"
          class="bg-green-600 text-white mt-auto px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
        >
          {{ isCreatingInvite ? 'Создание...' : 'Создать ссылку' }}
        </button>

        <div v-if="inviteLink" class="h-10">
          <p class="text-sm text-green-700 break-all">
            Скопируйте ссылку:
            <a :href="inviteLink" target="_blank" class="underline hover:text-green-800">{{
              inviteLink
            }}</a>
          </p>
          <p v-if="inviteError" class="text-red-500">{{ inviteError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSocket } from '@/composables/useSocket'

const roomIdRef = ref<string>('')
const { socket, allOnlineUsers, chattingUsers, searchingUsers } = useSocket(roomIdRef)

const isSearching = ref(false)
const isCreatingInvite = ref(false)
const inviteLink = ref('')
const errorMessage = ref('')
const inviteError = ref('')
const router = useRouter()

function startSearch() {
  errorMessage.value = ''
  isSearching.value = true
  socket.emit('find-room')
}

function createInvite() {
  inviteError.value = ''
  inviteLink.value = ''
  isCreatingInvite.value = true
  socket.emit('create-invite')
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

socket.on('invite-created', (code: string) => {
  inviteLink.value = `${window.location.origin}/invite/${code}`
  isCreatingInvite.value = false
})

socket.on('invite-error', (msg: string) => {
  inviteError.value = msg
  isCreatingInvite.value = false
})
</script>
