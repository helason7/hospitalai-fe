<template>
  <div class="space-y-6 relative">
    <!-- INFO BANNER -->
    <div class="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
      <p class="font-bold mb-1">📚 Basis Pengetahuan (Knowledge Base)</p>
      <p class="text-sm">Unggah dokumen pedoman medis resmi (PDF) yang akan digunakan sebagai referensi cerdas bagi AI. Anda dapat mencantumkan URL asli dokumen sebagai referensi bagi pengguna (opsional).</p>
    </div>

    <!-- UPLOAD FORM -->
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nama Dokumen</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full border rounded-md p-2"
          placeholder="Contoh: PNPK Tatalaksana Tuberkulosis"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">URL Asli (Opsional)</label>
        <input
          v-model="url"
          type="url"
          class="w-full border rounded-md p-2"
          placeholder="Contoh: https://kemkes.go.id/..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">File Dokumen (.pdf)</label>
        <input
          type="file"
          accept=".pdf"
          required
          ref="fileInput"
          @change="handleFileChange"
          class="w-full border rounded-md p-2 bg-white text-sm"
        />
      </div>

      <button
        type="submit"
        :disabled="loading || !file"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold w-full py-2 rounded-md transition disabled:bg-gray-400"
      >
        {{ loading ? 'Mengunggah & Memproses...' : 'Upload Dokumen' }}
      </button>

      <div v-if="success" class="text-green-700 mt-3 text-center bg-green-50 p-3 rounded-md border border-green-200 text-sm">
        ✅ {{ success }}
      </div>

      <div v-if="error" class="text-red-600 mt-3 text-center bg-red-50 p-3 rounded-md border border-red-200 text-sm">
        ⚠️ {{ error }}
      </div>
    </form>

    <!-- DOCUMENTS TABLE -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 class="text-lg font-semibold text-gray-700">Daftar Dokumen Tersimpan</h2>
        
        <div class="flex gap-2 w-full sm:w-auto">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari nama dokumen..." 
            class="border rounded-md px-3 py-1 text-sm w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button @click="fetchDocuments" class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md transition whitespace-nowrap">
            🔄 Refresh
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table class="min-w-full bg-white text-sm text-left">
          <thead class="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th @click="sortBy('id')" class="py-3 px-4 w-12 cursor-pointer hover:bg-gray-100 transition select-none">
                ID <span v-if="sortKey === 'id'">{{ sortDesc ? '▼' : '▲' }}</span>
              </th>
              <th @click="sortBy('name')" class="py-3 px-4 cursor-pointer hover:bg-gray-100 transition select-none">
                Nama & Tautan <span v-if="sortKey === 'name'">{{ sortDesc ? '▼' : '▲' }}</span>
              </th>
              <th @click="sortBy('created_at')" class="py-3 px-4 cursor-pointer hover:bg-gray-100 transition select-none">
                Tanggal <span v-if="sortKey === 'created_at'">{{ sortDesc ? '▼' : '▲' }}</span>
              </th>
              <th class="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="documentsLoading">
              <td colspan="4" class="py-6 text-center text-gray-500">Memuat data...</td>
            </tr>
            <tr v-else-if="sortedAndFilteredDocs.length === 0">
              <td colspan="4" class="py-6 text-center text-gray-500">
                {{ searchQuery ? 'Tidak ada dokumen yang cocok dengan pencarian.' : 'Belum ada dokumen yang diunggah.' }}
              </td>
            </tr>
            <tr v-else v-for="doc in paginatedDocs" :key="doc.id" class="hover:bg-blue-50/30 transition">
              <td class="py-3 px-4 text-gray-500 align-top">{{ doc.id }}</td>
              <td class="py-3 px-4 align-top">
                <div class="font-medium text-gray-700">{{ doc.name }}</div>
                <a v-if="doc.url" :href="doc.url" target="_blank" class="text-blue-500 hover:underline text-xs">Lihat Dokumen 🔗</a>
              </td>
              <td class="py-3 px-4 text-gray-500 text-xs whitespace-nowrap align-top">
                <div>Up: {{ formatDate(doc.created_at) }}</div>
                <div v-if="doc.updated_at && doc.updated_at !== doc.created_at" class="text-indigo-500">Ed: {{ formatDate(doc.updated_at) }}</div>
              </td>
              <td class="py-3 px-4 text-center space-x-2 align-top whitespace-nowrap">
                <button @click="openEditModal(doc)" class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs transition">
                  Edit
                </button>
                <button @click="deleteDocument(doc.id, doc.name)" class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs transition">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- PAGINATION CONTROLS -->
      <div class="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="text-xs text-gray-500">
          Menampilkan <span class="font-semibold">{{ sortedAndFilteredDocs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1 }}</span> - 
          <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, sortedAndFilteredDocs.length) }}</span> 
          dari <span class="font-semibold">{{ sortedAndFilteredDocs.length }}</span> dokumen.
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

    <!-- EDIT MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-bold mb-4 text-gray-800">Edit Data Dokumen</h3>
        
        <form @submit.prevent="submitEdit">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Nama Dokumen</label>
            <input v-model="editForm.name" type="text" required class="w-full border rounded-md p-2" />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">URL Asli</label>
            <input v-model="editForm.url" type="url" class="w-full border rounded-md p-2" />
          </div>

          <div v-if="editError" class="text-red-500 text-sm mb-3">⚠️ {{ editError }}</div>

          <div class="flex justify-end gap-2 mt-6">
            <button type="button" @click="closeEditModal" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition">Batal</button>
            <button type="submit" :disabled="editLoading" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition disabled:bg-blue-300">
              {{ editLoading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE LOADING OVERLAY -->
    <div v-if="deleteLoading" class="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-[60] backdrop-blur-sm">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4 shadow-lg"></div>
      <p class="text-white font-semibold text-lg tracking-wide">Menghapus dokumen dari database...</p>
      <p class="text-white/80 text-sm mt-2">Mohon tunggu, AI sedang membongkar ingatannya.</p>
    </div>

  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, onMounted, watch } from 'vue'

const name = ref('')
const url = ref('')
const file = ref(null)
const fileInput = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')

// States untuk Tabel Dokumen
const documents = ref([])
const documentsLoading = ref(false)

// State untuk searching & sorting
const searchQuery = ref('')
const sortKey = ref('id')
const sortDesc = ref(true)

// State untuk pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)

// States untuk Modal Edit
const showModal = ref(false)
const editLoading = ref(false)
const editError = ref('')
const editForm = ref({ id: null, name: '', url: '' })

// State untuk Loading Hapus
const deleteLoading = ref(false)

const handleFileChange = (e) => {
  if (e.target.files.length > 0) {
    file.value = e.target.files[0]
  } else {
    file.value = null
  }
}

// ... keeping existing methods intact until deleteDocument ...

const formatDate = (isoString) => {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const fetchDocuments = async () => {
  documentsLoading.value = true
  try {
    const { data } = await axios.get('/api/v1/documents')
    documents.value = data
  } catch (err) {
    console.error("Gagal mengambil daftar dokumen:", err)
  } finally {
    documentsLoading.value = false
  }
}

onMounted(() => {
  fetchDocuments()
})

// Logic untuk Searching & Sorting
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortKey.value = key
    sortDesc.value = true
  }
}

