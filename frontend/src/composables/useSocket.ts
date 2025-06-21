import { ref, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '@/stores/chat'

export function useSocket(roomIdRef: Ref<string>) {
  const chat = useChatStore()
  const socket: Socket = io('http://localhost:3000')

  const myId = ref(socket.id)
  const isTyping = ref(false)
  let typingTimer: ReturnType<typeof setTimeout> | null = null

  // Присоединение к комнате при изменении roomId
  watch(
    roomIdRef,
    (newRoomId, oldRoomId) => {
      if (oldRoomId) {
        socket.emit('leave-room', oldRoomId) // нужно добавить обработку leave-room на сервере
        chat.clearMessages()
      }
      if (newRoomId) {
        socket.emit('join-room', newRoomId)
      }
    },
    { immediate: true },
  )

  socket.on('connect', () => {
    myId.value = socket.id
  })

  socket.on('receive-message', (msg) => chat.addMessage(msg))

  socket.on('user-typing', () => {
    isTyping.value = true
    if (typingTimer) clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      isTyping.value = false
    }, 1500)
  })

  socket.on('system-message', (msg) => {
    console.log('Получено системное сообщение:', msg) // для отладки
    chat.addMessage({
      id: 'system',
      text: msg.text,
      timestamp: msg.timestamp,
    })
  })

  function sendMessage(text: string) {
    socket.emit('send-message', { roomId: roomIdRef.value, message: text })
  }

  function notifyTyping() {
    socket.emit('typing', roomIdRef.value)
  }

  onBeforeUnmount(() => {
    socket.disconnect()
    chat.clearMessages()
  })

  return { messages: chat.messages, sendMessage, myId, notifyTyping, isTyping }
}
