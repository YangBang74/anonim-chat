import { ref, onBeforeUnmount, reactive } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '@/stores/chat'

export function useSocket(roomId: string) {
  const chat = useChatStore()
  const socket: Socket = io('http://localhost:3000')

  socket.emit('join-room', roomId)
  socket.on('receive-message', (msg) => chat.addMessage(msg))

  function sendMessage(text: string) {
    socket.emit('send-message', { roomId, message: text })
  }

  const userProfiles = reactive<Record<string, { color: string; emoji: string }>>({})

  const myId = ref(socket.id)

  socket.on('connect', () => {
    myId.value = socket.id
  })

  const isTyping = ref(false)
  let typingTimer: NodeJS.Timeout | null = null

  socket.on('user-typing', () => {
    isTyping.value = true
    if (typingTimer) clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      isTyping.value = false
    }, 1500)
  })

  function notifyTyping() {
    socket.emit('typing', roomId)
  }

  onBeforeUnmount(() => {
    socket.disconnect()
    chat.clearMessages()
  })

  return { messages: chat.messages, sendMessage, myId, notifyTyping, isTyping }
}
