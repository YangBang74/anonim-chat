<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
const emit = defineEmits(['submit'])

const form = ref({
  age: '',
  gender: '',
})

const LOCAL_STORAGE_KEY = 'userSearchFilters'

function saveFormToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form.value))
}

function loadFormFromLocalStorage() {
  const savedFilters = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (savedFilters) {
    form.value = JSON.parse(savedFilters)
  }
}

watch(
  form,
  () => {
    saveFormToLocalStorage()
  },
  { deep: true },
)

onMounted(() => {
  loadFormFromLocalStorage()
  // emit('submit', form.value)
})

function submit() {
  saveFormToLocalStorage()
  emit('submit', form.value)
  window.location.reload()
}

const age = [
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
]
</script>

<template>
  <form
    @submit.prevent="submit"
    class="space-y-4 absolute right-0 top-14 bg-white p-6 rounded shadow-md w-96"
  >
    <div>
      <p class="block text-sm font-bold mb-3">Возраст</p>
      <div class="flex items-center justify-start gap-3 flex-wrap">
        <button
          type="button"
          v-for="ageOption in age"
          :key="ageOption.value"
          @click="form.age = ageOption.value"
          :class="{
            'bg-blue-600 text-white': form.age === ageOption.value,
            'bg-gray-200 text-gray-800': form.age !== ageOption.value,
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
          @click="form.gender = genderOption.value"
          :class="{
            'bg-blue-600 text-white': form.gender === genderOption.value,
            'bg-gray-200 text-gray-800': form.gender !== genderOption.value,
          }"
          class="p-2 w-[calc(50%-12px)] text-sm hover:text-white rounded hover:bg-blue-700 transition-colors"
        >
          {{ genderOption.label }}
        </button>
      </div>
    </div>
    <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full">
      Сохранить
    </button>
  </form>
</template>
