<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['search'])

const options = ref({
  age: null as string | null,
  gender: 'any' as string,
})

function search() {
  emit('search', options.value)
}

const age = [
  { value: null, label: 'Не имеет значение' },
  { value: '17', label: 'до 17' },
  { value: '18-21', label: '18-21' },
  { value: '22-25', label: '22-25' },
  { value: '26-35', label: '26-35' },
  { value: '35-44', label: '35-44' },
  { value: '45+', label: '45+' },
]

const gender = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
  { value: 'any', label: 'Не имеет значение' },
]
</script>

<template>
  <form
    @submit.prevent="search"
    class="space-y-4 absolute right-0 top-14 bg-white p-6 rounded shadow-md w-50"
  >
    <div>
      <p class="block text-sm font-bold mb-3">Возраст</p>
      <div class="flex items-center justify-start gap-3 flex-wrap">
        <button
          type="button"
          v-for="ageOption in age"
          :key="ageOption.label.length"
          @click="options.age = ageOption.value"
          :class="{
            'bg-blue-600 text-white': options.age === ageOption.value,
            'bg-gray-200 text-gray-800': options.age !== ageOption.value,
          }"
          class="p-2 w-[calc(50%-12px)] text-sm hover:text-white rounded hover:bg-blue-700 transition-colors"
        >
          {{ ageOption.label }}
        </button>
      </div>
    </div>
    <div>
      <p class="block text-sm font-bold mb-3">Пол</p>
      <div class="flex items-center justify-start gap-3 flex-wrap">
        <button
          type="button"
          v-for="genderOption in gender"
          :key="genderOption.value"
          @click="options.gender = genderOption.value"
          :class="{
            'bg-blue-600 text-white': options.gender === genderOption.value,
            'bg-gray-200 text-gray-800': options.gender !== genderOption.value,
          }"
          class="p-2 w-[calc(50%-12px)] text-sm hover:text-white rounded hover:bg-blue-700 transition-colors"
        >
          {{ genderOption.label }}
        </button>
      </div>
    </div>
    <button
      type="submit"
      class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full"
    >
      Начать поиск
    </button>
  </form>
</template>
