<template>
  <div class="min-h-screen bg-gray-100 flex">
    
    <!-- SIDEBAR ADMIN -->
    <aside class="w-64 bg-white shadow-md">
      <div class="p-6 border-b">
        <h1 class="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <p class="text-xs text-gray-500 mt-1">DiagnoX CDSS</p>
      </div>
      <nav class="p-4 space-y-2">
        <button 
          @click="activeTab = 'history'" 
          :class="['w-full text-left px-4 py-2 rounded-lg transition-colors', activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50']"
        >
          📂 Riwayat Pasien
        </button>
        <button 
          @click="activeTab = 'upload'" 
          :class="['w-full text-left px-4 py-2 rounded-lg transition-colors', activeTab === 'upload' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50']"
        >
          📚 Kelola Dokumen (RAG)
        </button>
        <button 
          @click="activeTab = 'survey_list'" 
          :class="['w-full text-left px-4 py-2 rounded-lg transition-colors', activeTab === 'survey_list' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50']"
        >
          ⭐ Data Ulasan UAT
        </button>
      </nav>
      <div class="p-4 mt-auto border-t absolute bottom-0 w-64">
        <router-link to="/" class="text-sm text-blue-600 hover:underline">← Ke Halaman User</router-link>
      </div>
    </aside>

    <!-- MAIN CONTENT ADMIN -->
    <main class="flex-1 p-8 overflow-y-auto h-screen">
      <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        
        <h2 class="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4">
          {{ activeTab === 'history' ? 'Riwayat Diagnosa Pasien' : (activeTab === 'upload' ? 'Kelola Dokumen Referensi AI' : 'Data Ulasan Pengguna (Survey)') }}
        </h2>

        <PatientHistory v-if="activeTab === 'history'" />
        <DocumentUpload v-if="activeTab === 'upload'" />
        <SurveyList v-if="activeTab === 'survey_list'" />

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PatientHistory from '../components/PatientHistory.vue'
import DocumentUpload from '../components/DocumentUpload.vue'
import SurveyList from '../components/SurveyList.vue'

const activeTab = ref('history')
</script>
