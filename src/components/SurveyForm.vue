<template>
  <div class="space-y-6">
    <div class="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 p-4" role="alert">
      <p class="font-bold mb-1">📝 Ulasan & Survey Penggunaan Aplikasi</p>
      <p class="text-sm">Bantu kami meningkatkan kualitas sistem rekomendasi (CDSS) ini dengan memberikan ulasan Anda. Masukan Anda sangat berharga untuk penelitian skripsi ini.</p>
    </div>

    <form v-if="!submitted" @submit.prevent="submitSurvey" class="space-y-5">
      
      <!-- Rating Bintang -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-gray-700">1. Secara keseluruhan, berapa bintang yang Anda berikan untuk aplikasi ini?</label>
        <div class="flex gap-2">
          <button 
            type="button" 
            v-for="star in 5" 
            :key="star" 
            @click="form.rating = star"
            class="text-3xl focus:outline-none transition-transform hover:scale-110"
            :class="star <= form.rating ? 'text-yellow-400' : 'text-gray-300'"
          >
            ★
          </button>
        </div>
      </div>

      <!-- Ease of Use -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-gray-700">2. Seberapa mudah aplikasi ini digunakan? (Kemudahan Penggunaan)</label>
        <select v-model="form.ease_of_use" required class="w-full border rounded-md p-2 text-gray-700 bg-white">
          <option disabled value="">-- Pilih Tingkat Kemudahan --</option>
          <option value="Sangat Mudah">Sangat Mudah</option>
          <option value="Mudah">Mudah</option>
          <option value="Cukup">Cukup</option>
          <option value="Sulit">Sulit</option>
        </select>
      </div>

      <!-- Accuracy -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-gray-700">3. Apakah hasil rekomendasi diagnosa (triase) sesuai dengan harapan Anda?</label>
        <select v-model="form.accuracy" required class="w-full border rounded-md p-2 text-gray-700 bg-white">
          <option disabled value="">-- Pilih Tingkat Kesesuaian --</option>
          <option value="Sangat Sesuai">Sangat Sesuai</option>
          <option value="Sesuai">Sesuai</option>
          <option value="Cukup Sesuai">Cukup Sesuai</option>
          <option value="Tidak Sesuai">Tidak Sesuai</option>
        </select>
      </div>

      <!-- Comments -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-gray-700">4. Ada kritik, saran, atau masukan fitur untuk ke depannya? (Opsional)</label>
        <textarea 
          v-model="form.comments" 
          rows="4" 
          class="w-full border rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Tuliskan pengalaman Anda di sini..."
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="loading || form.rating === 0"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition disabled:bg-gray-400"
      >
        {{ loading ? 'Mengirim Survey...' : 'Kirim Ulasan Anda' }}
      </button>

      <div v-if="error" class="text-red-500 mt-2 text-center text-sm font-medium">
        ⚠️ {{ error }}
      </div>

    </form>

    <!-- Success Message -->
    <div v-else class="text-center py-10 bg-green-50 rounded-lg border border-green-200">
      <div class="text-5xl mb-4">🎉</div>
      <h2 class="text-xl font-bold text-green-700 mb-2">Terima Kasih Banyak!</h2>
      <p class="text-green-600">Survey dan ulasan Anda telah berhasil disimpan. Masukan Anda sangat berarti bagi pengembangan sistem CDSS dan penelitian skripsi ini.</p>
      <button @click="resetForm" class="mt-6 text-indigo-600 hover:underline font-medium">
        Kirim ulasan lainnya
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({
  rating: 0,
  ease_of_use: '',
  accuracy: '',
  comments: ''
})

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const submitSurvey = async () => {
  if (form.value.rating === 0) {
    error.value = 'Silakan berikan rating bintang terlebih dahulu.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await axios.post('/api/v1/survey', form.value)
    submitted.value = true
  } catch (err) {
    error.value = err.response?.data?.detail || 'Gagal mengirim survey ke server.'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    rating: 0,
    ease_of_use: '',
    accuracy: '',
    comments: ''
  }
  submitted.value = false
  error.value = ''
}
</script>
