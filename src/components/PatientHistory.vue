<template>
  <div class="space-y-4">
    <div class="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 p-4 mt-4" role="alert">
      <p class="font-bold mb-1">📋 Riwayat Diagnosa Pasien</p>
      <p class="text-sm">Di bawah ini adalah riwayat pengecekan gejala pasien yang pernah dilakukan oleh sistem AI. Data ini tersimpan di database lokal Anda.</p>
    </div>

    <div class="mt-4 pt-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 class="text-lg font-semibold text-gray-700">Daftar Rekam Medis</h2>
        
        <div class="flex gap-2 w-full sm:w-auto">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari gejala, penyakit, poli..." 
            class="border rounded-md px-3 py-1 text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button @click="fetchHistory" class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md transition whitespace-nowrap">
            🔄 Refresh
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table class="min-w-full bg-white text-sm text-left">
          <thead class="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th @click="sortBy('id')" class="py-3 px-4 w-16 cursor-pointer hover:bg-gray-100 transition select-none">
                ID <span v-if="sortKey === 'id'">{{ sortDesc ? '▼' : '▲' }}</span>
              </th>
              <th class="py-3 px-4">Pasien & Gejala</th>
              <th class="py-3 px-4">Rekomendasi AI</th>
              <th @click="sortBy('created_at')" class="py-3 px-4 cursor-pointer hover:bg-gray-100 transition select-none w-40">
                Tanggal <span v-if="sortKey === 'created_at'">{{ sortDesc ? '▼' : '▲' }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="4" class="py-8 text-center text-gray-500">Memuat data riwayat...</td>
            </tr>
            <tr v-else-if="sortedAndFilteredHistories.length === 0">
              <td colspan="4" class="py-8 text-center text-gray-500">
                {{ searchQuery ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada riwayat pasien.' }}
              </td>
            </tr>
            <tr v-else v-for="h in paginatedHistories" :key="h.id" class="hover:bg-indigo-50/30 transition">
              <td class="py-3 px-4 text-gray-500 align-top">{{ h.id }}</td>
              <td class="py-3 px-4 align-top">
                <div class="font-semibold text-gray-700">{{ h.gender === 'male' ? 'Laki-laki' : (h.gender === 'female' ? 'Perempuan' : h.gender) }}, {{ h.age }} thn</div>
                <div class="text-xs text-gray-500 mt-1 italic">"{{ h.symptoms }}"</div>
              </td>
              <td class="py-3 px-4 align-top text-xs">
                <div class="mb-1">
                  <span class="font-semibold text-blue-600">Poli:</span> 
                  {{ safeParse(h.recommended_department).join(', ') || '-' }}
                </div>
                <div class="mb-1">
                  <span class="font-semibold text-red-600">Penyakit:</span> 
                  {{ safeParse(h.possibility_of_illness).join(', ') || '-' }}
                </div>
                <div>
                  <span class="font-semibold text-green-600">Penanganan:</span> 
                  {{ safeParse(h.initial_handling).join(', ') || '-' }}
                </div>
              </td>
              <td class="py-3 px-4 text-gray-500 text-xs align-top whitespace-nowrap">
                {{ formatDate(h.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- PAGINATION CONTROLS -->
      <div class="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="text-xs text-gray-500">
          Menampilkan <span class="font-semibold">{{ sortedAndFilteredHistories.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1 }}</span> - 
          <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, sortedAndFilteredHistories.length) }}</span> 
          dari <span class="font-semibold">{{ sortedAndFilteredHistories.length }}</span> data.
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Kembali
          </button>
          
          <span class="text-sm text-gray-600 px-2">
            Hal {{ currentPage }} / {{ totalPages || 1 }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages || totalPages === 0"
            class="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Lanjut
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, onMounted, watch } from 'vue'

const histories = ref([])
const loading = ref(false)

// State untuk searching & sorting
const searchQuery = ref('')
const sortKey = ref('id')
const sortDesc = ref(true)

// State untuk pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortKey.value = key
    sortDesc.value = true
  }
}

const sortedAndFilteredHistories = computed(() => {
  let result = histories.value

  // Searching
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(h => 
      h.symptoms.toLowerCase().includes(q) ||
      h.recommended_department.toLowerCase().includes(q) ||
      h.possibility_of_illness.toLowerCase().includes(q) ||
      (h.gender === 'male' ? 'laki-laki' : 'perempuan').includes(q)
    )
  }

  // Sorting
  result = result.slice().sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]
    
    if (sortKey.value === 'created_at') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    }
    
    if (valA < valB) return sortDesc.value ? 1 : -1
    if (valA > valB) return sortDesc.value ? -1 : 1
    return 0
  })

  return result
})

// Reset page ke 1 jika ada pencarian baru
watch(searchQuery, () => {
  currentPage.value = 1
})

const totalPages = computed(() => {
  return Math.ceil(sortedAndFilteredHistories.value.length / itemsPerPage.value)
})

const paginatedHistories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedAndFilteredHistories.value.slice(start, end)
})

const safeParse = (jsonString) => {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    return []
  }
}

const formatDate = (isoString) => {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const fetchHistory = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/v1/history')
    histories.value = data
  } catch (err) {
    console.error("Gagal mengambil riwayat:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHistory()
})
</script>
