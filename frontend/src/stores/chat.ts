import { defineStore } from "pinia";
import { ref } from "vue";

export interface ChatMessage {
  id: string; 
  text: string;
  timestamp: number;
}

export const useChatStore = defineStore("chat", () => {
  const messages = ref<ChatMessage[]>([]);

  function addMessage(msg: ChatMessage) {
    messages.value.push(msg);
  }

  function clearMessages() {
    messages.value = [];
  }

  return { messages, addMessage, clearMessages };
});
