<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 transition-all">
      
      <!-- Brand & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-4 shadow-inner">
          <span class="text-3xl">🏥</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Admin Portal
        </h2>
        <p class="text-sm text-gray-500 mt-2">
          Sistem Pendukung Keputusan Klinis (DiagnoX CDSS)
        </p>
      </div>

      <!-- Error Alert -->
      <div 
        v-if="error" 
        class="mb-6 p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200 flex items-start space-x-3"
      >
        <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label for="username" class="block text-sm font-semibold text-gray-700 mb-1.5">
            Username
          </label>
          <div class="relative rounded-lg shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input 
              v-model.trim="form.username"
              type="text" 
              id="username" 
              required 
              autocomplete="username"
              class="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              placeholder="Masukkan username admin"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-semibold text-gray-700 mb-1.5">
            Password
          </label>
          <div class="relative rounded-lg shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              required 
              autocomplete="current-password"
              class="w-full pl-11 pr-11 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              placeholder="Masukkan password admin"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              tabindex="-1"
            >
              <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-150 ease-in-out mt-2"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span v-if="loading">Memverifikasi...</span>
          <span v-else>Masuk ke Dashboard</span>
        </button>
      </form>

      <!-- Demo Credentials Helper -->
      <div class="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-800">
        <p class="font-semibold flex items-center gap-1.5 mb-1">
          <span>ℹ️</span> Kredensial Demo Admin:
        </p>
        <p class="text-indigo-700">
          Username: <code class="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">admin</code>
          &nbsp;|&nbsp;
          Password: <code class="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">admin123</code>
        </p>
      </div>

      <!-- Back to User View -->
      <div class="mt-6 text-center">
        <router-link 
          to="/" 
          class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Halaman Pasien
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // Simulasi delay autentikasi
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Autentikasi kredensial admin
    if (form.username === 'admin' && form.password === 'admin123') {
      localStorage.setItem('admin_token', 'diagno-admin-session-active')
      localStorage.setItem('admin_user', form.username)
      
      const target = (route.query.redirect && typeof route.query.redirect === 'string') 
        ? route.query.redirect 
        : '/admin'
      
      router.push(target)
    } else {
      error.value = 'Username atau password tidak valid. Silakan periksa kembali.'
    }
  } catch (err) {
    error.value = 'Terjadi kesalahan sistem saat mencoba login. Silakan coba beberapa saat lagi.'
  } finally {
    loading.value = false
  }
}
</script>
