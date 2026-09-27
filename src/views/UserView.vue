<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-10">
    
    <!-- DISCLAIMER MODAL -->
    <div v-if="showDisclaimer" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8 transform transition-all">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4 mx-auto">
          <span class="text-2xl">⚠️</span>
        </div>
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-4">Persetujuan & Disclaimer</h2>
        <div class="text-gray-600 text-sm space-y-3 mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-justify">
          <p>Aplikasi ini dikembangkan untuk tujuan penelitian ilmiah dan eksperimental. Rekomendasi triase dan diagnosa awal yang dihasilkan oleh aplikasi ini digenerasi sepenuhnya oleh Kecerdasan Buatan (AI) berdasarkan pencocokan pedoman medis.</p>
          <p><strong>Peringatan Keras:</strong> Aplikasi ini BUKAN pengganti keputusan klinis dari tenaga medis profesional. Sangat disarankan untuk selalu berkonsultasi dengan dokter untuk setiap tindakan medis.</p>
          <p>Dengan menekan tombol <strong>"Saya Setuju"</strong>, Anda memahami batasan sistem ini dan setuju bahwa Anda tidak akan menuntut pembuat aplikasi atas segala risiko atau kesalahan yang mungkin timbul dari penggunaan informasi di dalamnya.</p>
        </div>
        <button 
          @click="acceptDisclaimer" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Saya Setuju & Mengerti
        </button>
      </div>
    </div>

    <!-- MAIN APP WRAPPER -->
    <div class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl relative">
      <h1 class="text-2xl font-semibold mb-6 text-center text-blue-600">
        🏥 DiagnoX (Hospital Assistant)
      </h1>
      
      <!-- Tab Navigation -->
      <div class="flex border-b mb-6 text-sm sm:text-base">
        <button 
          @click="activeTab = 'recommend'" 
          :class="['flex-1 py-2 px-1 text-center font-medium transition', activeTab === 'recommend' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50']"
        >
          🩺 Diagnosa Pasien
        </button>
      </div>

      <!-- Tab Content -->
      <RecommenderForm v-if="activeTab === 'recommend'" @go-to-survey="activeTab = 'survey'" />
      <SurveyForm v-if="activeTab === 'survey'" />
      
    </div>
    
    <footer class="mt-8 text-gray-500 text-sm font-medium text-center">
      Powered by FastAPI + LangChain + HuggingFace Local Embeddings<br>
      Skripsi © 2026 | <router-link to="/admin" class="text-blue-500 hover:underline">Admin Login</router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RecommenderForm from '../components/RecommenderForm.vue'
import SurveyForm from '../components/SurveyForm.vue'

// State untuk mengatur tab yang aktif
const activeTab = ref('recommend') // 'recommend', 'survey'

// Logika Disclaimer Pop-Up
const showDisclaimer = ref(false)

onMounted(() => {
  // Cek apakah user sudah pernah menyetujui disclaimer sebelumnya
  const agreed = localStorage.getItem('disclaimerAgreed')
  if (agreed !== 'true') {
    showDisclaimer.value = true
  }
})

const acceptDisclaimer = () => {
  // Simpan ke local storage agar pop-up tidak muncul lagi di masa depan
  localStorage.setItem('disclaimerAgreed', 'true')
  showDisclaimer.value = false
}
</script>
