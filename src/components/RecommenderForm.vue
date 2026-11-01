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
      class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold w-full py-2.5 rounded-md transition flex items-center justify-center gap-2"
    >
      <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>{{ loading ? 'Analyzing...' : 'Get Recommendation' }}</span>
    </button>

    <div v-if="error" class="text-red-500 mt-3 text-center">
      ⚠️ {{ error }}
    </div>

    <!-- HASIL DIAGNOSA / REKOMENDASI -->
    <div v-if="hasResults" class="mt-6 space-y-4 pt-5 border-t border-gray-200">
      <!-- Departemen yang Direkomendasikan -->
      <div v-if="result.recommended_department && result.recommended_department.length > 0" class="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
        <h2 class="text-sm font-bold text-blue-900 mb-2 flex items-center gap-1.5">
          <span>🏥</span> Departemen yg berhubungan (Recommended Department):
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(dept, idx) in result.recommended_department"
            :key="idx"
            class="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
          >
            {{ dept }}
          </span>
        </div>
      </div>

      <!-- Kemungkinan Penyakit -->
      <div v-if="normalizedIllnesses.length > 0" class="p-4 bg-red-50/70 border border-red-200 rounded-lg">
        <h2 class="text-sm font-bold text-red-900 mb-3 flex items-center justify-between flex-wrap gap-1">
          <span class="flex items-center gap-1.5">
            <span>🩺</span> Kemungkinan Penyakit (Possibility of Illness):
          </span>
          <span class="text-[11px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
            Estimasi Kemungkinan
          </span>
        </h2>
        <div class="space-y-2.5">
          <div
            v-for="(illness, idx) in normalizedIllnesses"
            :key="idx"
            class="bg-white p-3 rounded-lg border border-red-100 shadow-sm"
          >
            <div class="flex justify-between items-center mb-1.5">
              <span class="font-semibold text-gray-800 text-sm">
                {{ illness.name }}
              </span>
              <span
                v-if="illness.percentage !== null"
                :class="getPercentageBadgeClass(illness.percentage)"
                class="text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center"
              >
                {{ illness.percentage }}%
              </span>
            </div>

            <!-- Progress Bar -->
            <div v-if="illness.percentage !== null" class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                class="h-2.5 rounded-full transition-all duration-500 ease-out"
                :class="getProgressBarClass(illness.percentage)"
                :style="{ width: `${Math.min(Math.max(illness.percentage, 0), 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rekomendasi Penanganan Awal -->
      <div v-if="result.initial_handling && result.initial_handling.length > 0" class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
        <h2 class="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
          <span>💊</span> Rekomendasi Penanganan Awal (Initial Handling):
        </h2>
        <ol class="space-y-1.5 text-xs text-gray-800 list-decimal list-inside pl-1">
          <li v-for="(handling, idx) in result.initial_handling" :key="idx" class="leading-relaxed">
            <span class="font-medium text-gray-800">{{ handling }}</span>
          </li>
        </ol>
      </div>

      <!-- Sumber Referensi Medis -->
      <div v-if="result.sources && result.sources.length > 0" class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
          <span>📚</span> Sumber Referensi (Sources):
        </h2>
        <ul class="space-y-2.5">
          <li
            v-for="(src, idx) in result.sources"
            :key="idx"
            class="p-3 bg-white border border-gray-200 rounded-md text-xs shadow-sm hover:border-gray-300 transition"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span class="font-medium text-gray-800 flex-1 leading-snug">
                {{ typeof src === 'string' ? src : src.document_name }}
              </span>

              <div class="flex items-center gap-2 shrink-0 flex-wrap">
                <!-- Halaman Referensi -->
                <span
                  v-if="src.pages && src.pages.length > 0"
                  class="bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1"
                >
                  <span>📄</span> Hal. {{ formatPages(src.pages) }}
                </span>

                <!-- Link Dokumen -->
                <a
                  v-if="src.document_url"
                  :href="getDocumentUrl(src)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-0.5 text-[11px]"
                >
                  <span>[Lihat Dokumen]</span>
                  <span class="text-[10px]">↗</span>
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div v-else class="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-2">
        <span>ℹ️</span>
        <span>Rekomendasi di atas berdasarkan analisis medis umum AI (tidak ada dokumen PNPK spesifik yang cocok).</span>
      </div>
    </div>

    <!-- TAUTAN KE SURVEY -->
    <div v-if="hasResults" class="mt-8 pt-6 border-t border-gray-200 text-center">
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
import { ref, computed } from 'vue'

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

const hasResults = computed(() => {
  return (
    (Array.isArray(result.value?.recommended_department) && result.value.recommended_department.length > 0) ||
    (Array.isArray(result.value?.possibility_of_illness) && result.value.possibility_of_illness.length > 0) ||
    (Array.isArray(result.value?.initial_handling) && result.value.initial_handling.length > 0)
  )
})

const normalizedIllnesses = computed(() => {
  if (!Array.isArray(result.value?.possibility_of_illness)) return []
  return result.value.possibility_of_illness.map(item => {
    if (typeof item === 'string') {
      return { name: item, percentage: null }
    }
    if (typeof item === 'object' && item !== null) {
      const pct = typeof item.percentage === 'number' ? item.percentage : (item.percentage ? parseInt(item.percentage) : null)
      return {
        name: item.name || 'Penyakit Tidak Diketahui',
        percentage: Number.isFinite(pct) ? pct : null
      }
    }
    return { name: String(item), percentage: null }
  })
})

const getProgressBarClass = (percentage) => {
  if (percentage >= 70) return 'bg-red-500'
  if (percentage >= 40) return 'bg-amber-500'
  return 'bg-blue-500'
}

const getPercentageBadgeClass = (percentage) => {
  if (percentage >= 70) return 'bg-red-100 text-red-700 border border-red-200'
  if (percentage >= 40) return 'bg-amber-100 text-amber-700 border border-amber-200'
  return 'bg-blue-100 text-blue-700 border border-blue-200'
}

const formatPages = (pages) => {
  if (!pages) return ''
  if (Array.isArray(pages)) {
    return pages.join(', ')
  }
  return String(pages)
}

const getDocumentUrl = (src) => {
  if (!src || !src.document_url) return '#'
  if (
    Array.isArray(src.pages) &&
    src.pages.length > 0 &&
    src.document_url.toLowerCase().endsWith('.pdf') &&
    !src.document_url.includes('#page=')
  ) {
    return `${src.document_url}#page=${src.pages[0]}`
  }
  return src.document_url
}

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
