<template>
  <div class="p-4 border-t flex">
    <input
      v-model="text"
      @keyup.enter="submit"
      type="text"
      placeholder="Введите сообщение…"
      class="flex-1 border rounded-l px-3 py-2 focus:outline-none"
    />
    <button @click="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r">
      Отправить
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  onTyping?: () => void
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
}>()

const text = ref('')

watch(text, () => {
  if (props.onTyping) props.onTyping()
})

function submit() {
  if (text.value.trim()) {
    emit('send', text.value.trim())
    text.value = ''
  }
}
</script>
