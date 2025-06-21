import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChatMessage {
  id: string // ID пользователя или 'system'
  text: string
  timestamp: number
  messageId?: string
  status?: 'sent' | 'read'
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const currentRoom = ref<string | null>(null)

  function setRoom(roomId: string) {
    currentRoom.value = roomId
    loadMessages(roomId)
  }

  function addMessage(msg: ChatMessage) {
    messages.value.push(msg)
    saveMessages()
  }

  function clearMessages() {
    messages.value = []
    if (currentRoom.value) {
      localStorage.removeItem(`chatMessages:${currentRoom.value}`)
    }
  }

  function saveMessages() {
    if (!currentRoom.value) return
    localStorage.setItem(`chatMessages:${currentRoom.value}`, JSON.stringify(messages.value))
  }

  function loadMessages(roomId: string) {
    const saved = localStorage.getItem(`chatMessages:${roomId}`)
    messages.value = saved ? JSON.parse(saved) : []
  }

  return {
    messages,
    currentRoom,
    setRoom,
    addMessage,
    clearMessages,
    saveMessages,
    loadMessages,
  }
})
