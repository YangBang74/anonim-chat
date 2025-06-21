import { ref, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '@/stores/chat'

export function useSocket(roomIdRef: Ref<string>) {
  const chat = useChatStore()

  // Получаем или создаём userId
  function getOrCreateUserId(): string {
    const existingId = localStorage.getItem('user-id')
    if (existingId) return existingId
    const newId = crypto.randomUUID()
    localStorage.setItem('user-id', newId)
    return newId
  }

  const myId = ref(getOrCreateUserId())

  // Создаём socket с userId в auth
  const socket: Socket = io('http://localhost:3000', {
    auth: {
      userId: myId.value,
    },
  })

  const isTyping = ref(false)
  const isChatEnded = ref(false)
  let typingTimer: ReturnType<typeof setTimeout> | null = null

  // Следим за сменой комнаты
  watch(
    roomIdRef,
    (newRoomId, oldRoomId) => {
      if (oldRoomId) {
        socket.emit('leave-room', oldRoomId)
        chat.clearMessages()
      }
      if (newRoomId) {
        socket.emit('join-room', newRoomId)
        chat.setRoom(newRoomId)
      }
    },
    { immediate: true },
  )

  socket.on('connect', () => {
    console.log('✅ Connected with socket.id:', socket.id)
  })

  function sendMessage(text: string) {
    const messageId = Date.now()
    socket.emit('send-message', {
      roomId: roomIdRef.value,
      message: text,
      messageId,
      senderId: myId.value,
    })
  }

  function endChat() {
    localStorage.removeItem('user-id') // Удаляем ID
    socket.emit('end-chat', roomIdRef.value)
  }

  socket.on('chat-ended', () => {
    isChatEnded.value = true
    chat.clearMessages()
  })

  socket.on('receive-message', (msg) => {
    if (!chat.messages.find((m) => m.timestamp === msg.timestamp)) {
      chat.addMessage(msg)
    }
  })

  socket.on('user-typing', () => {
    isTyping.value = true
    if (typingTimer) clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      isTyping.value = false
    }, 1500)
  })

  socket.on('system-message', (msg) => {
    chat.addMessage({
      id: 'system',
      text: msg.text,
      timestamp: msg.timestamp,
    })
  })

  socket.on('message-read', ({ messageId }) => {
    const index = chat.messages.findIndex((m) => m.timestamp === messageId)
    if (index !== -1) {
      chat.messages[index] = {
        ...chat.messages[index],
        status: 'read',
      }
    }
  })

  function markAsRead(messageId: number) {
    socket.emit('read-message', {
      roomId: roomIdRef.value,
      messageId,
    })
  }

  function notifyTyping() {
    socket.emit('typing', roomIdRef.value)
  }

  onBeforeUnmount(() => {
    socket.disconnect()
    chat.clearMessages()
  })

  return {
    messages: chat.messages,
    sendMessage,
    markAsRead,
    myId,
    endChat,
    notifyTyping,
    isTyping,
    isChatEnded,
    socket,
  }
}
