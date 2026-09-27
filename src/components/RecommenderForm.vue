<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Jenis Kelamin (Gender)</label>
      <select v-model="form.gender" class="w-full border rounded-md p-2" required>
        <option disabled value="">-- Pilih Gender --</option>
        <option value="male">Laki-laki</option>
        <option value="female">Perempuan</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Umur (Age)</label>
      <input
        v-model="form.age"
        type="number"
        min="0"
        required
        class="w-full border rounded-md p-2"
        placeholder="Enter patient age"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Gejala (Symptoms)</label>
      <div class="flex gap-2">
        <input
          v-model="symptomInput"
          @keyup.enter="addSymptom"
          type="text"
          class="flex-1 border rounded-md p-2"
          placeholder="Enter symptom and press Enter or click Add"
        />
        <button
          type="button"
          @click="addSymptom"
          :disabled="!symptomInput.trim()"
          class="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
        >
          Masukan Gejala
        </button>
      </div>
      <div class="flex flex-wrap gap-2 mt-2">
        <span
          v-for="(symptom, index) in form.symptoms"
          :key="index"
          class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
        >
          {{ symptom }}
          <button
            type="button"
            @click="removeSymptom(index)"
            class="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </span>
      </div>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full py-2 rounded-md transition"
    >
      {{ loading ? 'Analyzing...' : 'Get Recommendation' }}
    </button>

    <div v-if="error" class="text-red-500 mt-3 text-center">
      ⚠️ {{ error }}
    </div>

    <div v-if="result.recommended_department" class="mt-4">
      <h2 class="text-lg font-medium text-gray-700 mb-2">Departemen yg berhubungan (Recommended Department):</h2>
      <ul class="list-disc list-inside text-blue-600">
        <li v-for="dept in result.recommended_department" :key="dept">{{ dept }}</li>
      </ul>
    </div>

    <div v-if="result.possibility_of_illness" class="mt-4">
      <h2 class="text-lg font-medium text-gray-700 mb-2">Kemungkinan Penyakit (Possibility of Illness):</h2>
      <ul class="list-disc list-inside text-red-600">
        <li v-for="illness in result.possibility_of_illness" :key="illness">{{ illness }}</li>
      </ul>
    </div>

    <div v-if="result.initial_handling" class="mt-4">
      <h2 class="text-lg font-medium text-gray-700 mb-2">Rekomendasi Penanganan Awal (Initial Handling):</h2>
      <ul class="list-disc list-inside text-green-600">
        <li v-for="handling in result.initial_handling" :key="handling">{{ handling }}</li>
      </ul>
    </div>

    <div v-if="result.sources && result.sources.length > 0" class="mt-6 p-4 bg-gray-50 border rounded-md">
      <h2 class="text-md font-bold text-gray-700 mb-2">📚 Sumber Referensi (Sources):</h2>
      <ul class="list-disc list-inside text-gray-600 text-sm">
        <li v-for="(src, idx) in result.sources" :key="idx" class="mb-1">
          {{ src.document_name }}
          <a v-if="src.document_url" :href="src.document_url" target="_blank" class="text-blue-500 hover:underline ml-1 text-xs">[Lihat Dokumen]</a>
        </li>
      </ul>
    </div>

    <!-- TAUTAN KE SURVEY -->
    <div v-if="result.recommended_department" class="mt-8 pt-6 border-t border-gray-200 text-center">
      <p class="text-sm text-gray-600 mb-3">Apakah hasil diagnosa ini membantu Anda? Berikan kami masukan!</p>
      <button 
        type="button"
        @click="$emit('go-to-survey')"
        class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold py-2 px-6 rounded-full transition shadow-sm"
      >
        📝 Isi Survey Aplikasi
      </button>
    </div>
  </form>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'

const emit = defineEmits(['go-to-survey'])

const form = ref({
  gender: '',
  age: '',
  symptoms: []
})
const symptomInput = ref('')
const result = ref({})
const loading = ref(false)
const error = ref('')

const addSymptom = () => {
  if (symptomInput.value.trim() && !form.value.symptoms.includes(symptomInput.value)) {
    form.value.symptoms.push(symptomInput.value.trim())
    symptomInput.value = ''
  }
}

const removeSymptom = (index) => {
  form.value.symptoms.splice(index, 1)
}

const submitForm = async () => {
  if (form.value.symptoms.length === 0) {
    error.value = 'Silakan masukkan minimal 1 gejala.'
    return
  }

  result.value = {}
  error.value = ''
  loading.value = true

  try {
    const { data } = await axios.post('/api/v1/recommend', form.value, {
      timeout: 180000 // Diperpanjang menjadi 3 menit (180 detik) karena proses RAG LLM memakan waktu
    })
    result.value = data
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      error.value = 'Request timed out. Please try again.'
    } else {
      error.value = err.response?.data?.detail || 'Error contacting server.'
    }
  } finally {
    loading.value = false
  }
}
</script>