const sortedAndFilteredDocs = computed(() => {
  let result = documents.value

  // Searching
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(d => 
      d.name.toLowerCase().includes(q) || 
      (d.url && d.url.toLowerCase().includes(q))
    )
  }

  // Sorting
  result = result.slice().sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]
    
    if (sortKey.value === 'created_at') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase()
      valB = valB.toLowerCase()
    }
    
    if (valA < valB) return sortDesc.value ? 1 : -1
    if (valA > valB) return sortDesc.value ? -1 : 1
    return 0
  })

  return result
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const totalPages = computed(() => {
  return Math.ceil(sortedAndFilteredDocs.value.length / itemsPerPage.value)
})

const paginatedDocs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedAndFilteredDocs.value.slice(start, end)
})

const submitForm = async () => {
  if (!file.value || !name.value.trim()) return

  loading.value = true
  error.value = ''
  success.value = ''

  const formData = new FormData()
  formData.append('file', file.value)
  formData.append('name', name.value.trim())
  if (url.value.trim()) {
    formData.append('url', url.value.trim())
  }

  try {
    const { data } = await axios.post('/api/v1/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 180000 
    })
    success.value = `Berhasil! Dokumen "${name.value}" siap digunakan. (Total ${data.chunks_added} blok teks diekstrak)`
    
    // Reset form
    name.value = ''
    url.value = ''
    file.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    fetchDocuments()
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      error.value = 'Request timeout. Sistem mungkin sedang mengunduh model offline.'
    } else {
      error.value = err.response?.data?.detail || 'Gagal terhubung ke server.'
    }
  } finally {
    loading.value = false
  }
}

// Modal Logic
const openEditModal = (doc) => {
  editForm.value = { id: doc.id, name: doc.name, url: doc.url || '' }
  editError.value = ''
  showModal.value = true
}

const closeEditModal = () => {
  showModal.value = false
  editForm.value = { id: null, name: '', url: '' }
}

const submitEdit = async () => {
  editLoading.value = true
  editError.value = ''
  try {
    await axios.put(`/api/v1/documents/${editForm.value.id}`, {
      name: editForm.value.name,
      url: editForm.value.url
    })
    closeEditModal()
    fetchDocuments() // Refresh data table
  } catch (err) {
    editError.value = err.response?.data?.detail || 'Gagal menyimpan perubahan.'
  } finally {
    editLoading.value = false
  }
}

const deleteDocument = async (id, name) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${name}"? Ini akan menghapus referensi AI secara permanen.`)) return
  
  deleteLoading.value = true
  try {
    await axios.delete(`/api/v1/documents/${id}`)
    await fetchDocuments()
    setTimeout(() => {
      alert(`Berhasil! Dokumen "${name}" telah dihapus secara permanen dari sistem.`)
    }, 100)
  } catch (err) {
    alert(err.response?.data?.detail || 'Gagal menghapus dokumen.')
  } finally {
    deleteLoading.value = false
  }
}
</script>
