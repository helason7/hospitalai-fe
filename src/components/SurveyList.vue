<template>
  <div>
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-700">Daftar Feedback Pengguna</h3>
      <button @click="fetchSurveys" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition">
        🔄 Refresh Data
      </button>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
      Memuat data ulasan...
    </div>

    <div v-else-if="surveys.length === 0" class="text-center py-10 text-gray-500 border rounded-lg bg-gray-50">
      Belum ada data ulasan dari pengguna.
    </div>

    <div v-else class="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
      <table class="min-w-full bg-white text-sm text-left">
        <thead class="bg-gray-50 text-gray-600 border-b">
          <tr>
            <th class="py-3 px-4 w-16">ID</th>
            <th class="py-3 px-4 w-24">Rating</th>
            <th class="py-3 px-4 w-40">Kemudahan</th>
            <th class="py-3 px-4 w-40">Akurasi</th>
            <th class="py-3 px-4">Komentar / Saran</th>
            <th class="py-3 px-4 w-40">Tanggal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in surveys" :key="s.id" class="hover:bg-indigo-50/30 transition">
            <td class="py-3 px-4 text-gray-500">{{ s.id }}</td>
            <td class="py-3 px-4 text-yellow-500 text-lg">
              {{ '★'.repeat(s.rating) }}{{ '☆'.repeat(5 - s.rating) }}
            </td>
            <td class="py-3 px-4">
              <span :class="['px-2 py-1 rounded-full text-xs', s.ease_of_use.includes('Mudah') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                {{ s.ease_of_use }}
              </span>
            </td>
            <td class="py-3 px-4">
              <span :class="['px-2 py-1 rounded-full text-xs', s.accuracy.includes('Sesuai') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700']">
                {{ s.accuracy }}
              </span>
            </td>
            <td class="py-3 px-4 text-gray-700 italic">
              "{{ s.comments || 'Tidak ada komentar' }}"
            </td>
            <td class="py-3 px-4 text-gray-500 text-xs">
              {{ formatDate(s.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const surveys = ref([])
const loading = ref(false)

const fetchSurveys = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/v1/survey')
    surveys.value = data
  } catch (err) {
    console.error("Gagal mengambil data survey:", err)
  } finally {
    loading.value = false
  }
}

const formatDate = (isoString) => {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchSurveys()
})
</script>
