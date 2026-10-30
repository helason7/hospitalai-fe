<template>
  <div class="min-h-screen bg-gray-100 flex">
    
    <!-- SIDEBAR ADMIN -->
    <aside class="w-64 bg-white shadow-md flex flex-col justify-between h-screen sticky top-0 border-r border-gray-200">
      <div>
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>🏥</span>
              <span>DiagnoX CDSS</span>
            </h1>
            <p class="text-xs text-gray-500 mt-1">Admin Control Center</p>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Aktif
          </span>
        </div>

        <nav class="p-4 space-y-1.5">
          <button 
            @click="activeTab = 'history'" 
            :class="['w-full text-left px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center space-x-3 text-sm', activeTab === 'history' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100']"
          >
            <span class="text-base">📂</span>
            <span>Riwayat Diagnosa User</span>
          </button>
          <button 
            @click="activeTab = 'upload'" 
            :class="['w-full text-left px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center space-x-3 text-sm', activeTab === 'upload' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100']"
          >
            <span class="text-base">📚</span>
            <span>Kelola Dokumen (RAG)</span>
          </button>
          <button 
            @click="activeTab = 'survey_list'" 
            :class="['w-full text-left px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center space-x-3 text-sm', activeTab === 'survey_list' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100']"
          >
            <span class="text-base">⭐</span>
            <span>Data Ulasan UAT</span>
          </button>
        </nav>
      </div>

      <!-- Bottom Profile & Actions -->
      <div class="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
        <div class="flex items-center justify-between text-xs text-gray-600 px-1">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>User:</span>
          </span>
          <span class="font-bold text-gray-800 uppercase tracking-wider">{{ adminUsername }}</span>
        </div>

        <router-link 
          to="/" 
          class="block text-center text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline py-1"
        >
          ← Ke Halaman User
        </router-link>

        <button 
          @click="handleLogout"
          class="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT ADMIN -->
    <main class="flex-1 p-8 overflow-y-auto h-screen">
      <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        
        <h2 class="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4">
          {{ activeTab === 'history' ? 'Riwayat Diagnosa User' : (activeTab === 'upload' ? 'Kelola Dokumen Referensi AI' : 'Data Ulasan Pengguna (Survey)') }}
        </h2>

        <PatientHistory v-if="activeTab === 'history'" />
        <DocumentUpload v-if="activeTab === 'upload'" />
        <SurveyList v-if="activeTab === 'survey_list'" />

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PatientHistory from '../components/PatientHistory.vue'
import DocumentUpload from '../components/DocumentUpload.vue'
import SurveyList from '../components/SurveyList.vue'

const router = useRouter()
const activeTab = ref('history')
const adminUsername = ref('admin')

onMounted(() => {
  const user = localStorage.getItem('admin_user')
  if (user) {
    adminUsername.value = user
  }
})

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/admin/login')
}
</script>
